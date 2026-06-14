// PERMANENT MOCK — Instagram/Meta API not available

const TRENDS = [
  { topic: '#SunsetPhotography', region: 'Santorini, Greece', lat: 36.3932, lng: 25.4615, granularity: 'country', contentType: 'photo', hashtags: ['#SunsetPhotography', '#GoldenHour', '#Greece'] },
  { topic: '#SustainableFashion week', region: 'Copenhagen, Denmark', lat: 55.6761, lng: 12.5683, granularity: 'continent', contentType: 'reel', hashtags: ['#SustainableFashion', '#SlowFashion', '#EcoStyle'] },
  { topic: '#UrbanGardening movement', region: 'Singapore', lat: 1.3521, lng: 103.8198, granularity: 'country', contentType: 'reel', hashtags: ['#UrbanGardening', '#GreenCity', '#PlantParent'] },
  { topic: '#NightMarket food crawl', region: 'Bangkok, Thailand', lat: 13.7563, lng: 100.5018, granularity: 'region', contentType: 'reel', hashtags: ['#NightMarket', '#StreetFood', '#Bangkok'] },
  { topic: '#MinimalistLiving aesthetic', region: 'Stockholm, Sweden', lat: 59.3293, lng: 18.0686, granularity: 'country', contentType: 'photo', hashtags: ['#Minimalist', '#MinimalistHome', '#CleanAesthetic'] },
  { topic: '#ArtBasel Miami highlights', region: 'Miami, USA', lat: 25.7617, lng: -80.1918, granularity: 'country', contentType: 'reel', hashtags: ['#ArtBasel', '#ContemporaryArt', '#Miami'] },
  { topic: '#SourdoughBread revival', region: 'Portland, USA', lat: 45.5152, lng: -122.6784, granularity: 'region', contentType: 'reel', hashtags: ['#Sourdough', '#Bread', '#BakingTok'] },
  { topic: '#KimonoCulture day', region: 'Kyoto, Japan', lat: 35.0116, lng: 135.7681, granularity: 'country', contentType: 'photo', hashtags: ['#Kimono', '#JapaneseCulture', '#TraditionalStyle'] },
  { topic: '#MuralArt street takeover', region: 'Mexico City, Mexico', lat: 19.4326, lng: -99.1332, granularity: 'country', contentType: 'reel', hashtags: ['#MuralArt', '#StreetArt', '#MexicoCity'] },
  { topic: '#TravelReels summer edition', region: 'Lisbon, Portugal', lat: 38.7223, lng: -9.1393, granularity: 'continent', contentType: 'reel', hashtags: ['#TravelReels', '#Lisbon', '#EuroTrip'] },
  { topic: '#BeachWellness retreat', region: 'Tulum, Mexico', lat: 20.2114, lng: -87.4654, granularity: 'region', contentType: 'photo', hashtags: ['#BeachWellness', '#Yoga', '#Tulum'] },
  { topic: '#AfricanArt showcase', region: 'Lagos, Nigeria', lat: 6.5244, lng: 3.3792, granularity: 'continent', contentType: 'photo', hashtags: ['#AfricanArt', '#AfricanCreatives', '#Lagos'] },
]

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

const getInstagramTrends = async () => {
  const pool = shuffle(TRENDS).slice(0, 8)

  return pool.map((item, i) => {
    const postCount = Math.floor(Math.random() * 300000) + 20000
    const totalLikes = postCount * (Math.floor(Math.random() * 80) + 20)
    const volume = Math.max(20, Math.min(100, Math.round((postCount / 330000) * 100)))

    return {
      id: `instagram-${i}-${Date.now()}`,
      source: 'instagram',
      topic: item.topic,
      lat: item.lat + (Math.random() - 0.5) * 0.5,
      lng: item.lng + (Math.random() - 0.5) * 0.5,
      region: item.region,
      volume,
      granularity: item.granularity,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 5400000)).toISOString(),
      url: `https://instagram.com/explore/tags/${item.hashtags[0].replace('#', '')}`,
      metadata: {
        postCount,
        totalLikes,
        topHashtags: item.hashtags,
        contentType: item.contentType,
      },
    }
  })
}

export default getInstagramTrends
