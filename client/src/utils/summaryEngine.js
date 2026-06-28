// Source type bonuses — news RSS sources get a boost, trend/social sources get a penalty
const SOURCE_WEIGHTS = {
  bbc:       0.3,
  euronews:  0.3,
  guardian:  0.3,
  nypost:    0.3,
  aljazeera: 0.3,
  youtube:  -0.2,
  google:   -0.1,
  reddit:   -0.1,
  twitter:  -0.1,
  tiktok:   -0.1,
  instagram:-0.1,
}

const RECENCY_WEIGHT = 0.1 // tiebreaker only — can't carry an item on its own
const RECENCY_FULL_SCORE_HOURS = 3
const RECENCY_ZERO_SCORE_HOURS = 48

function recencyScore(timestamp) {
  const ageHours = (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60)
  if (ageHours <= RECENCY_FULL_SCORE_HOURS) return 1
  if (ageHours >= RECENCY_ZERO_SCORE_HOURS) return 0
  return 1 - ((ageHours - RECENCY_FULL_SCORE_HOURS) / (RECENCY_ZERO_SCORE_HOURS - RECENCY_FULL_SCORE_HOURS))
}

// Item qualifies if it has a resolved lat/lng from the geo-tagging pipeline.
// Items without a location score 0 on this axis — deprioritized, not excluded.
function hasQualifyingSignal(item) {
  return item.lat != null && item.lng != null
}

function scoreForSummary(item) {
  const sourceBonus = SOURCE_WEIGHTS[item.source] ?? 0
  const recency = recencyScore(item.timestamp) * RECENCY_WEIGHT
  const signal = hasQualifyingSignal(item) ? 0.5 : 0
  const raw = signal + recency + sourceBonus
  return Math.max(0, Math.min(1, raw))
}

function rankForSummary(allItems, topN = 10) {
  return allItems
    .map(item => ({ ...item, summaryScore: scoreForSummary(item) }))
    .sort((a, b) => b.summaryScore - a.summaryScore)
    .slice(0, topN)
}

export { rankForSummary, scoreForSummary, hasQualifyingSignal }
