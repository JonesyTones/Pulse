import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, Map } from 'lucide-react'
import useAppStore from '../../store/appStore.js'
import useClickOutside from '../../hooks/useClickOutside.js'
import DataSourcesPanel from './DataSourcesPanel.jsx'
import MapStylePanel from './MapStylePanel.jsx'

const CONTROLS = [
  { id: 'dataSources', icon: Database, label: 'DATA SOURCES', delay: 0.20 },
  { id: 'mapStyle',    icon: Map,      label: 'MAP STYLE',    delay: 0.30 },
]

const PANEL_MAP = {
  dataSources: DataSourcesPanel,
  mapStyle:    MapStylePanel,
}

const ControlButton = ({ control, isActive, onClick, suppressTooltip }) => {
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const { icon: Icon, label, delay } = control

  return (
    <motion.div
      style={{ position: 'relative' }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0, transition: { delay, duration: 0.3 } }}
    >
      <motion.button
        onClick={onClick}
        onHoverStart={() => setTooltipVisible(true)}
        onHoverEnd={() => setTooltipVisible(false)}
        aria-label={label}
        aria-pressed={isActive}
        style={{
          width: 44,
          height: 44,
          background: isActive ? '#1A1F2E' : 'var(--pulse-surface)',
          border: `1px solid ${isActive ? '#3B82F6' : '#252B3B'}`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isActive ? '#3B82F6' : '#6B7A99',
        }}
        whileHover={{ scale: 1.05, x: 4 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Icon size={17} />
      </motion.button>

      <AnimatePresence>
        {tooltipVisible && !suppressTooltip && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.3 } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            style={{
              position: 'absolute',
              left: 'calc(100% + 10px)',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'var(--pulse-surface-raised)',
              border: '1px solid var(--pulse-border)',
              padding: '4px 10px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--pulse-text-primary)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 60,
            }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const FloatingControls = () => {
  const openPanel = useAppStore((s) => s.openPanel)
  const setOpenPanel = useAppStore((s) => s.setOpenPanel)
  const ref = useRef(null)

  const handleToggle = (id) => {
    setOpenPanel(openPanel === id ? null : id)
  }

  useClickOutside(ref, () => setOpenPanel(null))

  const ActivePanel = openPanel ? PANEL_MAP[openPanel] : null

  return (
    <div ref={ref} style={{ position: 'fixed', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 50 }}>
      {/* Icon column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {CONTROLS.map((c) => (
          <ControlButton
            key={c.id}
            control={c}
            isActive={openPanel === c.id}
            onClick={() => handleToggle(c.id)}
            suppressTooltip={openPanel !== null}
          />
        ))}
      </div>

      {/* Sliding panel */}
      <AnimatePresence>
        {ActivePanel && (
          <motion.div
            key={openPanel}
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } }}
            exit={{ x: -300, opacity: 0, transition: { duration: 0.2 } }}
            style={{ position: 'absolute', left: 54, top: 0, zIndex: 55 }}
          >
            <ActivePanel onClose={() => setOpenPanel(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FloatingControls
