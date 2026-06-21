const STOPWORDS = new Set([
  'a','an','the','and','or','but','is','are','was','were','be','been',
  'to','of','in','on','at','for','with','as','by','from','after','amid',
  'this','that','it','its','their','his','her','than','over','into',
  'why','how','what','who','will','would','could','should','may','says',
  'said','new','first','more','one','two','three'
])

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/['']s\b/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w))
}

/**
 * Extract proper-noun-like words from the ORIGINAL (non-lowercased) text —
 * capitalized words not at the start of a sentence. These are the strongest
 * same-story signal (names, places, organizations) and get extra weight.
 */
function extractProperNouns(text) {
  const words = text.split(/\s+/)
  const proper = []
  for (let i = 0; i < words.length; i++) {
    const w = words[i].replace(/[^a-zA-Z0-9]/g, '')
    if (w.length > 2 && /^[A-Z]/.test(w) && w === w.charAt(0) + w.slice(1)) {
      proper.push(w.toLowerCase())
    }
  }
  return proper
}

/**
 * Jaccard similarity between two token sets: intersection / union.
 * Returns 0-1. Simple, explainable, no dependencies.
 */
function jaccardSimilarity(tokensA, tokensB) {
  const setA = new Set(tokensA)
  const setB = new Set(tokensB)
  const intersection = [...setA].filter(t => setB.has(t))
  const union = new Set([...setA, ...setB])
  if (union.size === 0) return 0
  return intersection.length / union.size
}

/**
 * Full similarity score between two items.
 * Combines:
 * - general topic-text overlap (Jaccard on all meaningful words)
 * - proper-noun overlap (names/places/orgs), weighted higher since
 *   shared proper nouns are a much stronger "same story" signal than
 *   shared generic words like "deal" or "talks"
 * - region-match bonus, since two articles about the same country are
 *   plausibly related even with low word overlap
 */
function itemSimilarity(itemA, itemB) {
  const rawTextA = itemA.topic + ' ' + (itemA.metadata?.description || '')
  const rawTextB = itemB.topic + ' ' + (itemB.metadata?.description || '')

  const textA = tokenize(rawTextA)
  const textB = tokenize(rawTextB)
  const textScore = jaccardSimilarity(textA, textB)

  const properA = extractProperNouns(rawTextA)
  const properB = extractProperNouns(rawTextB)
  const properScore = jaccardSimilarity(properA, properB)

  const sameRegion = itemA.region && itemB.region && itemA.region === itemB.region
  const regionBonus = sameRegion ? 0.15 : 0

  // weighted blend: proper nouns count for more than general words
  const combined = (textScore * 0.4) + (properScore * 0.45) + regionBonus
  return Math.min(1, combined)
}

export { tokenize, jaccardSimilarity, itemSimilarity, extractProperNouns }
