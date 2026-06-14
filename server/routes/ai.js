import { Router } from 'express'
import Groq from 'groq-sdk'
import { body, validationResult } from 'express-validator'
import { aiLimiter } from '../middleware/rateLimiter.js'
import cache from '../cache.js'

const router = Router()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const systemPrompt = `You are PULSE, an intelligence analyst assistant embedded in a \
real-time global trend visualization platform. Data from Google Trends and YouTube is live. \
Reddit, GDELT, X/Twitter, TikTok, and Instagram data is simulated for demonstration purposes. \
Be concise, precise, and analytical. Always cite sources. \
Return JSON only — no markdown, no code fences: \
{ "answer": string, "confidence": 0-100, "citations": [{"title": string, "url": string, "source": string}], "followUps": [string, string, string] }`

const validate = [
  body('query').trim().isString().isLength({ min: 1, max: 500 }).withMessage('Query must be 1–500 characters.'),
  body('region').optional().trim().isString(),
  body('timeRange').optional().trim().isString(),
  body('activeSources').optional().isArray(),
  body('activeTags').optional().isArray(),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    next()
  },
]

router.post('/', aiLimiter, validate, async (req, res) => {
  const {
    query,
    region = 'Global',
    timeRange = '24h',
    activeSources = [],
    activeTags = [],
  } = req.body

  const trendsEntry = cache.getWithMeta('trends')
  const allTrends = trendsEntry ? (trendsEntry.data ?? []) : []

  const regionTrends = allTrends
    .filter((t) => region === 'Global' || (t.region ?? '').toLowerCase().includes(region.toLowerCase()))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5)

  const globalTop = [...allTrends]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5)

  const tagLabels = Array.isArray(activeTags)
    ? activeTags.map((t) => (typeof t === 'string' ? t : t.label)).filter(Boolean)
    : []

  const userPrompt = `
Current context:
- Active region: ${region}
- Time range: ${timeRange}
- Active sources: ${activeSources.length ? activeSources.join(', ') : 'all'}
- Active topic/region filters: ${tagLabels.length ? tagLabels.join(', ') : 'none'}
- Top trends in region: ${JSON.stringify(regionTrends)}
- Global top trends: ${JSON.stringify(globalTop)}

User question: ${query}
`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const raw = completion.choices[0]?.message?.content ?? ''
    // Strip markdown code fences if the model wraps the JSON anyway
    const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()

    let parsed
    try {
      parsed = JSON.parse(stripped)
    } catch {
      parsed = {
        answer: raw,
        confidence: 50,
        citations: [],
        followUps: [
          'What are the most viral trends globally right now?',
          'Which regions are seeing the most social activity?',
          'How has this story evolved over the past 24 hours?',
        ],
      }
    }

    res.json(parsed)
  } catch (error) {
    console.error('Groq API error:', error.message)
    res.status(500).json({ error: 'AI query failed. Please try again.' })
  }
})

export default router
