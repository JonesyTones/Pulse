import { motion, AnimatePresence } from 'framer-motion'
import { Clock, X } from 'lucide-react'
import useAppStore from '../../store/appStore.js'
import useClickOutside from '../../hooks/useClickOutside.js'
import { useRef } from 'react'

const getRelativeTime = (isoTimestamp) => {
  const diffMs = Date.now() - new Date(isoTimestamp).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  return `${Math.floor(diffMin / 60)}h ago`
}

const SearchHistory = ({ onSelect, onClose }) => {
  const searchHistory = useAppStore((s) => s.searchHistory)
  const setSearchHistory = useAppStore((s) => s.setSearchHistory)
  const ref = useRef(null)

  useClickOutside(ref, onClose)

  if (!searchHistory.length) return null

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15 }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: 4,
        background: 'var(--pulse-surface)',
        border: '1px solid var(--pulse-border)',
        borderRadius: 4,
        overflow: 'hidden',
        zIndex: 10,
        maxHeight: 240,
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 12px',
          borderBottom: '1px solid var(--pulse-border)',
        }}
      >
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 9,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--pulse-text-secondary)',
          }}
        >
          RECENT SEARCHES
        </span>
        <button
          onClick={() => setSearchHistory([])}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Space Mono', monospace",
            fontSize: 9,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--pulse-accent-blue)',
            padding: 0,
          }}
          aria-label="Clear search history"
        >
          CLEAR ALL
        </button>
      </div>

      {searchHistory.map((item, i) => (
        <motion.button
          key={item.id ?? i}
          whileHover={{ background: 'var(--pulse-surface-raised)' }}
          transition={{ duration: 0.2 }}
          onClick={() => { onSelect(item.label); onClose() }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            padding: '8px 12px',
            background: 'none',
            border: 'none',
            borderBottom: i < searchHistory.length - 1 ? '1px solid var(--pulse-border)' : 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <Clock size={10} color="var(--pulse-text-dim)" style={{ flexShrink: 0 }} />
          <span
            style={{
              flex: 1,
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--pulse-text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </span>
          <span
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              color: 'var(--pulse-text-dim)',
              flexShrink: 0,
            }}
          >
            {getRelativeTime(item.timestamp)}
          </span>
        </motion.button>
      ))}
    </motion.div>
  )
}

export default SearchHistory
