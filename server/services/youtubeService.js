import axios from 'axios'
import cache from '../cache.js'

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3/videos'

const REGION_COORDS = {
  US: { lat: 37.0902, lng: -95.7129, region: 'United States' },
  GB: { lat: 55.3781, lng: -3.4360,  region: 'United Kingdom' },
  IN: { lat: 20.5937, lng: 78.9629,  region: 'India' },
  BR: { lat: -14.235, lng: -51.925,  region: 'Brazil' },
  DE: { lat: 51.1657, lng: 10.4515,  region: 'Germany' },
  JP: { lat: 36.2048, lng: 138.2529, region: 'Japan' },
  AU: { lat: -25.274, lng: 133.775,  region: 'Australia' },
  ZA: { lat: -30.559, lng: 22.9375,  region: 'South Africa' },
}

const REGION_CODES = Object.keys(REGION_COORDS)

const fetchRegion = async (regionCode, apiKey) => {
  const response = await axios.get(YOUTUBE_API_BASE, {
    params: {
      part: 'snippet,statistics',
      chart: 'mostPopular',
      regionCode,
      maxResults: 3,
      key: apiKey,
    },
    timeout: 8000,
  })

  const { lat, lng, region } = REGION_COORDS[regionCode]

  return (response.data.items ?? []).map((item, i) => {
    const stats = item.statistics ?? {}
    const viewCount = parseInt(stats.viewCount ?? '0', 10)
    const volume = Math.min(100, Math.round((viewCount / 5_000_000) * 100))

    return {
      id: `youtube-${regionCode.toLowerCase()}-${item.id}-${i}`,
      source: 'youtube',
      topic: item.snippet?.title ?? 'Trending Video',
      lat,
      lng,
      region,
      volume: Math.max(10, volume),
      granularity: 'country',
      timestamp: new Date().toISOString(),
      url: `https://youtube.com/watch?v=${item.id}`,
      metadata: {
        videoId: item.id,
        channelTitle: item.snippet?.channelTitle ?? '',
        viewCount: parseInt(stats.viewCount ?? '0', 10),
        likeCount: parseInt(stats.likeCount ?? '0', 10),
        thumbnailUrl: item.snippet?.thumbnails?.medium?.url ?? '',
      },
    }
  })
}

const getYoutubeTrends = async () => {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    const cached = cache.get('youtube')
    return cached ? cached.data : []
  }

  try {
    const results = await Promise.allSettled(
      REGION_CODES.map((code) => fetchRegion(code, apiKey))
    )

    const merged = results
      .filter((r) => r.status === 'fulfilled')
      .flatMap((r) => r.value)

    if (merged.length > 0) {
      cache.set('youtube', merged)
      return merged
    }

    const cached = cache.get('youtube')
    return cached ? cached.data : []
  } catch {
    // Quota exceeded or network error — return last cached result
    const cached = cache.get('youtube')
    return cached ? cached.data : []
  }
}

export default getYoutubeTrends
