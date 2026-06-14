// PERMANENT MOCK — Reddit API not available

const POSTS = [
  { topic: 'Quantum computing breakthrough', region: 'San Francisco, USA', lat: 37.7749, lng: -122.4194, granularity: 'country', subreddit: 'r/technology', flair: 'Science' },
  { topic: 'Climate summit agreement', region: 'Berlin, Germany', lat: 52.52, lng: 13.405, granularity: 'continent', subreddit: 'r/worldnews', flair: 'Politics' },
  { topic: 'Housing market correction', region: 'Sydney, Australia', lat: -33.8688, lng: 151.2093, granularity: 'region', subreddit: 'r/australia', flair: 'Economy' },
  { topic: 'Universal basic income trial', region: 'Helsinki, Finland', lat: 60.1699, lng: 24.9384, granularity: 'country', subreddit: 'r/economics', flair: 'Policy' },
  { topic: 'Fusion energy milestone', region: 'Oxford, UK', lat: 51.752, lng: -1.2577, granularity: 'country', subreddit: 'r/futurology', flair: 'Science' },
  { topic: 'Street art festival', region: 'São Paulo, Brazil', lat: -23.5505, lng: -46.6333, granularity: 'region', subreddit: 'r/Art', flair: 'Culture' },
  { topic: 'New space telescope findings', region: 'Houston, USA', lat: 29.7604, lng: -95.3698, granularity: 'country', subreddit: 'r/space', flair: 'Science' },
  { topic: 'Open source AI model release', region: 'Toronto, Canada', lat: 43.6532, lng: -79.3832, granularity: 'country', subreddit: 'r/MachineLearning', flair: 'AI' },
  { topic: 'Record coral reef recovery', region: 'Brisbane, Australia', lat: -27.4698, lng: 153.0251, granularity: 'region', subreddit: 'r/environment', flair: 'Nature' },
  { topic: 'High-speed rail expansion', region: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, granularity: 'country', subreddit: 'r/urbanplanning', flair: 'Infrastructure' },
  { topic: 'Viral productivity hack', region: 'New York, USA', lat: 40.7128, lng: -74.006, granularity: 'region', subreddit: 'r/productivity', flair: 'Lifestyle' },
  { topic: 'Water scarcity solutions', region: 'Cape Town, South Africa', lat: -33.9249, lng: 18.4241, granularity: 'country', subreddit: 'r/environment', flair: 'Climate' },
]

const POST_TITLES = [
  'Scientists confirm {topic} — implications are massive',
  '{topic}: what nobody is talking about',
  'Breaking: {topic} changes everything we thought we knew',
  'I spent 6 months studying {topic}. Here is what I found.',
  '{topic} — the thread everyone needs to read',
  'Major development in {topic} announced today',
  'Why {topic} matters more than the news is letting on',
  '{topic}: an in-depth breakdown',
]

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

const getRedditTrends = async () => {
  const pool = shuffle(POSTS).slice(0, 8)

  return pool.map((post, i) => {
    const titleTemplate = POST_TITLES[Math.floor(Math.random() * POST_TITLES.length)]
    const postTitle = titleTemplate.replace('{topic}', post.topic)
    const upvotes = Math.floor(Math.random() * 60000) + 5000
    const commentCount = Math.floor(Math.random() * 3000) + 200
    const volume = Math.max(20, Math.min(100, Math.round((upvotes / 65000) * 100)))

    return {
      id: `reddit-${i}-${Date.now()}`,
      source: 'reddit',
      topic: post.topic,
      lat: post.lat + (Math.random() - 0.5) * 0.5,
      lng: post.lng + (Math.random() - 0.5) * 0.5,
      region: post.region,
      volume,
      granularity: post.granularity,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString(),
      url: `https://reddit.com/${post.subreddit}`,
      metadata: {
        subreddit: post.subreddit,
        postTitle,
        upvotes,
        commentCount,
        flair: post.flair,
      },
    }
  })
}

export default getRedditTrends
