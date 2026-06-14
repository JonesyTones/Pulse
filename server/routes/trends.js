import { Router } from 'express'
import cache from '../cache.js'
import getRedditTrends from '../services/redditService.js'
import getGdeltTrends from '../services/gdeltService.js'
import getTwitterTrends from '../services/twitterService.js'
import getTiktokTrends from '../services/tiktokService.js'
import getInstagramTrends from '../services/instagramService.js'

const router = Router()

const SOURCE_KEYS = ['google', 'youtube', 'reddit', 'gdelt', 'twitter', 'tiktok', 'instagram']

// Minimal fallback so the frontend never receives empty state on first load
const buildFallback = async () => {
  const [reddit, gdelt, twitter, tiktok, instagram] = await Promise.allSettled([
    getRedditTrends(),
    getGdeltTrends(),
    getTwitterTrends(),
    getTiktokTrends(),
    getInstagramTrends(),
  ])
  return [
    ...(reddit.status    === 'fulfilled' ? reddit.value    : []),
    ...(gdelt.status     === 'fulfilled' ? gdelt.value     : []),
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

  // If cache is completely empty (server just started), return mock fallback
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

  // Use the most recent timestamp across all entries
  const lastUpdated = merged[0]?.timestamp ?? new Date().toISOString()

  res.json({ data: merged, lastUpdated, sources })
})

export default router
