import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Send, Loader2 } from 'lucide-react'
import DOMPurify from 'dompurify'
import useAIQuery from '../../hooks/useAIQuery.js'
import useAppStore from '../../store/appStore.js'

const MAX_LENGTH = 500

const QueryBar = () => {
  const [value, setValue]       = useState('')
  const [focused, setFocused]   = useState(false)
  const [showError, setShowError] = useState(false)

  const { submit, isLoading, error } = useAIQuery()
  const activeTags = useAppStore((s) => s.activeTags)
  const activeTagCount = activeTags.filter((t) => t.active !== false).length

  // Auto-dismiss error after 3 seconds
  useEffect(() => {
    if (!error) { setShowError(false); return }
    setShowError(true)
    const id = setTimeout(() => setShowError(false), 3000)
    return () => clearTimeout(id)
  }, [error])

  const handleSubmit = (e) => {
    e.preventDefault()
    const clean = DOMPurify.sanitize(value).trim()
    if (!clean || isLoading) return
    submit(clean)
    setValue('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e)
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(600px, calc(100vw - 32px))',
        zIndex: 50,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'var(--pulse-surface)',
          border: `1px solid ${focused ? '#3B82F6' : '#252B3B'}`,
          padding: '10px 14px',
          boxShadow: '0 0 20px rgba(59,130,246,0.15)',
          transition: 'border-color 0.2s',
        }}
      >
        {/* Activity icon + optional filter badge */}
        <div style={{ position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <Activity
            size={16}
            className="animate-pulse"
            style={{ color: '#3B82F6' }}
            aria-hidden="true"
          />
          {activeTagCount > 0 && (
            <span
              aria-label={`${activeTagCount} active filters`}
              style={{
                position: 'absolute',
                top: -8,
                right: -10,
                fontFamily: "'Space Mono', monospace",
                fontSize: 8,
                color: '#3B82F6',
                background: 'var(--pulse-surface)',
                border: '1px solid #3B82F6',
                padding: '0 3px',
                borderRadius: 2,
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}
            >
              {activeTagCount}
            </span>
          )}
        </div>

        <input
          type="text"
          role="searchbox"
          aria-label="Ask PULSE about global trends"
          placeholder={isLoading ? 'ANALYZING...' : 'Ask PULSE about global trends...'}
          value={value}
          maxLength={MAX_LENGTH}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={isLoading}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            letterSpacing: '0.05em',
            color: isLoading ? 'var(--pulse-text-dim)' : 'var(--pulse-text-primary)',
          }}
        />

        <motion.button
          type="submit"
          aria-label={isLoading ? 'Analyzing...' : 'Send query'}
          disabled={isLoading || !value.trim()}
          style={{
            background: 'transparent',
            border: '1px solid #3B82F6',
            padding: '6px 14px',
            cursor: value.trim() && !isLoading ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#3B82F6',
            opacity: value.trim() && !isLoading ? 1 : 0.5,
            flexShrink: 0,
          }}
          whileHover={value.trim() && !isLoading ? { background: '#3B82F6', color: '#ffffff' } : {}}
          whileTap={value.trim() && !isLoading ? { scale: 0.95 } : {}}
          transition={{ duration: 0.2 }}
        >
          {isLoading
            ? <Loader2 size={13} className="animate-spin" />
            : <Send size={13} />
          }
          {isLoading ? 'WAIT' : 'SEND'}
        </motion.button>
      </form>

      {/* Error toast */}
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            style={{
              marginTop: 6,
              padding: '6px 12px',
              background: 'var(--pulse-surface)',
              border: '1px solid #EF4444',
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              color: '#EF4444',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default QueryBar
