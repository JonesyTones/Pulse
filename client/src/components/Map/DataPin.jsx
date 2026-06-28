import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import mapboxgl from 'mapbox-gl'
import {
  FaGoogle, FaYoutube, FaReddit, FaNewspaper, FaInstagram,
} from 'react-icons/fa'
import { FaXTwitter, FaTiktok } from 'react-icons/fa6'
import useAppStore from '../../store/appStore.js'
import { useMapContext } from '../../context/MapContext.jsx'

const SOURCE_COLORS = {
  google:    '#3B82F6',
  youtube:   '#EF4444',
  bbc:       '#1D4ED8',
  euronews:  '#F59E0B',
  guardian:  '#059669',
  nypost:    '#DC2626',
  aljazeera: '#D97706',
  reddit:    '#F97316',
  twitter:   '#06B6D4',
  tiktok:    '#EC4899',
  instagram: '#A855F7',
}

const SOURCE_ICONS = {
  google:    FaGoogle,
  youtube:   FaYoutube,
  bbc:       FaNewspaper,
  euronews:  FaNewspaper,
  guardian:  FaNewspaper,
  nypost:    FaNewspaper,
  aljazeera: FaNewspaper,
  reddit:    FaReddit,
  twitter:   FaXTwitter,
  tiktok:    FaTiktok,
  instagram: FaInstagram,
}

const SOURCE_LABELS = {
  google:    'GOOGLE TRENDS',
  youtube:   'YOUTUBE',
  bbc:       'BBC WORLD',
  euronews:  'EURONEWS',
  guardian:  'THE GUARDIAN',
  nypost:    'NY POST',
  aljazeera: 'AL JAZEERA',
  reddit:    'REDDIT',
  twitter:   'X / TWITTER',
  tiktok:    'TIKTOK',
  instagram: 'INSTAGRAM',
}

const MOCK_SOURCES = new Set(['reddit', 'twitter', 'tiktok', 'instagram'])

const getRelativeTime = (isoTimestamp) => {
  const diffMs = Date.now() - new Date(isoTimestamp).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  return `${Math.floor(diffHr / 24)}d ago`
}

const PinContent = ({ data, index, isActive }) => {
  const [isHovered, setIsHovered] = useState(false)
  const setActivePinDetail  = useAppStore((s) => s.setActivePinDetail)
  const setIsPinDetailOpen  = useAppStore((s) => s.setIsPinDetailOpen)
  const setIsAIPanelOpen    = useAppStore((s) => s.setIsAIPanelOpen)
  const activePinDetail     = useAppStore((s) => s.activePinDetail)

  const color  = SOURCE_COLORS[data.source] || '#3B82F6'
  const Icon   = SOURCE_ICONS[data.source]
  const isMock = MOCK_SOURCES.has(data.source)
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Active (selected) when this pin is the one currently open in PinDetailView
  const isSelected = activePinDetail?.id === data.id

  // Volume-based scale: low/mid/high presence on the map
  const volumeScale = data.volume <= 33 ? 0.85 : data.volume <= 66 ? 1.0 : 1.15

  const loadTransition = prefersReduced
    ? { duration: 0.01 }
    : { duration: 0.4, ease: 'easeOut', delay: index * 0.1 }

  const focusOpacity = isActive === false ? 0.2 : 1
  const focusScale   = isActive === true  ? 1.05 : 1

  const handleClick = () => {
    setActivePinDetail(data)
    setIsPinDetailOpen(true)
    setIsAIPanelOpen(true)
  }

  return (
    /*
     * Outer wrapper: handles load animation (opacity/scale/y) and query focus.
     * No overflow clip here — the arrow must be visible below the pin body.
     */
    <motion.div
      initial={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0, y: 10 }}
      animate={{
        opacity: focusOpacity,
        scale:   focusScale * volumeScale,
        y:       0,
      }}
      transition={{
        opacity: loadTransition,
        scale:   loadTransition,
        y:       loadTransition,
      }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
      aria-label={`${SOURCE_LABELS[data.source]}: ${data.topic} — ${data.region}, volume ${data.volume}/100`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
      style={{ display: 'inline-block', cursor: 'pointer' }}
    >
      {/*
       * Drop-shadow wrapper: filter: drop-shadow follows the alpha of all children,
       * including the arrow triangle below the pin body.
       * Glow is applied ONLY when this pin is the active/selected pin.
       */}
      <div
        style={{
          position: 'relative',
          display: 'inline-block',
          filter: isSelected ? `drop-shadow(0 0 8px ${color})` : 'none',
        }}
      >
        {/* Pin body — dark card, source-color border, animates height on hover */}
        <motion.div
          animate={{ height: isHovered ? 90 : 36 }}
          transition={
            prefersReduced
              ? { duration: 0.01 }
              : { type: 'spring', damping: 25, stiffness: 300 }
          }
          style={{
            width: 140,
            borderRadius: 6,
            overflow: 'hidden',
            background: 'var(--pulse-surface-raised)',
            border: isSelected ? `2px solid ${color}` : `1.5px solid ${color}`,
          }}
        >
          {/* Main row — always visible */}
          <div
            style={{
              display: 'flex',
              height: 36,
              minHeight: 36,
            }}
          >
            {/* Left icon strip — source color is the only colored element */}
            <div
              style={{
                width: 26,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: color,
              }}
            >
              {Icon && <Icon size={12} color="white" />}
            </div>

            {/* Topic text */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                padding: '0 8px',
                overflow: 'hidden',
              }}
            >
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 9,
                  color: 'var(--pulse-text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.2,
                }}
              >
                {data.topic}
              </span>
            </div>
          </div>

          {/* Hover content — always in DOM, revealed by height animation */}
          <div
            style={{
              background: 'var(--pulse-surface-raised)',
              padding: '4px 8px 6px',
              opacity: isHovered ? 1 : 0,
              transition: prefersReduced ? 'none' : 'opacity 0.15s',
            }}
          >
            {/* Region */}
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                color: 'var(--pulse-text-secondary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginBottom: 2,
              }}
            >
              {data.region}
            </div>

            {/* Timestamp */}
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                color: 'var(--pulse-text-dim)',
                marginBottom: 4,
              }}
            >
              {getRelativeTime(data.timestamp)}
            </div>

            {/* Volume bar */}
            <div
              style={{
                height: 3,
                borderRadius: 2,
                background: 'var(--pulse-border)',
                overflow: 'hidden',
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${data.volume}%`,
                  background: color,
                  borderRadius: 2,
                }}
              />
            </div>

            {/* MOCK badge + Read more */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isMock ? 'space-between' : 'flex-end',
              }}
            >
              {isMock && (
                <span
                  aria-label="Simulated data"
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 8,
                    color: 'var(--pulse-text-dim)',
                    border: '1px solid var(--pulse-border)',
                    padding: '1px 3px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  MOCK
                </span>
              )}
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 9,
                  color: 'var(--pulse-text-primary)',
                  letterSpacing: '0.04em',
                }}
              >
                Read more →
              </span>
            </div>
          </div>
        </motion.div>

        {/*
         * Arrow — bottom-left triangle pointing downward.
         * Dark fill matching var(--pulse-surface-raised) — blends with card body.
         * CSS border trick: zero-size box, transparent left/right, solid top.
         */}
        <div
          style={{
            position: 'absolute',
            bottom: -8,
            left: 12,
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid var(--pulse-surface-raised)',
          }}
        />
      </div>
    </motion.div>
  )
}

const DataPin = ({ data, index = 0, isActive }) => {
  const mapInstance = useMapContext()
  // Stable DOM element — created once, passed to Mapbox marker
  const [markerElement] = useState(() => {
    const el = document.createElement('div')
    el.style.cssText = 'position:absolute;top:0;left:0;overflow:visible;'
    return el
  })
  const markerRef = useRef(null)

  useEffect(() => {
    if (!mapInstance || !data?.lat || !data?.lng) return

    const marker = new mapboxgl.Marker({ element: markerElement, anchor: 'bottom-left' })
      .setLngLat([data.lng, data.lat])
      .addTo(mapInstance)

    markerRef.current = marker

    return () => {
      marker.remove()
      markerRef.current = null
    }
  }, [mapInstance, markerElement, data?.lat, data?.lng])

  // Portal renders React content into the Mapbox marker element
  return createPortal(
    <PinContent data={data} index={index} isActive={isActive} />,
    markerElement,
  )
}

export default DataPin
