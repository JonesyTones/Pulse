import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import useAppStore from '../../store/appStore.js'

const slideFromLeft = {
  hidden:  { x: -220, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit:    { x: -220, opacity: 0, transition: { duration: 0.2 } },
}

const PILLS = [
  { label: '1H', value: '1h' },
  { label: '24H', value: '24h' },
  { label: '7D', value: '7d' },
]

const TimeRangePanel = ({ onClose }) => {
  const timeRange    = useAppStore((s) => s.timeRange)
  const setTimeRange = useAppStore((s) => s.setTimeRange)

  return (
    <motion.div
      variants={slideFromLeft}
      initial="hidden"
      animate="visible"
      exit="exit"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        width: 220,
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
          TIME RANGE
        </span>
        <button
          onClick={onClose}
          aria-label="Close time range panel"
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

      {/* Pills */}
      <div style={{ display: 'flex', gap: 8, padding: '14px 16px' }}>
        {PILLS.map((pill) => {
          const active = timeRange === pill.value
          return (
            <motion.button
              key={pill.value}
              onClick={() => setTimeRange(pill.value)}
              animate={{
                background: active ? 'var(--pulse-accent-blue)' : 'transparent',
                color: active ? 'white' : 'var(--pulse-text-secondary)',
                borderColor: active ? 'var(--pulse-accent-blue)' : 'var(--pulse-border)',
              }}
              whileHover={{
                background: active ? 'var(--pulse-accent-blue)' : 'rgba(59,130,246,0.1)',
                color: 'white',
                borderColor: 'var(--pulse-accent-blue)',
              }}
              transition={{ duration: 0.2 }}
              aria-pressed={active}
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '6px 14px',
                border: '1px solid',
                borderRadius: 3,
                cursor: 'pointer',
                flex: 1,
              }}
            >
              {pill.label}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

export default TimeRangePanel
