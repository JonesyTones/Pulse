import 'dotenv/config'
import express from 'express'
import { applySecureHeaders } from './middleware/secureHeaders.js'
import corsMiddleware from './middleware/cors.js'
import { generalLimiter } from './middleware/rateLimiter.js'
import { startPoller } from './poller.js'
import cache from './cache.js'
import trendsRouter from './routes/trends.js'
import youtubeRouter from './routes/youtube.js'
import redditRouter from './routes/reddit.js'
import gdeltRouter from './routes/gdelt.js'
import twitterRouter from './routes/twitter.js'
import tiktokRouter from './routes/tiktok.js'
import instagramRouter from './routes/instagram.js'
import aiRouter from './routes/ai.js'

const app = express()

applySecureHeaders(app)
app.use(corsMiddleware)
app.use(express.json())
app.use('/api', generalLimiter)

app.use('/api/trends',   trendsRouter)
app.use('/api/youtube',  youtubeRouter)
app.use('/api/reddit',   redditRouter)
app.use('/api/gdelt',    gdeltRouter)
app.use('/api/twitter',  twitterRouter)
app.use('/api/tiktok',   tiktokRouter)
app.use('/api/instagram', instagramRouter)
app.use('/api/ai',       aiRouter)

const SOURCE_KEYS = ['google', 'youtube', 'reddit', 'gdelt', 'twitter', 'tiktok', 'instagram']

app.get('/api/health', (req, res) => {
  const sources = Object.fromEntries(
    SOURCE_KEYS.map((key) => {
      const entry = cache.get(key)
      return [key, entry ? entry.data.length : 0]
    })
  )
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    sources,
  })
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`PULSE server running on port ${PORT}`)
  startPoller()
})
