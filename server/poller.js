import cron from 'node-cron'
import cache from './cache.js'
import getGoogleTrends from './services/googleTrends.js'
import getYoutubeTrends from './services/youtubeService.js'
import { createRssSource } from './services/rssService.js'
import getRedditTrends from './services/redditService.js'
import getTwitterTrends from './services/twitterService.js'
import getTiktokTrends from './services/tiktokService.js'
import getInstagramTrends from './services/instagramService.js'
import { buildArcChains, chainsToArcs } from './services/arcEngine.js'

const SOURCE_COLORS = {
  google:    '#3B82F6',
  youtube:   '#EF4444',
  bbc:       '#1D4ED8',
  euronews:  '#F59E0B',
  guardian:  '#059669',
  nypost:    '#DC2626',
  aljazeera: '#D97706',
  reddit:    '#F97316',
  twitter:   '#06B6D4',
  tiktok:    '#EC4899',
  instagram: '#A855F7',
}

const getBbcTrends       = createRssSource({ feedUrl: 'https://feeds.bbci.co.uk/news/world/rss.xml', sourceKey: 'bbc' })
const getEuronewsTrends  = createRssSource({ feedUrl: 'https://www.euronews.com/rss',                sourceKey: 'euronews' })
const getGuardianTrends  = createRssSource({ feedUrl: 'https://www.theguardian.com/world/rss',       sourceKey: 'guardian' })
const getNypostTrends    = createRssSource({ feedUrl: 'https://nypost.com/world-news/feed/',          sourceKey: 'nypost' })
const getAljazeeraTrends = createRssSource({ feedUrl: 'https://www.aljazeera.com/xml/rss/all.xml',   sourceKey: 'aljazeera' })

const SOURCES = [
  { key: 'google',    fn: getGoogleTrends },
  { key: 'youtube',   fn: getYoutubeTrends },
  { key: 'bbc',       fn: getBbcTrends },
  { key: 'euronews',  fn: getEuronewsTrends },
  { key: 'guardian',  fn: getGuardianTrends },
  { key: 'nypost',    fn: getNypostTrends },
  { key: 'aljazeera', fn: getAljazeeraTrends },
  { key: 'reddit',    fn: getRedditTrends },
  { key: 'twitter',   fn: getTwitterTrends },
  { key: 'tiktok',    fn: getTiktokTrends },
  { key: 'instagram', fn: getInstagramTrends },
]

const pollAll = async () => {
  const results = await Promise.allSettled(SOURCES.map(({ fn }) => fn()))

  results.forEach((result, i) => {
    const { key } = SOURCES[i]
    if (result.status === 'fulfilled' && result.value.length > 0) {
      cache.set(key, result.value)
      console.info(`[poller] ${key}: ${result.value.length} items cached`)
    } else {
      const reason = result.status === 'rejected' ? result.reason?.message : 'empty result'
      console.warn(`[poller] ${key}: failed — ${reason}`)
    }
  })

  // Compute arcs once per cycle across all cached items with coordinates.
  // O(n²) over ~100-250 items — runs server-side so clients fetch pre-computed arcs.
  const allItems = SOURCES.flatMap(({ key }) => {
    const entry = cache.get(key)
    return entry ? entry.data : []
  }).filter(d => d.lat && d.lng)

  const itemsById = new Map(allItems.map(item => [item.id, item]))
  const chains = buildArcChains(allItems)
  const arcs = chainsToArcs(chains, itemsById, SOURCE_COLORS)
  cache.set('arcs', arcs)
  console.info(`[poller] arcs: ${arcs.length} segments from ${chains.length} chains`)
}

export const startPoller = () => {
  // Fire immediately so data is available before first client request
  pollAll()
  cron.schedule('*/60 * * * * *', pollAll)
}
