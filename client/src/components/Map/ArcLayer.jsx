import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import logger from '../../utils/logger.js'
import { useMapContext } from '../../context/MapContext.jsx'

// Great-circle arc: interpolate N points between two lng/lat coords
const greatCirclePoints = (from, to, numPoints = 50) => {
  const interpolate = d3.geoInterpolate(from, to)
  return Array.from({ length: numPoints }, (_, i) => interpolate(i / (numPoints - 1)))
}

const ARC_LAYER_ID  = 'pulse-arc-layer'
const ARC_SOURCE_ID = 'pulse-arc-source'

const ArcLayer = ({ arcData, activeSources, dataSourceArcs, activeQuery }) => {
  const mapInstance  = useMapContext()
  const animFrameRef = useRef(null)
  const arcProgressRef = useRef({})

  useEffect(() => {
    if (!mapInstance) return

    // Filter to sources that are active AND have arcs toggled on.
    // Skip zero-distance arcs (same coords — both ends on the same map point).
    const visibleArcs = (arcData ?? []).filter(arc => {
      if (!activeSources.includes(arc.source)) return false
      if (!dataSourceArcs[arc.source]) return false
      const [fx, fy] = arc.fromCoords
      const [tx, ty] = arc.toCoords
      if (fx === tx && fy === ty) return false // zero-distance: skip
      return true
    })

    // Clean up previous layer + source
    try {
      if (mapInstance.getLayer(ARC_LAYER_ID)) mapInstance.removeLayer(ARC_LAYER_ID)
      if (mapInstance.getSource(ARC_SOURCE_ID)) mapInstance.removeSource(ARC_SOURCE_ID)
    } catch (_) { /* ignore if already removed */ }

    if (!visibleArcs.length) return

    // Init per-arc progress counters for staggered draw animation
    arcProgressRef.current = {}
    visibleArcs.forEach((arc, i) => {
      arcProgressRef.current[i] = 0
    })

    const startTime = performance.now()
    const ARC_DRAW_DURATION = 1500 // ms per arc
    const ARC_STAGGER       = 300  // ms between arc starts

    const buildGeoJSON = (progresses) => ({
      type: 'FeatureCollection',
      features: visibleArcs.flatMap((arc, i) => {
        const progress = progresses[i] ?? 0
        if (progress <= 0) return []

        const allPoints = greatCirclePoints(arc.fromCoords, arc.toCoords)
        const visibleCount = Math.max(2, Math.round(allPoints.length * progress))

        return [{
          type: 'Feature',
          properties: {
            color: arc.color,
            // Dim all arcs when an AI query is active — same behaviour as before
            opacity: activeQuery ? 0.2 : 0.8,
          },
          geometry: { type: 'LineString', coordinates: allPoints.slice(0, visibleCount) },
        }]
      }),
    })

    mapInstance.addSource(ARC_SOURCE_ID, {
      type: 'geojson',
      data: buildGeoJSON(arcProgressRef.current),
    })

    mapInstance.addLayer({
      id: ARC_LAYER_ID,
      type: 'line',
      source: ARC_SOURCE_ID,
      paint: {
        'line-color':   ['get', 'color'],
        'line-width':   1.5,
        'line-opacity': ['get', 'opacity'],
        'line-blur':    1,
      },
      layout: {
        'line-cap':  'round',
        'line-join': 'round',
      },
    })

    const animate = (now) => {
      const elapsed = now - startTime
      let needsUpdate = false

      visibleArcs.forEach((_, i) => {
        const arcElapsed = elapsed - i * ARC_STAGGER
        if (arcElapsed <= 0) return
        const prev = arcProgressRef.current[i]
        const next = Math.min(1, arcElapsed / ARC_DRAW_DURATION)
        if (next !== prev) {
          arcProgressRef.current[i] = next
          needsUpdate = true
        }
      })

      if (needsUpdate) {
        const src = mapInstance.getSource(ARC_SOURCE_ID)
        if (src) src.setData(buildGeoJSON(arcProgressRef.current))
      }

      const allDone = visibleArcs.every((_, i) => (arcProgressRef.current[i] ?? 0) >= 1)
      if (!allDone) animFrameRef.current = requestAnimationFrame(animate)
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
  }, [mapInstance, arcData, activeSources, dataSourceArcs]) // eslint-disable-line react-hooks/exhaustive-deps

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
