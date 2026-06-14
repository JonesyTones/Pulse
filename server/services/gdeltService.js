// PERMANENT MOCK — GDELT API unreliable

const EVENTS = [
  { topic: 'G20 emergency summit convenes', region: 'New Delhi, India', lat: 28.6139, lng: 77.209, granularity: 'continent', eventCode: 'MEET', themes: ['ECON_TRADE', 'GOV_COOPERATION'] },
  { topic: 'Taiwan Strait naval exercise', region: 'Taipei, Taiwan', lat: 25.0478, lng: 121.5319, granularity: 'country', eventCode: 'THREATEN', themes: ['MILITARY', 'GEOPOLITICS'] },
  { topic: 'African Union ceasefire accord', region: 'Addis Ababa, Ethiopia', lat: 9.145, lng: 40.4897, granularity: 'continent', eventCode: 'AGREE', themes: ['PEACE', 'CONFLICT'] },
  { topic: 'Arctic shipping route opens', region: 'Tromsø, Norway', lat: 69.6489, lng: 18.9551, granularity: 'continent', eventCode: 'COOPERATE', themes: ['CLIMATE', 'TRADE'] },
  { topic: 'Earthquake relief operations', region: 'Istanbul, Turkey', lat: 41.0082, lng: 28.9784, granularity: 'country', eventCode: 'AID', themes: ['DISASTER', 'HUMANITARIAN'] },
  { topic: 'South China Sea sovereignty dispute', region: 'Manila, Philippines', lat: 14.5995, lng: 120.9842, granularity: 'continent', eventCode: 'PROTEST', themes: ['GEOPOLITICS', 'LAW'] },
  { topic: 'Global inflation data released', region: 'Washington D.C., USA', lat: 38.9072, lng: -77.0369, granularity: 'continent', eventCode: 'STATEMENT', themes: ['ECON_INFLATION', 'POLICY'] },
  { topic: 'Refugee crisis on Mediterranean route', region: 'Rome, Italy', lat: 41.9028, lng: 12.4964, granularity: 'continent', eventCode: 'AID', themes: ['MIGRATION', 'HUMANITARIAN'] },
  { topic: 'BRICS currency proposal advances', region: 'Johannesburg, South Africa', lat: -26.2041, lng: 28.0473, granularity: 'continent', eventCode: 'COOPERATE', themes: ['ECON_CURRENCY', 'GEOPOLITICS'] },
  { topic: 'Cyclone makes landfall', region: 'Dhaka, Bangladesh', lat: 23.8103, lng: 90.4125, granularity: 'country', eventCode: 'NATURAL_DISASTER', themes: ['CLIMATE', 'DISASTER'] },
  { topic: 'Peace talks resume', region: 'Geneva, Switzerland', lat: 46.2044, lng: 6.1432, granularity: 'continent', eventCode: 'NEGOTIATE', themes: ['PEACE', 'DIPLOMACY'] },
  { topic: 'Sovereign debt restructuring', region: 'Nairobi, Kenya', lat: -1.2921, lng: 36.8219, granularity: 'continent', eventCode: 'STATEMENT', themes: ['ECON_DEBT', 'POLICY'] },
]

const IMAGE_URLS = [
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400',
  'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=400',
  'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=400',
  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400',
]

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

const getGdeltTrends = async () => {
  const pool = shuffle(EVENTS).slice(0, 8)

  return pool.map((event, i) => {
    const tone = parseFloat((Math.random() * 8 - 5).toFixed(1))
    const numArticles = Math.floor(Math.random() * 400) + 50
    const volume = Math.max(20, Math.min(100, Math.round((numArticles / 450) * 100)))

    return {
      id: `gdelt-${i}-${Date.now()}`,
      source: 'gdelt',
      topic: event.topic,
      lat: event.lat + (Math.random() - 0.5) * 0.3,
      lng: event.lng + (Math.random() - 0.5) * 0.3,
      region: event.region,
      volume,
      granularity: event.granularity,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 7200000)).toISOString(),
      url: 'https://gdeltproject.org',
      metadata: {
        tone,
        themes: event.themes,
        imageUrl: IMAGE_URLS[Math.floor(Math.random() * IMAGE_URLS.length)],
      },
    }
  })
}

export default getGdeltTrends
