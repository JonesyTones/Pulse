import googleTrends from 'google-trends-api'
import cache from '../cache.js'

const GEO_COORDS = {
  US: { lat: 37.0902, lng: -95.7129, region: 'United States' },
  GB: { lat: 55.3781, lng: -3.4360,  region: 'United Kingdom' },
  IN: { lat: 20.5937, lng: 78.9629,  region: 'India' },
  BR: { lat: -14.235, lng: -51.925,  region: 'Brazil' },
  DE: { lat: 51.1657, lng: 10.4515,  region: 'Germany' },
  JP: { lat: 36.2048, lng: 138.2529, region: 'Japan' },
  AU: { lat: -25.274, lng: 133.775,  region: 'Australia' },
  ZA: { lat: -30.559, lng: 22.9375,  region: 'South Africa' },
}

const REGION_CODES = Object.keys(GEO_COORDS)

const parseTrends = (raw, geo) => {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    const stories = parsed?.default?.trendingSearchesDays?.[0]?.trendingSearches ?? []
    const { lat, lng, region } = GEO_COORDS[geo]

    return stories.slice(0, 3).map((story, i) => {
      const title = story.title?.query ?? story.title ?? 'Unknown Trend'
      const relatedQueries = (story.relatedQueries ?? []).map((q) => q.query).filter(Boolean)
      const trendingStories = (story.articles ?? []).slice(0, 2).map((a) => ({
        title: a.title,
        url: a.url,
        source: a.source,
      }))

      return {
        id: `google-${geo.toLowerCase()}-${Date.now()}-${i}`,
        source: 'google',
        topic: title,
        lat,
        lng,
        region,
        volume: Math.max(10, 100 - i * 12),
        granularity: 'country',
        timestamp: new Date().toISOString(),
        url: `https://trends.google.com/trends/trendingsearches/daily?geo=${geo}`,
        metadata: { relatedQueries, trendingStories },
      }
    })
  } catch {
    return []
  }
}

const getGoogleTrends = async () => {
  try {
    const results = await Promise.allSettled(
      REGION_CODES.map((geo) =>
        googleTrends.dailyTrends({ geo, hl: 'en-US' }).then((raw) => parseTrends(raw, geo))
      )
    )

    const merged = results
      .filter((r) => r.status === 'fulfilled')
      .flatMap((r) => r.value)

    if (merged.length > 0) {
      cache.set('google', merged)
      return merged
    }

    // Fall back to last cached result if all requests failed
    const cached = cache.get('google')
    return cached ? cached.data : []
  } catch {
    const cached = cache.get('google')
    return cached ? cached.data : []
  }
}

export default getGoogleTrends
