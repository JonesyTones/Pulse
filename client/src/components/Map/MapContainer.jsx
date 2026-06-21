import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import useAppStore from '../../store/appStore.js'
import useLiveData from '../../hooks/useLiveData.js'
import { scoreRelevance } from '../../utils/relevanceEngine.js'
import generateSnapshots from '../../utils/generateSnapshots.js'
import WorldMap from './WorldMap.jsx'
import DataPin from './DataPin.jsx'
import ArcLayer from './ArcLayer.jsx'
import TerrainLayer from './TerrainLayer.jsx'
import logger from '../../utils/logger.js'
import { useMapContext, useSetMap } from '../../context/MapContext.jsx'

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
const IS_PLACEHOLDER = !TOKEN || TOKEN === 'pk.placeholder'

const MAP_STYLES = {
  dark:      'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  terrain:   'mapbox://styles/mapbox/outdoors-v12',
  natural:   'mapbox://styles/mapbox/satellite-v9',
  street:    'mapbox://styles/mapbox/streets-v12',
}

const getZoomPitch = (zoom) => {
  if (zoom <= 3) return 0
  if (zoom <= 5) return 25
  if (zoom <= 7) return 52
  return 60
}

const getGranularity = (zoom) => {
  if (zoom <= 3) return 'continent'
  if (zoom <= 5) return 'country'
  return 'region'
}

// Apply dataDensity: 0–33→25%, 34–66→50%, 67–100→100%
const applyDensity = (items, density) => {
  if (density >= 67) return items
  const ratio = density >= 34 ? 0.5 : 0.25
  return items.filter((_, i) => i < Math.ceil(items.length * ratio))
}

const MapContainer = () => {
  const containerRef    = useRef(null)
  const mapRef          = useRef(null)
  const appliedStyleRef = useRef('dark')
  const snapshotsSeeded = useRef(false)
  const map    = useMapContext()
  const setMap = useSetMap()

  const setIsAppLoading    = useAppStore((s) => s.setIsAppLoading)

  const mapStyle           = useAppStore((s) => s.mapStyle)
  const is3DMode           = useAppStore((s) => s.is3DMode)
  const setActiveGranularity = useAppStore((s) => s.setActiveGranularity)
  const activeSources      = useAppStore((s) => s.activeSources)
  const dataSourceArcs     = useAppStore((s) => s.dataSourceArcs)
  const dataDensity        = useAppStore((s) => s.dataDensity)
  const activeTags         = useAppStore((s) => s.activeTags)
  const aiResponse         = useAppStore((s) => s.aiResponse)
  const scrubberProgress   = useAppStore((s) => s.scrubberProgress)
  const trendSnapshots     = useAppStore((s) => s.trendSnapshots)
  const trendData          = useAppStore((s) => s.trendData)
  const arcData            = useAppStore((s) => s.arcData)
  const setTrendSnapshots  = useAppStore((s) => s.setTrendSnapshots)

  // Start live data polling
  useLiveData()

  // Generate 288 historical snapshots once trendData first populates
  useEffect(() => {
    if (snapshotsSeeded.current || !trendData.length) return
    snapshotsSeeded.current = true
    const snapshots = generateSnapshots(trendData)
    setTrendSnapshots(snapshots)
    logger.info(`Generated ${snapshots.length} historical snapshots`)
  }, [trendData, setTrendSnapshots])

  // Determine displayed data: historical snapshot or live
  const displayData = (() => {
    if (scrubberProgress >= 100 || !trendSnapshots.length) return trendData

    // Find the snapshot matching the scrubber position
    const idx = Math.round(((scrubberProgress) / 100) * (trendSnapshots.length - 1))
    const clamped = Math.max(0, Math.min(trendSnapshots.length - 1, idx))
    return trendSnapshots[clamped]?.data ?? trendData
  })()

  // Filter by activeSources, then apply density
  let filteredData = applyDensity(
    displayData.filter((d) => activeSources.includes(d.source)),
    dataDensity,
  )

  // Relevance scoring — dims unrelated pins to 0.2 opacity instead of removing
  // them from the DOM. Active topic tags become the keyword query; active region
  // tags drive the region-match score.
  const activeActiveTags = activeTags.filter((t) => t.active !== false)
  const relevanceQuery = activeActiveTags
    .filter((t) => t.type === 'topic')
    .map((t) => t.label)
    .join(' ')
  const activeRegionTags = activeActiveTags
    .filter((t) => t.type === 'region')
    .map((t) => t.label)

  filteredData = scoreRelevance(filteredData, { query: relevanceQuery, activeRegionTags })

  // Extract keywords from AI answer and match against pin topics/regions
  const queryRelatedIds = aiResponse
    ? (() => {
        const stopwords = new Set(['the','a','an','is','are','was','were','has','have','had','in','on','at','to','of','for','with','by','from'])
        const words = aiResponse.answer
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter((w) => w.length > 3 && !stopwords.has(w))
        if (!words.length) return null
        return new Set(
          filteredData
            .filter((d) => words.some((w) => d.topic?.toLowerCase().includes(w) || d.region?.toLowerCase().includes(w)))
            .map((d) => d.id),
        )
      })()
    : null

  // Init map on mount
  useEffect(() => {
    if (IS_PLACEHOLDER || !containerRef.current) {
      setIsAppLoading(false)
      return
    }

    mapboxgl.accessToken = TOKEN

    const instance = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_STYLES.dark,
      center: [0, 20],
      zoom: 2,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
      logoPosition: 'bottom-right',
    })

    instance.on('load', () => {
      setMap(instance)
      setIsAppLoading(false)
      logger.info('Map loaded')
    })

    instance.on('zoom', () => {
      const zoom = instance.getZoom()
      setActiveGranularity(getGranularity(zoom))
    })

    instance.on('error', (e) => logger.error('Mapbox error', e))

    mapRef.current = instance

    return () => {
      instance.remove()
      setMap(null)
      mapRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Map style switching
  useEffect(() => {
    const m = mapRef.current
    if (!m || mapStyle === appliedStyleRef.current) return
    appliedStyleRef.current = mapStyle
    m.setStyle(MAP_STYLES[mapStyle] || MAP_STYLES.dark)
  }, [mapStyle])

  // 3D mode — tie camera pitch to zoom when enabled
  useEffect(() => {
    const m = mapRef.current
    if (!m) return

    if (!is3DMode) {
      m.easeTo({ pitch: 0, duration: 300 })
      return
    }

    const updatePitch = () => {
      const target = getZoomPitch(m.getZoom())
      if (Math.abs(m.getPitch() - target) > 2) {
        m.easeTo({ pitch: target, duration: 200 })
      }
    }

    updatePitch()
    m.on('zoom', updatePitch)
    return () => m.off('zoom', updatePitch)
  }, [is3DMode])

  if (IS_PLACEHOLDER) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          background: 'var(--pulse-bg)',
          fontFamily: "'Space Mono', monospace",
          fontSize: '11px',
          letterSpacing: '0.2em',
          color: 'var(--pulse-text-secondary)',
          textTransform: 'uppercase',
        }}
      >
        MAPBOX TOKEN REQUIRED — SET VITE_MAPBOX_TOKEN IN CLIENT/.ENV
      </div>
    )
  }

  return (
    <>
      {/* Map canvas */}
      <div
        ref={containerRef}
        role="application"
        aria-label="Global trend map"
        className="absolute inset-0 w-full h-full"
      />

      {/* Accessible table-view fallback */}
      <button
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-1/2 focus:z-[200] focus:px-4 focus:py-2"
        style={{
          background: 'var(--pulse-surface)',
          color: 'var(--pulse-text-primary)',
          border: '1px solid var(--pulse-border)',
          fontFamily: "'Space Mono', monospace",
          fontSize: '11px',
          letterSpacing: '0.1em',
        }}
        aria-label="Switch to table view"
      >
        Switch to Table View
      </button>

      {/* WorldMap overlays (scanline, ambient glows) */}
      {map && <WorldMap />}

      {/* Terrain (3D mode) */}
      {map && <TerrainLayer is3DMode={is3DMode} />}

      {/* Arc lines */}
      {map && (
        <ArcLayer
          arcData={arcData}
          activeSources={activeSources}
          dataSourceArcs={dataSourceArcs}
          activeQuery={!!aiResponse}
        />
      )}

      {/* Flag pins */}
      {map && filteredData.map((item, i) => {
        // Merge two independent dimming signals:
        // 1. relevanceEngine: item.dimmed=true when it scores below threshold for active tags/query
        // 2. AI response keywords: queryRelatedIds tracks pins matching the current AI answer
        // Pin is active (full opacity) if either signal says it's relevant.
        // If neither filter is active both are null/false → isActive stays undefined (full opacity).
        const relevanceDimmed = item.dimmed === true
        const aiActive = queryRelatedIds !== null ? queryRelatedIds.has(item.id) : null

        let isActive
        if (aiActive !== null && relevanceDimmed) {
          isActive = aiActive // AI signal takes precedence when both are active
        } else if (aiActive !== null) {
          isActive = aiActive
        } else if (relevanceDimmed) {
          isActive = false
        } else {
          isActive = undefined
        }

        return (
          <DataPin
            key={item.id}
            data={item}
            index={i}
            isActive={isActive}
          />
        )
      })}
    </>
  )
}

export default MapContainer
