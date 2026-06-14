// PERMANENT MOCK — X/Twitter API requires paid access

const TOPICS = [
  { topic: '#WorldCup2026', region: 'Global', lat: 0, lng: 0, granularity: 'continent', sentiment: 'positive', hashtags: ['#WorldCup2026', '#FIFA', '#Football'] },
  { topic: '#BreakingNews: Fed rate decision', region: 'New York, USA', lat: 40.7128, lng: -74.006, granularity: 'country', sentiment: 'negative', hashtags: ['#Fed', '#Economy', '#Rates'] },
  { topic: '#SolarEclipse2026', region: 'North America', lat: 45.0, lng: -100.0, granularity: 'continent', sentiment: 'positive', hashtags: ['#SolarEclipse2026', '#Eclipse', '#Astronomy'] },
  { topic: '#AIAct enforcement begins', region: 'Brussels, Belgium', lat: 50.8503, lng: 4.3517, granularity: 'continent', sentiment: 'neutral', hashtags: ['#AIAct', '#EU', '#Tech'] },
  { topic: '#ClimateAction global march', region: 'London, UK', lat: 51.5074, lng: -0.1278, granularity: 'country', sentiment: 'positive', hashtags: ['#ClimateAction', '#ClimateStrike'] },
  { topic: '#CryptoMarket all-time high', region: 'Singapore', lat: 1.3521, lng: 103.8198, granularity: 'country', sentiment: 'positive', hashtags: ['#Crypto', '#Bitcoin', '#BTC'] },
  { topic: '#ViralVideo overnight sensation', region: 'Seoul, South Korea', lat: 37.5665, lng: 126.978, granularity: 'country', sentiment: 'positive', hashtags: ['#Viral', '#Trending', '#KPop'] },
  { topic: '#HeatWave emergency declared', region: 'Madrid, Spain', lat: 40.4168, lng: -3.7038, granularity: 'country', sentiment: 'negative', hashtags: ['#HeatWave', '#ClimateChange', '#Spain'] },
  { topic: '#TechLayoffs wave continues', region: 'San Francisco, USA', lat: 37.7749, lng: -122.4194, granularity: 'region', sentiment: 'negative', hashtags: ['#TechLayoffs', '#BigTech', '#JobMarket'] },
  { topic: '#SpaceX Mars mission update', region: 'Cape Canaveral, USA', lat: 28.3922, lng: -80.6077, granularity: 'country', sentiment: 'positive', hashtags: ['#SpaceX', '#Mars', '#Starship'] },
  { topic: '#OlympicTrials results', region: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, granularity: 'country', sentiment: 'positive', hashtags: ['#Olympics', '#Athletics'] },
  { topic: '#EUElections voter turnout', region: 'Berlin, Germany', lat: 52.52, lng: 13.405, granularity: 'continent', sentiment: 'neutral', hashtags: ['#EUElections', '#Europe', '#Democracy'] },
]

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

const getTwitterTrends = async () => {
  const pool = shuffle(TOPICS).slice(0, 8)

  return pool.map((item, i) => {
    const tweetCount = Math.floor(Math.random() * 800000) + 50000
    const impressions = tweetCount * (Math.floor(Math.random() * 15) + 8)
    const volume = Math.max(20, Math.min(100, Math.round((tweetCount / 900000) * 100)))

    return {
      id: `twitter-${i}-${Date.now()}`,
      source: 'twitter',
      topic: item.topic,
      lat: item.lat + (Math.random() - 0.5) * 0.8,
      lng: item.lng + (Math.random() - 0.5) * 0.8,
      region: item.region,
      volume,
      granularity: item.granularity,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 1800000)).toISOString(),
      url: `https://x.com/search?q=${encodeURIComponent(item.hashtags[0])}`,
      metadata: {
        tweetCount,
        impressions,
        topHashtags: item.hashtags,
        sentiment: item.sentiment,
      },
    }
  })
}

export default getTwitterTrends
