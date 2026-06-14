// PERMANENT MOCK — TikTok Research API restricted

const TRENDS = [
  { topic: '#BerlinNightlife challenge', region: 'Berlin, Germany', lat: 52.52, lng: 13.405, granularity: 'country', sound: 'Club Beats Vol. 3' },
  { topic: '#MumbaiStreetFood tour', region: 'Mumbai, India', lat: 19.076, lng: 72.8777, granularity: 'region', sound: 'Bollywood Mix 2026' },
  { topic: '#30DayFitness transformation', region: 'Los Angeles, USA', lat: 34.0522, lng: -118.2437, granularity: 'country', sound: 'Motivational Anthem' },
  { topic: '#StudyWithMe lofi series', region: 'Seoul, South Korea', lat: 37.5665, lng: 126.978, granularity: 'country', sound: 'Lofi Study Beats' },
  { topic: '#ParysFashionWeek highlights', region: 'Paris, France', lat: 48.8566, lng: 2.3522, granularity: 'continent', sound: 'Runway Mix SS26' },
  { topic: '#NatureHeals forest bathing', region: 'Kyoto, Japan', lat: 35.0116, lng: 135.7681, granularity: 'region', sound: 'Ambient Forest Sounds' },
  { topic: '#AfrobeatsDance challenge', region: 'Lagos, Nigeria', lat: 6.5244, lng: 3.3792, granularity: 'continent', sound: 'Afrobeats Summer 2026' },
  { topic: '#RecipeReveal pasta hack', region: 'Rome, Italy', lat: 41.9028, lng: 12.4964, granularity: 'country', sound: 'Cooking With Love' },
  { topic: '#DigitalNomad life reacts', region: 'Bali, Indonesia', lat: -8.3405, lng: 115.092, granularity: 'region', sound: 'Chill Vibes Remix' },
  { topic: '#GreenEnergy tiny home build', region: 'Portland, USA', lat: 45.5152, lng: -122.6784, granularity: 'region', sound: 'DIY Toolkit' },
  { topic: '#SkateboardTricks compilation', region: 'Barcelona, Spain', lat: 41.3851, lng: 2.1734, granularity: 'country', sound: 'Skate or Die Punk Mix' },
  { topic: '#LocalHeroes community story', region: 'Nairobi, Kenya', lat: -1.2921, lng: 36.8219, granularity: 'continent', sound: 'Inspiration Rises' },
]

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

const getTiktokTrends = async () => {
  const pool = shuffle(TRENDS).slice(0, 8)

  return pool.map((item, i) => {
    const videoCount = Math.floor(Math.random() * 500000) + 10000
    const totalViews = videoCount * (Math.floor(Math.random() * 1200) + 300)
    const creatorCount = Math.floor(Math.random() * 50000) + 1000
    const volume = Math.max(20, Math.min(100, Math.round((videoCount / 550000) * 100)))

    return {
      id: `tiktok-${i}-${Date.now()}`,
      source: 'tiktok',
      topic: item.topic,
      lat: item.lat + (Math.random() - 0.5) * 0.6,
      lng: item.lng + (Math.random() - 0.5) * 0.6,
      region: item.region,
      volume,
      granularity: item.granularity,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString(),
      url: `https://tiktok.com/tag/${item.topic.replace(/^#/, '').replace(/\s/g, '')}`,
      metadata: {
        videoCount,
        totalViews,
        topSound: item.sound,
        creatorCount,
      },
    }
  })
}

export default getTiktokTrends
