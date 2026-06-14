import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User } from 'lucide-react'
import useClickOutside from '../../hooks/useClickOutside.js'

const ITEMS = [
  { label: 'VIEW CV', href: '/resume.pdf' },
  { label: 'LINKEDIN', href: '#' },
]

const ProfileMenu = () => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useClickOutside(ref, () => setOpen(false))

  return (
    <div
      ref={ref}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{ position: 'relative' }}
    >
      <motion.button
        onClick={() => setOpen((v) => !v)}
        aria-label="Profile menu"
        aria-expanded={open}
        aria-haspopup="true"
        style={{
          width: 32,
          height: 32,
          background: 'transparent',
          border: '1px solid #252B3B',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6B7A99',
        }}
        whileHover={{ borderColor: '#3B82F6', color: '#F0F4FF' }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <User size={15} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.15 } }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.1 } }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              minWidth: 160,
              background: 'var(--pulse-surface-raised)',
              border: '1px solid var(--pulse-border)',
              zIndex: 200,
            }}
            role="menu"
          >
            {ITEMS.map((item) => (
              <motion.a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                onClick={() => setOpen(false)}
                style={{
                  display: 'block',
                  padding: '10px 16px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--pulse-text-primary)',
                  textDecoration: 'none',
                  background: 'transparent',
                }}
                whileHover={{ background: '#111318' }}
                transition={{ duration: 0.15 }}
              >
                {item.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProfileMenu
