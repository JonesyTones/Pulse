import { tokenize, jaccardSimilarity, itemSimilarity } from './similarity.js'

const WEIGHTS = {
  keyword: 0.4,
  region: 0.3,
  recency: 0.2,
  volume: 0.1
}

const DIM_THRESHOLD = 0.25 // below this, pins dim to opacity 0.2 per spec
const RECENCY_FULL_SCORE_HOURS = 3   // items newer than this score ~1.0 on recency
const RECENCY_ZERO_SCORE_HOURS = 48  // items older than this score ~0 on recency

/**
 * Recency score: 1.0 if very fresh, decaying linearly to 0 by 48h old.
 */
function recencyScore(timestamp) {
  const ageMs = Date.now() - new Date(timestamp).getTime()
  const ageHours = ageMs / (1000 * 60 * 60)
  if (ageHours <= RECENCY_FULL_SCORE_HOURS) return 1
  if (ageHours >= RECENCY_ZERO_SCORE_HOURS) return 0
  const range = RECENCY_ZERO_SCORE_HOURS - RECENCY_FULL_SCORE_HOURS
  return 1 - ((ageHours - RECENCY_FULL_SCORE_HOURS) / range)
}

/**
 * Keyword match score: overlap between query/tag tokens and item's
 * topic+description tokens.
 */
function keywordScore(item, queryTokens) {
  if (queryTokens.length === 0) return 0
  const itemTokens = tokenize(item.topic + ' ' + (item.metadata?.description || ''))
  return jaccardSimilarity(queryTokens, itemTokens)
}

/**
 * Region match score: 1.0 if item's region matches an active region tag
 * (case-insensitive), 0 if it doesn't match, 0 if item has no region at
 * all (per spec: un-located items don't get excluded, they just can't
 * earn this portion of the score).
 */
function regionMatchScore(item, activeRegionTags) {
  if (activeRegionTags.length === 0) return 0
  if (!item.region) return 0
  const itemRegion = item.region.toLowerCase()
  return activeRegionTags.some(tag => tag.toLowerCase() === itemRegion) ? 1 : 0
}

/**
 * Volume score: derived from how many OTHER items in the current cache
 * are similar to this one (topic-cluster-size), normalized 0-1.
 * Reuses itemSimilarity — the same function arc logic uses.
 */
function computeVolumeScores(allItems, similarityThreshold = 0.2) {
  const scores = new Map()
  for (const item of allItems) {
    let clusterSize = 0
    for (const other of allItems) {
      if (other.id === item.id) continue
      if (itemSimilarity(item, other) >= similarityThreshold) clusterSize++
    }
    scores.set(item.id, clusterSize)
  }
  const maxCluster = Math.max(1, ...scores.values())
  const normalized = new Map()
  for (const [id, size] of scores) {
    normalized.set(id, size / maxCluster)
  }
  return normalized
}

/**
 * Score every item in allItems against the active query text + active
 * region tags. Returns items annotated with a `relevanceScore` (0-1)
 * and `dimmed` (bool, true if below DIM_THRESHOLD).
 *
 * If there's no active query and no active tags, per REQUIREMENTS.md
 * the relevance engine doesn't apply — return items unscored/undimmed.
 */
function scoreRelevance(allItems, { query = '', activeRegionTags = [] } = {}) {
  const hasActiveFilter = query.trim().length > 0 || activeRegionTags.length > 0
  if (!hasActiveFilter) {
    return allItems.map(item => ({ ...item, relevanceScore: null, dimmed: false }))
  }

  const queryTokens = tokenize(query)
  const volumeScores = computeVolumeScores(allItems)

  return allItems.map(item => {
    const kw = keywordScore(item, queryTokens)
    const region = regionMatchScore(item, activeRegionTags)
    const recency = recencyScore(item.timestamp)
    const volume = (volumeScores.get(item.id) || 0) // already normalized 0-1

    // Volume only contributes when the item has SOME baseline relevance
    // via keyword or region match — otherwise a large unrelated trending
    // cluster (e.g. a big ongoing story) could outscore a genuine but
    // less-clustered keyword match for what the user actually searched.
    const baselineRelevance = Math.max(kw, region)
    const effectiveVolume = baselineRelevance > 0 ? volume : 0

    const score =
      kw * WEIGHTS.keyword +
      region * WEIGHTS.region +
      recency * WEIGHTS.recency +
      effectiveVolume * WEIGHTS.volume

    return {
      ...item,
      relevanceScore: Math.round(score * 1000) / 1000,
      dimmed: score < DIM_THRESHOLD
    }
  })
}

export { scoreRelevance, recencyScore, keywordScore, regionMatchScore, computeVolumeScores }
