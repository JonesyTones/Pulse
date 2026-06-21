import { Router } from 'express'
import cache from '../cache.js'
import { createRssSource } from '../services/rssService.js'
import getRedditTrends from '../services/redditService.js'
import getTwitterTrends from '../services/twitterService.js'
import getTiktokTrends from '../services/tiktokService.js'
import getInstagramTrends from '../services/instagramService.js'

const router = Router()

const SOURCE_KEYS = [
  'google', 'youtube',
  'bbc', 'euronews', 'guardian', 'nypost', 'aljazeera',
  'reddit', 'twitter', 'tiktok', 'instagram',
]

// Minimal fallback so the frontend never receives empty state on cold start
const buildFallback = async () => {
  const getBbc       = createRssSource({ feedUrl: 'https://feeds.bbci.co.uk/news/world/rss.xml', sourceKey: 'bbc' })
  const getEuronews  = createRssSource({ feedUrl: 'https://www.euronews.com/rss',                sourceKey: 'euronews' })
  const getGuardian  = createRssSource({ feedUrl: 'https://www.theguardian.com/world/rss',       sourceKey: 'guardian' })

  const [bbc, euronews, guardian, reddit, twitter, tiktok, instagram] = await Promise.allSettled([
    getBbc(),
    getEuronews(),
    getGuardian(),
    getRedditTrends(),
    getTwitterTrends(),
    getTiktokTrends(),
    getInstagramTrends(),
  ])

  return [
    ...(bbc.status       === 'fulfilled' ? bbc.value       : []),
    ...(euronews.status  === 'fulfilled' ? euronews.value  : []),
    ...(guardian.status  === 'fulfilled' ? guardian.value  : []),
    ...(reddit.status    === 'fulfilled' ? reddit.value    : []),
    ...(twitter.status   === 'fulfilled' ? twitter.value   : []),
    ...(tiktok.status    === 'fulfilled' ? tiktok.value    : []),
    ...(instagram.status === 'fulfilled' ? instagram.value : []),
  ]
}

router.get('/', async (req, res) => {
  const { source, granularity } = req.query

  // Merge all cached source arrays
  let merged = SOURCE_KEYS.flatMap((key) => {
    const entry = cache.get(key)
    return entry ? entry.data : []
  })

  // If cache is completely empty (server just started), return live fallback
  if (merged.length === 0) {
    merged = await buildFallback()
  }

  // Optional filters
  if (source) {
    merged = merged.filter((d) => d.source === source)
  }
  if (granularity) {
    merged = merged.filter((d) => d.granularity === granularity)
  }

  // Sort newest first
  merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  // Per-source counts using unfiltered cache
  const sources = Object.fromEntries(
    SOURCE_KEYS.map((key) => {
      const entry = cache.get(key)
      return [key, entry ? entry.data.length : 0]
    })
  )

  const lastUpdated = merged[0]?.timestamp ?? new Date().toISOString()

  const arcsEntry = cache.get('arcs')
  const arcs = arcsEntry ? arcsEntry.data : []

  res.json({ data: merged, lastUpdated, sources, arcs })
})

export default router
