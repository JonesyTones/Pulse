import { motion } from 'framer-motion'
import useAppStore from '../../store/appStore.js'

const formatStatusLabel = (progress, rangeKey) => {
  if (progress >= 100) return 'LIVE'
  const rangeMap = { '1h': 1, '6h': 6, '12h': 12, '24h': 24 }
  const rangeHours = rangeMap[rangeKey] || 24
  const hoursAgo = (1 - progress / 100) * rangeHours
  const minutesAgo = Math.round(hoursAgo * 60)
  if (minutesAgo < 60) return `${minutesAgo}M AGO`
  const h = Math.floor(hoursAgo)
  const m = Math.round((hoursAgo - h) * 60)
  return m === 0 ? `${h}H AGO` : `${h}H ${m}M AGO`
}

const StatusBar = () => {
  const scrubberProgress = useAppStore((s) => s.scrubberProgress)
  const scrubberRange    = useAppStore((s) => s.scrubberRange)

  const isLive    = scrubberProgress >= 100
  const label     = formatStatusLabel(scrubberProgress, scrubberRange)
  const color     = isLive ? 'var(--pulse-success)' : 'var(--pulse-arc-red)'
  const dotShadow = isLive ? '0 0 8px var(--pulse-success)' : '0 0 8px var(--pulse-arc-red)'

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Live data status"
      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
    >
      <span
        className={isLive ? 'animate-pulse' : ''}
        aria-hidden="true"
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          display: 'inline-block',
          background: color,
          boxShadow: dotShadow,
        }}
      />
      <motion.span
        animate={{ color }}
        transition={{ duration: 0.3 }}
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '11px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </motion.span>
    </div>
  )
}

export default StatusBar
