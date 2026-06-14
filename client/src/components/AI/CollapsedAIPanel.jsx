import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import useAppStore from '../../store/appStore.js'

const CollapsedAIPanel = () => {
  const setIsAIPanelOpen = useAppStore((s) => s.setIsAIPanelOpen)
  const prefersReduced   = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <motion.button
      initial={prefersReduced ? { opacity: 0 } : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={prefersReduced ? { opacity: 0 } : { opacity: 0, x: 20 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      whileHover={{ borderColor: 'var(--pulse-accent-blue)' }}
      onClick={() => setIsAIPanelOpen(true)}
      aria-label="Open PULSE Intelligence panel"
      style={{
        position: 'fixed',
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 32,
        height: 160,
        background: 'var(--pulse-surface)',
        borderLeft: '1px solid var(--pulse-border)',
        borderTop: '1px solid var(--pulse-border)',
        borderBottom: '1px solid var(--pulse-border)',
        borderRight: 'none',
        borderRadius: '4px 0 0 4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 0,
        transition: 'border-color 0.2s',
        overflow: 'hidden',
      }}
    >
      {/* Rotated label + icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transform: 'rotate(90deg)',
          transformOrigin: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        <Activity
          size={12}
          color="var(--pulse-accent-blue)"
          className="animate-pulse"
          aria-hidden
        />
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--pulse-text-secondary)',
          }}
        >
          PULSE INTELLIGENCE
        </span>
      </div>
    </motion.button>
  )
}

export default CollapsedAIPanel
