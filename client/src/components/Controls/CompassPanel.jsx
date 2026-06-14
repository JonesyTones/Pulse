import { motion } from 'framer-motion'
import { Slider } from '@chakra-ui/react'
import { X } from 'lucide-react'
import useAppStore from '../../store/appStore.js'
import { useMapContext } from '../../context/MapContext.jsx'

const CompassPanel = ({ onClose }) => {
  const compassHeading    = useAppStore((s) => s.compassHeading)
  const compassTilt       = useAppStore((s) => s.compassTilt)
  const setCompassHeading = useAppStore((s) => s.setCompassHeading)
  const setCompassTilt    = useAppStore((s) => s.setCompassTilt)
  const map = useMapContext()

  const handleHeading = (value) => {
    setCompassHeading(value)
    if (map) map.rotateTo(value, { duration: 200 })
  }

  const handleTilt = (value) => {
    setCompassTilt(value)
    if (map) map.easeTo({ pitch: value, duration: 200 })
  }

  const fmt = (n) => String(Math.round(n)).padStart(3, '0') + '°'

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        width: 200,
        background: 'var(--pulse-surface)',
        border: '1px solid var(--pulse-border)',
        borderRadius: 4,
        overflow: 'hidden',
        position: 'absolute',
        left: 52,
        bottom: 0,
        zIndex: 50,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
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
          COMPASS
        </span>
        <button
          onClick={onClose}
          aria-label="Close compass panel"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--pulse-text-dim)', padding: 0, display: 'flex',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.7)}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
        >
          <X size={13} />
        </button>
      </div>

      {/* Sliders */}
      <div style={{ padding: '14px' }}>
        {/* Heading */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--pulse-text-secondary)',
              }}
            >
              HEADING
            </span>
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                color: 'var(--pulse-accent-blue)',
              }}
            >
              {fmt(compassHeading)}
            </span>
          </div>
          <Slider.Root
            value={[compassHeading]}
            onValueChange={({ value }) => handleHeading(value[0])}
            min={0}
            max={360}
            step={1}
            aria-label="Map heading"
            colorPalette="blue"
          >
            <Slider.Control>
              <Slider.Track>
                <Slider.Range />
              </Slider.Track>
              <Slider.Thumb index={0}>
                <Slider.HiddenInput />
              </Slider.Thumb>
            </Slider.Control>
          </Slider.Root>
        </div>

        {/* Tilt */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--pulse-text-secondary)',
              }}
            >
              TILT
            </span>
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                color: 'var(--pulse-accent-blue)',
              }}
            >
              {fmt(compassTilt)}
            </span>
          </div>
          <Slider.Root
            value={[compassTilt]}
            onValueChange={({ value }) => handleTilt(value[0])}
            min={0}
            max={60}
            step={1}
            aria-label="Map tilt"
            colorPalette="blue"
          >
            <Slider.Control>
              <Slider.Track>
                <Slider.Range />
              </Slider.Track>
              <Slider.Thumb index={0}>
                <Slider.HiddenInput />
              </Slider.Thumb>
            </Slider.Control>
          </Slider.Root>
        </div>
      </div>
    </motion.div>
  )
}

export default CompassPanel
