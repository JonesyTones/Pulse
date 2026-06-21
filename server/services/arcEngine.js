import { itemSimilarity } from './similarity.js'

const ARC_SIMILARITY_THRESHOLD = 0.2 // tuned against real BBC wire data + cross-source tests
const MAX_HOPS = 3

/**
 * Build all pairwise similarity edges above threshold, sorted by
 * similarity descending. Each edge only points from an OLDER item to
 * a NEWER item (timestamp ordering = direction of propagation, per spec).
 */
function buildEdges(items) {
  const edges = []
  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < items.length; j++) {
      if (i === j) continue
      const a = items[i]
      const b = items[j]
      if (new Date(a.timestamp).getTime() >= new Date(b.timestamp).getTime()) continue // a must be older
      const score = itemSimilarity(a, b)
      if (score >= ARC_SIMILARITY_THRESHOLD) {
        edges.push({ from: a.id, to: b.id, score })
      }
    }
  }
  return edges
}

/**
 * Build propagation chains: starting from each item, follow the
 * strongest similarity edge forward in time, up to MAX_HOPS, without
 * revisiting a node already in the current chain.
 *
 * Returns an array of chains, each chain being an array of arc segments:
 * [{ from, to, score }, { from, to, score }, ...]
 */
function buildArcChains(items) {
  const edges = buildEdges(items)
  const edgesByFrom = new Map()
  for (const edge of edges) {
    if (!edgesByFrom.has(edge.from)) edgesByFrom.set(edge.from, [])
    edgesByFrom.get(edge.from).push(edge)
  }
  // sort each node's outgoing edges by strongest similarity first
  for (const list of edgesByFrom.values()) {
    list.sort((a, b) => b.score - a.score)
  }

  const chains = []
  const usedAsOrigin = new Set()

  for (const item of items) {
    if (usedAsOrigin.has(item.id)) continue
    const outgoing = edgesByFrom.get(item.id)
    if (!outgoing || outgoing.length === 0) continue // no chain starts here

    const chain = []
    const visited = new Set([item.id])
    let currentId = item.id

    for (let hop = 0; hop < MAX_HOPS; hop++) {
      const candidates = (edgesByFrom.get(currentId) || []).filter(e => !visited.has(e.to))
      if (candidates.length === 0) break
      const best = candidates[0]
      chain.push(best)
      visited.add(best.to)
      currentId = best.to
    }

    if (chain.length > 0) {
      chains.push(chain)
      usedAsOrigin.add(item.id)
    }
  }

  return chains
}

/**
 * Convert chains into renderable arc objects for the frontend:
 * each segment becomes one arc with from/to coordinates, a color
 * (matching the origin item's source per spec), and a sequence index
 * for staggering animation if desired.
 */
function chainsToArcs(chains, itemsById, sourceColors) {
  const arcs = []
  for (const chain of chains) {
    const originItem = itemsById.get(chain[0].from)
    const color = sourceColors[originItem?.source] || '#6B7A99'
    chain.forEach((segment, index) => {
      const fromItem = itemsById.get(segment.from)
      const toItem = itemsById.get(segment.to)
      if (!fromItem?.lat || !toItem?.lat) return // skip if either end has no location
      arcs.push({
        fromId: segment.from,
        toId: segment.to,
        fromCoords: [fromItem.lng, fromItem.lat],
        toCoords: [toItem.lng, toItem.lat],
        similarity: segment.score,
        hopIndex: index,
        source: originItem?.source,
        color,
      })
    })
  }
  return arcs
}

export { buildEdges, buildArcChains, chainsToArcs, ARC_SIMILARITY_THRESHOLD, MAX_HOPS }
