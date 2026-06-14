import { motion, AnimatePresence } from 'framer-motion'
import { Activity } from 'lucide-react'
import useAppStore from '../../store/appStore.js'

const PulseLoader = () => {
  const isAppLoading   = useAppStore((s) => s.isAppLoading)
  const loadingMessage = useAppStore((s) => s.loadingMessage)

  return (
    <AnimatePresence>
      {isAppLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 400,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-busy="true"
          aria-label="Loading PULSE"
          role="status"
        >
          <div
            style={{
              background: 'var(--pulse-surface)',
              border: '1px solid var(--pulse-border)',
              width: 280,
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Pulsing status text */}
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 12,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--pulse-text-secondary)',
              }}
            >
              {loadingMessage || 'PULSING...'}
            </motion.span>

            {/* Logo box with light sweep */}
            <div
              style={{
                marginTop: 24,
                width: 120,
                height: 120,
                background: 'var(--pulse-surface-raised)',
                border: '1px solid var(--pulse-border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Activity size={40} color="var(--pulse-accent-blue)" />
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--pulse-text-primary)',
                }}
              >
                PULSE
              </span>

              {/* Diagonal light sweep */}
              <motion.div
                animate={{ x: [-60, 180] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  repeatDelay: 0.5,
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: 40,
                  height: '100%',
                  background:
                    'linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PulseLoader
