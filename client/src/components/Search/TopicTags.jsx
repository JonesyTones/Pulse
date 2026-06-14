import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Hash, Bookmark, BookmarkCheck, X } from 'lucide-react'
import useAppStore from '../../store/appStore.js'

const tagVariants = {
  hidden:  { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, scale: 0.8, transition: { duration: 0.15 } },
}

const containerVariants = {
  hidden:  { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1, transition: { duration: 0.2 } },
  exit:    { height: 0, opacity: 0, transition: { duration: 0.2 } },
}

const TagItem = ({ tag }) => {
  const updateActiveTag = useAppStore((s) => s.updateActiveTag)
  const removeActiveTag = useAppStore((s) => s.removeActiveTag)

  const isActive = tag.active !== false
  const Icon = tag.type === 'region' ? MapPin : Hash
  const SaveIcon = tag.saved ? BookmarkCheck : Bookmark

  const borderColor = isActive ? 'var(--pulse-accent-blue)' : 'var(--pulse-border)'

  return (
    <motion.div
      layout
      variants={tagVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: 'var(--pulse-surface-raised)',
        border: `1px solid ${borderColor}`,
        borderRadius: 4,
        padding: '4px 8px',
        opacity: isActive ? 1 : 0.4,
        flexShrink: 0,
        cursor: 'pointer',
        userSelect: 'none',
      }}
      aria-label={`${tag.type} filter: ${tag.label}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          updateActiveTag(tag.id, { active: !isActive })
        }
      }}
    >
      <Icon
        size={10}
        color={isActive ? 'var(--pulse-accent-blue)' : 'var(--pulse-text-dim)'}
        style={{ flexShrink: 0 }}
      />

      <span
        onClick={() => updateActiveTag(tag.id, { active: !isActive })}
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: isActive ? 'var(--pulse-text-primary)' : 'var(--pulse-text-dim)',
          lineHeight: 1,
        }}
      >
        {tag.label}
      </span>

      <button
        onClick={(e) => {
          e.stopPropagation()
          updateActiveTag(tag.id, { saved: !tag.saved })
        }}
        aria-label={tag.saved ? 'Unsave tag' : 'Save tag'}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          display: 'flex',
          color: tag.saved ? 'var(--pulse-accent-blue)' : 'var(--pulse-text-dim)',
          opacity: 0.7,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.7)}
      >
        <SaveIcon size={10} />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation()
          removeActiveTag(tag.id)
        }}
        aria-label={`Remove ${tag.label} filter`}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          display: 'flex',
          color: 'var(--pulse-text-dim)',
          opacity: 0.5,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.5)}
      >
        <X size={10} />
      </button>
    </motion.div>
  )
}

const TopicTags = ({ width }) => {
  const activeTags = useAppStore((s) => s.activeTags)
  const scrollRef  = useRef(null)
  const [thumb, setThumb] = useState(null) // null = no overflow

  const updateThumb = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    if (el.scrollWidth <= el.clientWidth) { setThumb(null); return }
    const visibleRatio  = el.clientWidth / el.scrollWidth
    const scrollRatio   = el.scrollLeft / (el.scrollWidth - el.clientWidth)
    const thumbWidthPct = visibleRatio * 100
    const thumbLeftPct  = scrollRatio * (100 - thumbWidthPct)
    setThumb({ width: `${thumbWidthPct}%`, left: `${thumbLeftPct}%` })
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(updateThumb)
    ro.observe(el)
    el.addEventListener('scroll', updateThumb, { passive: true })
    updateThumb()
    return () => {
      ro.disconnect()
      el.removeEventListener('scroll', updateThumb)
    }
  }, [activeTags, updateThumb])

  return (
    <AnimatePresence initial={false}>
      {activeTags.length > 0 && (
        <motion.div
          key="tag-strip"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{ overflowY: 'hidden', width: width || '100%' }}
        >
          {/* Tag row */}
          <div
            ref={scrollRef}
            className="scrollbar-hidden"
            style={{
              display: 'flex',
              gap: 6,
              padding: '6px 0 4px',
              overflowX: 'auto',
              flexWrap: 'nowrap',
            }}
          >
            <AnimatePresence mode="popLayout">
              {activeTags.map((tag) => (
                <TagItem key={tag.id} tag={tag} />
              ))}
            </AnimatePresence>
          </div>

          {/* Custom scroll track — only renders when tags overflow */}
          {thumb && (
            <div
              style={{
                position: 'relative',
                height: 3,
                marginTop: 4,
                background: 'var(--pulse-surface-raised)',
                borderRadius: 2,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  height: '100%',
                  borderRadius: 2,
                  background: 'var(--pulse-accent-blue)',
                  width: thumb.width,
                  left: thumb.left,
                }}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default TopicTags
