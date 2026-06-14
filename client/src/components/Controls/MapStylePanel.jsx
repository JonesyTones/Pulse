import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import useAppStore from '../../store/appStore.js'
import { useMapContext } from '../../context/MapContext.jsx'

const slideFromLeft = {
  hidden:  { x: -280, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit:    { x: -280, opacity: 0, transition: { duration: 0.2 } },
}

const MAP_STYLES = [
  { key: 'dark',      label: 'DARK',      url: 'mapbox://styles/mapbox/dark-v11' },
  { key: 'satellite', label: 'SATELLITE', url: 'mapbox://styles/mapbox/satellite-streets-v12' },
  { key: 'terrain',   label: 'TERRAIN',   url: 'mapbox://styles/mapbox/outdoors-v12' },
  { key: 'natural',   label: 'NATURAL',   url: 'mapbox://styles/mapbox/satellite-v9' },
  { key: 'street',    label: 'STREET',    url: 'mapbox://styles/mapbox/streets-v12' },
]

const MapStylePanel = ({ onClose }) => {
  const mapStyle    = useAppStore((s) => s.mapStyle)
  const setMapStyle = useAppStore((s) => s.setMapStyle)
  const map = useMapContext()

  const handleSelect = (style) => {
    setMapStyle(style.key)
    if (map) map.setStyle(style.url)
  }

  return (
    <motion.div
      variants={slideFromLeft}
      initial="hidden"
      animate="visible"
      exit="exit"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        width: 280,
        background: 'var(--pulse-surface)',
        border: '1px solid var(--pulse-border)',
        borderRadius: 4,
        overflow: 'hidden',
        position: 'absolute',
        left: 52,
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid var(--pulse-border)',
        }}
      >
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--pulse-text-primary)',
          }}
        >
          MAP STYLE
        </span>
        <button
          onClick={onClose}
          aria-label="Close map style panel"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--pulse-text-dim)', padding: 0, display: 'flex',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.7)}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
        >
          <X size={14} />
        </button>
      </div>

      {/* Style tiles — 2-column grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          padding: '12px 16px',
        }}
      >
        {MAP_STYLES.map((style) => {
          const active = mapStyle === style.key
          return (
            <motion.button
              key={style.key}
              onClick={() => handleSelect(style)}
              animate={{
                borderColor: active ? 'var(--pulse-accent-blue)' : 'var(--pulse-border)',
                color: active ? 'var(--pulse-accent-blue)' : 'var(--pulse-text-secondary)',
              }}
              whileHover={{
                borderColor: 'var(--pulse-accent-blue)',
                color: 'var(--pulse-accent-blue)',
              }}
              transition={{ duration: 0.2 }}
              aria-pressed={active}
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '10px 8px',
                border: '1px solid',
                borderRadius: 3,
                background: active ? 'rgba(59,130,246,0.08)' : 'var(--pulse-surface-raised)',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              {style.label}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

export default MapStylePanel
