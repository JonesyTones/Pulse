import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import logger from '../../utils/logger.js'
import { useMapContext } from '../../context/MapContext.jsx'

const SOURCE_COLORS = {
  google:    '#3B82F6',
  youtube:   '#EF4444',
  reddit:    '#F97316',
  gdelt:     '#F59E0B',
  twitter:   '#06B6D4',
  tiktok:    '#EC4899',
  instagram: '#A855F7',
}

// Pick up to 2 highest-volume items per source to form arc pairs
const buildArcPairs = (trendData, activeSources, dataSourceArcs) => {
  const pairs = []

  activeSources.forEach((source) => {
    if (!dataSourceArcs[source]) return

    const items = trendData
      .filter((d) => d.source === source)
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 2)

    if (items.length === 2) {
      pairs.push({ from: items[0], to: items[1], source })
    }
  })

  return pairs
}

// Great-circle arc: interpolate N points between two lat/lng coords
const greatCirclePoints = (from, to, numPoints = 50) => {
  const interpolate = d3.geoInterpolate(
    [from.lng, from.lat],
    [to.lng, to.lat],
  )
  return Array.from({ length: numPoints }, (_, i) => interpolate(i / (numPoints - 1)))
}

const ARC_LAYER_ID = 'pulse-arc-layer'
const ARC_SOURCE_ID = 'pulse-arc-source'

const ArcLayer = ({ trendData, activeSources, dataSourceArcs, activeQuery }) => {
  const mapInstance = useMapContext()
  const animFrameRef = useRef(null)
  // progress per arc pair (0→1 for draw animation)
  const arcProgressRef = useRef({})

  useEffect(() => {
    if (!mapInstance || !trendData?.length) return

    const pairs = buildArcPairs(trendData, activeSources, dataSourceArcs)

    // Remove previous layer + source if they exist
    try {
      if (mapInstance.getLayer(ARC_LAYER_ID)) mapInstance.removeLayer(ARC_LAYER_ID)
      if (mapInstance.getSource(ARC_SOURCE_ID)) mapInstance.removeSource(ARC_SOURCE_ID)
    } catch (_) { /* ignore if already removed */ }

    if (!pairs.length) return

    // Init progress counters — stagger draw animation per arc pair
    pairs.forEach((pair, i) => {
      const key = `${pair.source}-${i}`
      arcProgressRef.current[key] = 0
    })

    const startTime = performance.now()
    const ARC_DRAW_DURATION = 1500   // ms per arc
    const ARC_STAGGER = 300          // ms between arc starts

    // Build GeoJSON for arcs at current progress
    const buildGeoJSON = (progresses) => ({
      type: 'FeatureCollection',
      features: pairs.flatMap((pair, i) => {
        const key = `${pair.source}-${i}`
        const progress = progresses[key] ?? 0
        if (progress <= 0) return []

        const allPoints = greatCirclePoints(pair.from, pair.to)
        const visibleCount = Math.max(2, Math.round(allPoints.length * progress))
        const visiblePoints = allPoints.slice(0, visibleCount)

        return [{
          type: 'Feature',
          properties: {
            source: pair.source,
            color: SOURCE_COLORS[pair.source] || '#3B82F6',
            // Dim unrelated arcs when a query is active
            opacity: activeQuery ? 0.2 : 0.8,
          },
          geometry: { type: 'LineString', coordinates: visiblePoints },
        }]
      }),
    })

    // Add source + layer
    mapInstance.addSource(ARC_SOURCE_ID, {
      type: 'geojson',
      data: buildGeoJSON(arcProgressRef.current),
    })

    mapInstance.addLayer({
      id: ARC_LAYER_ID,
      type: 'line',
      source: ARC_SOURCE_ID,
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 1.5,
        'line-opacity': ['get', 'opacity'],
        'line-blur': 1,
      },
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
    })

    // Animate arc draw via requestAnimationFrame
    const animate = (now) => {
      const elapsed = now - startTime
      let needsUpdate = false

      pairs.forEach((pair, i) => {
        const key = `${pair.source}-${i}`
        const arcElapsed = elapsed - i * ARC_STAGGER
        if (arcElapsed <= 0) return

        const prev = arcProgressRef.current[key]
        const next = Math.min(1, arcElapsed / ARC_DRAW_DURATION)
        if (next !== prev) {
          arcProgressRef.current[key] = next
          needsUpdate = true
        }
      })

      if (needsUpdate) {
        const src = mapInstance.getSource(ARC_SOURCE_ID)
        if (src) src.setData(buildGeoJSON(arcProgressRef.current))
      }

      const allDone = pairs.every((_, i) => {
        const key = `${pairs[i].source}-${i}`
        return (arcProgressRef.current[key] ?? 0) >= 1
      })

      if (!allDone) {
        animFrameRef.current = requestAnimationFrame(animate)
      }
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      try {
        if (mapInstance.getLayer(ARC_LAYER_ID)) mapInstance.removeLayer(ARC_LAYER_ID)
        if (mapInstance.getSource(ARC_SOURCE_ID)) mapInstance.removeSource(ARC_SOURCE_ID)
      } catch (e) {
        logger.error('ArcLayer cleanup error', e)
      }
    }
  }, [mapInstance, trendData, activeSources, dataSourceArcs]) // eslint-disable-line react-hooks/exhaustive-deps

  // React to activeQuery change — update opacity without full redraw
  useEffect(() => {
    if (!mapInstance) return
    try {
      if (!mapInstance.getLayer(ARC_LAYER_ID)) return
      mapInstance.setPaintProperty(
        ARC_LAYER_ID,
        'line-opacity',
        activeQuery ? 0.2 : ['get', 'opacity'],
      )
    } catch (_) { /* layer may not exist yet */ }
  }, [mapInstance, activeQuery])

  return null
}

export default ArcLayer
