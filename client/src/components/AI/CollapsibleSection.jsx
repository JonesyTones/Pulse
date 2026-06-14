import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

const CollapsibleSection = ({
  title,
  badge,
  defaultOpen = true,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div style={{ borderBottom: '1px solid var(--pulse-border)' }}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '10px 16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* Chevron LEFT of title — points right when closed, down when open */}
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'flex', color: 'var(--pulse-text-dim)', flexShrink: 0 }}
        >
          <ChevronRight size={12} />
        </motion.span>

        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--pulse-text-secondary)',
            flex: 1,
          }}
        >
          {title}
        </span>

        {badge !== undefined && (
          <span
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              background: 'var(--pulse-surface-raised)',
              border: '1px solid var(--pulse-border)',
              color: 'var(--pulse-text-dim)',
              padding: '1px 5px',
              borderRadius: 2,
            }}
          >
            {badge}
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, transition: { duration: 0.2 } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
            style={{ overflow: 'hidden' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CollapsibleSection
