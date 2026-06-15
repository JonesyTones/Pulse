import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, ChevronDown } from 'lucide-react'
import useAppStore from '../../store/appStore.js'

const RANGE_HOURS = { '1h': 1, '6h': 6, '12h': 12, '24h': 24 }

const formatTimeLabel = (progress, rangeKey) => {
  const rangeMap = { '1h': 1, '6h': 6, '12h': 12, '24h': 24 }
  const rangeHours = rangeMap[rangeKey] || 24
  if (progress >= 100) return 'LIVE'
  const hoursAgo = (1 - progress / 100) * rangeHours
  const minutesAgo = Math.round(hoursAgo * 60)
  if (minutesAgo < 60) return `${minutesAgo}M AGO`
  const h = Math.floor(hoursAgo)
  const m = Math.round((hoursAgo - h) * 60)
  if (m === 0) return `${h}H AGO`
  return `${h}H ${m}M AGO`
}

// Snap progress to nearest 5-minute boundary
const snapToInterval = (progress, rangeKey) => {
  const totalMinutes = (RANGE_HOURS[rangeKey] ?? 24) * 60
  const minutesAgo = (1 - progress / 100) * totalMinutes
  const snapped = Math.round(minutesAgo / 5) * 5
  const clampedMinutes = Math.max(0, Math.min(totalMinutes, snapped))
  return Math.round((1 - clampedMinutes / totalMinutes) * 100)
}

const pills = ['1H', '6H', '12H', '24H']
const pillKeys = { '1H': '1h', '6H': '6h', '12H': '12h', '24H': '24h' }

const accordionVariants = {
  hidden:  { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1, transition: { duration: 0.2 } },
  exit:    { height: 0, opacity: 0, transition: { duration: 0.2 } },
}

const tooltipVariants = {
  hidden:  { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.12 } },
  exit:    { opacity: 0, y: 4, transition: { duration: 0.1 } },
}

const TimelineScrubber = () => {
  const scrubberProgress = useAppStore((s) => s.scrubberProgress)
  const scrubberRange    = useAppStore((s) => s.scrubberRange)
  const setScrubberProgress = useAppStore((s) => s.setScrubberProgress)
  const setScrubberRange    = useAppStore((s) => s.setScrubberRange)
  const setTimeRange        = useAppStore((s) => s.setTimeRange)

  // Local state only
  const [isPlaying, setIsPlaying]   = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const trackRef    = useRef(null)
  const playTimerRef = useRef(null)
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const timeLabel = formatTimeLabel(scrubberProgress, scrubberRange)
  const isLive    = scrubberProgress >= 100

  // Compute portal tooltip position from track bounds — refreshed every render during drag
  let tooltipLeft = 0
  let tooltipBottom = 0
  if (isDragging && trackRef.current) {
    const rect = trackRef.current.getBoundingClientRect()
    tooltipLeft   = rect.left + (scrubberProgress / 100) * rect.width
    tooltipBottom = window.innerHeight - rect.top - rect.height / 2 + 14
  }

  // Play: advance scrubberProgress toward 100 (~30s for full range)
  useEffect(() => {
    if (!isPlaying) {
      clearInterval(playTimerRef.current)
      return
    }
    if (isLive) {
      setIsPlaying(false)
      return
    }
    playTimerRef.current = setInterval(() => {
      // Read current progress imperatively — avoids functional updater on a Zustand setter
      const next = Math.min(100, useAppStore.getState().scrubberProgress + 100 / 30 / 10)
      setScrubberProgress(next)
      if (next >= 100) setIsPlaying(false)
    }, 100)
    return () => clearInterval(playTimerRef.current)
  }, [isPlaying, isLive, setScrubberProgress])

  // Drag logic — native mouse events for tracking beyond bounds
  const progressFromEvent = useCallback((e) => {
    if (!trackRef.current) return scrubberProgress
    const rect = trackRef.current.getBoundingClientRect()
    const raw = (e.clientX - rect.left) / rect.width
    return Math.max(0, Math.min(100, raw * 100))
  }, [scrubberProgress])

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
    setIsPlaying(false)
    setScrubberProgress(progressFromEvent(e))
  }, [progressFromEvent, setScrubberProgress])

  useEffect(() => {
    if (!isDragging) return

    const onMove = (e) => setScrubberProgress(progressFromEvent(e))
    const onUp = (e) => {
      const snapped = snapToInterval(progressFromEvent(e), scrubberRange)
      setScrubberProgress(snapped)
      setIsDragging(false)
      // Auto-play forward to LIVE after any drag that lands in historical range
      setIsPlaying(snapped < 100)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isDragging, progressFromEvent, scrubberRange, setScrubberProgress])

  // Click on track to jump
  const handleTrackClick = (e) => {
    if (isDragging) return
    const snapped = snapToInterval(progressFromEvent(e), scrubberRange)
    setScrubberProgress(snapped)
    setIsPlaying(false)
  }

  const activePillKey = scrubberRange  // e.g. '24h'

  return (
    <>
    <div
      style={{
        position: 'fixed',
        bottom: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(600px, calc(100vw - 32px))',
        zIndex: 65,
      }}
    >
    <motion.div
      initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      aria-label="Timeline scrubber"
      style={{
        background: 'var(--pulse-surface)',
        border: '1px solid var(--pulse-border)',
        boxShadow: '0 0 20px rgba(59,130,246,0.15)',
        borderRadius: 4,
        overflow: 'hidden',
      }}
    >
      {/* Top row — collapsible time range pills */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="pills"
            variants={accordionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', gap: 6, padding: '8px 12px 4px' }}>
              {pills.map((pill) => {
                const key = pillKeys[pill]
                const active = key === activePillKey
                return (
                  <button
                    key={pill}
                    onClick={() => { setScrubberRange(key); setTimeRange(key) }}
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 10,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      padding: '3px 10px',
                      borderRadius: 3,
                      border: active
                        ? '1px solid var(--pulse-accent-blue)'
                        : '1px solid var(--pulse-border)',
                      background: active ? 'var(--pulse-accent-blue)' : 'transparent',
                      color: active ? 'white' : 'var(--pulse-text-secondary)',
                      cursor: 'pointer',
                      transition: 'background 0.2s, color 0.2s, border-color 0.2s',
                    }}
                    aria-pressed={active}
                  >
                    {pill}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom row — always visible */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 12px',
        }}
      >
        {/* Play / Pause */}
        <button
          onClick={() => {
            if (isLive) return
            setIsPlaying((p) => !p)
          }}
          aria-label={isPlaying ? 'Pause timeline' : 'Play timeline'}
          style={{
            background: 'none',
            border: 'none',
            cursor: isLive ? 'default' : 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            color: 'var(--pulse-accent-blue)',
            opacity: isLive ? 0.3 : 1,
            flexShrink: 0,
          }}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>

        {/* Time label + collapse toggle */}
        <button
          onClick={() => setIsExpanded((e) => !e)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            padding: 0,
            flexShrink: 0,
          }}
          aria-label={isExpanded ? 'Collapse time range' : 'Expand time range'}
          aria-expanded={isExpanded}
        >
          <span
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--pulse-text-dim)',
              whiteSpace: 'nowrap',
            }}
          >
            {timeLabel}
          </span>
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', color: 'var(--pulse-text-dim)' }}
          >
            <ChevronDown size={10} />
          </motion.span>
        </button>

        {/* Track + handle container */}
        <div
          style={{ flex: 1, position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}
        >
          {/* Track */}
          <div
            ref={trackRef}
            onClick={handleTrackClick}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: 4,
              borderRadius: 9999,
              background: 'var(--pulse-surface-raised)',
              cursor: 'pointer',
              overflow: 'visible',
            }}
          >
            {/* Filled portion */}
            <div
              style={{
                height: '100%',
                width: `${scrubberProgress}%`,
                borderRadius: 9999,
                background: 'var(--pulse-accent-blue)',
                boxShadow: '0 0 6px var(--pulse-accent-blue)',
              }}
            />
          </div>

          {/* Draggable handle */}
          <motion.div
            onMouseDown={handleMouseDown}
            animate={{ scale: isDragging ? 1.2 : 1 }}
            transition={{ duration: 0.1 }}
            style={{
              position: 'absolute',
              left: `${scrubberProgress}%`,
              transform: 'translate(-50%, 0)',
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: 'var(--pulse-accent-blue)',
              border: '2px solid white',
              cursor: isDragging ? 'grabbing' : 'grab',
              zIndex: 2,
              top: '50%',
              marginTop: -6,
            }}
            aria-label={`Timeline position: ${timeLabel}`}
            aria-valuenow={Math.round(scrubberProgress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={timeLabel}
            role="slider"
          />

        </div>

        {/* LIVE indicator — click to jump to live */}
        <motion.div
          onClick={() => {
            setScrubberProgress(100)
            setIsPlaying(false)
          }}
          whileHover={{ opacity: 0.7 }}
          transition={{ duration: 0.2 }}
          aria-label="Jump to live"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            flexShrink: 0,
            cursor: 'pointer',
          }}
        >
          <span
            className={isLive ? 'animate-pulse' : ''}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--pulse-success)',
              boxShadow: isLive ? '0 0 6px var(--pulse-success)' : 'none',
              opacity: isLive ? 1 : 0.3,
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: isLive ? 'var(--pulse-success)' : 'var(--pulse-text-dim)',
            }}
          >
            LIVE
          </span>
        </motion.div>
      </div>
    </motion.div>
    </div>
    {createPortal(
      <AnimatePresence>
        {isDragging && (
          <motion.div
            key="tooltip"
            variants={tooltipVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position: 'fixed',
              left: tooltipLeft,
              bottom: tooltipBottom,
              transform: 'translateX(-50%)',
              background: 'var(--pulse-surface-raised)',
              border: '1px solid var(--pulse-accent-blue)',
              boxShadow: '0 0 8px rgba(59,130,246,0.4)',
              borderRadius: 3,
              padding: '2px 6px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 9999,
            }}
          >
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                letterSpacing: '0.08em',
                color: 'var(--pulse-text-primary)',
                textTransform: 'uppercase',
              }}
            >
              {timeLabel}
            </span>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </>
  )
}

export default TimelineScrubber
