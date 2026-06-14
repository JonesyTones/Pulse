import cron from 'node-cron'
import cache from './cache.js'
import getGoogleTrends from './services/googleTrends.js'
import getYoutubeTrends from './services/youtubeService.js'
import getRedditTrends from './services/redditService.js'
import getGdeltTrends from './services/gdeltService.js'
import getTwitterTrends from './services/twitterService.js'
import getTiktokTrends from './services/tiktokService.js'
import getInstagramTrends from './services/instagramService.js'

const SOURCES = [
  { key: 'google',    fn: getGoogleTrends },
  { key: 'youtube',   fn: getYoutubeTrends },
  { key: 'reddit',    fn: getRedditTrends },
  { key: 'gdelt',     fn: getGdeltTrends },
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
      console.log(`[poller] ${key}: ${result.value.length} items cached`)
    } else {
      const reason = result.status === 'rejected' ? result.reason?.message : 'empty result'
      console.warn(`[poller] ${key}: failed — ${reason}`)
    }
  })
}

export const startPoller = () => {
  // Fire immediately so data is available before first client request
  pollAll()
  cron.schedule('*/60 * * * * *', pollAll)
}
