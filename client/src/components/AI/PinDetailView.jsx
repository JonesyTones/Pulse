import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, X } from 'lucide-react'
import {
  FaGoogle, FaYoutube, FaReddit, FaNewspaper, FaInstagram,
} from 'react-icons/fa'
import { FaXTwitter, FaTiktok } from 'react-icons/fa6'
import useAppStore from '../../store/appStore.js'
import CollapsibleSection from './CollapsibleSection.jsx'

const SOURCE_COLORS = {
  google:    '#3B82F6',
  youtube:   '#EF4444',
  reddit:    '#F97316',
  gdelt:     '#F59E0B',
  twitter:   '#06B6D4',
  tiktok:    '#EC4899',
  instagram: '#A855F7',
}

const SOURCE_ICONS = {
  google:    FaGoogle,
  youtube:   FaYoutube,
  reddit:    FaReddit,
  gdelt:     FaNewspaper,
  twitter:   FaXTwitter,
  tiktok:    FaTiktok,
  instagram: FaInstagram,
}

const SOURCE_LABELS = {
  google:    'GOOGLE TRENDS',
  youtube:   'YOUTUBE',
  reddit:    'REDDIT',
  gdelt:     'GDELT',
  twitter:   'X / TWITTER',
  tiktok:    'TIKTOK',
  instagram: 'INSTAGRAM',
}

const MOCK_SOURCES = new Set(['reddit', 'gdelt', 'twitter', 'tiktok', 'instagram'])

const getRelativeTime = (iso) => {
  const diffMs  = Date.now() - new Date(iso).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1)  return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24)  return `${diffHr}h ago`
  return `${Math.floor(diffHr / 24)}d ago`
}

const PinDetailView = () => {
  const activePinDetail    = useAppStore((s) => s.activePinDetail)
  const setIsPinDetailOpen = useAppStore((s) => s.setIsPinDetailOpen)
  const setActivePinDetail = useAppStore((s) => s.setActivePinDetail)
  const trendData          = useAppStore((s) => s.trendData)
  const savedArticles      = useAppStore((s) => s.savedArticles)
  const addSavedArticle    = useAppStore((s) => s.addSavedArticle)

  if (!activePinDetail) return null

  const data   = activePinDetail
  const color  = SOURCE_COLORS[data.source] || '#3B82F6'
  const Icon   = SOURCE_ICONS[data.source]
  const isMock = MOCK_SOURCES.has(data.source)
  const isSaved = savedArticles.some((a) => a.id === data.id)

  const handleBack = () => {
    setIsPinDetailOpen(false)
    setActivePinDetail(null)
  }

  // Related items: same source, different id
  const relatedItems = trendData
    .filter((d) => d.source === data.source && d.id !== data.id)
    .slice(0, 5)

  // Render metadata key-value pairs
  const metaEntries = data.metadata ? Object.entries(data.metadata) : []

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1, transition: { type: 'spring', damping: 30, stiffness: 300 } }}
      exit={{ x: '100%', opacity: 0, transition: { duration: 0.2 } }}
      aria-label={`Article detail for ${data.topic}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'var(--pulse-surface)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          borderBottom: '1px solid var(--pulse-border)',
          flexShrink: 0,
        }}
      >
        <button
          onClick={handleBack}
          aria-label="Back to PULSE Intelligence"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--pulse-text-secondary)', padding: 0, display: 'flex',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--pulse-text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--pulse-text-secondary)')}
        >
          <ArrowLeft size={14} />
        </button>

        {Icon && <Icon size={16} color={color} />}

        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--pulse-text-primary)',
            flex: 1,
          }}
        >
          {SOURCE_LABELS[data.source]}
        </span>

        {isMock && (
          <span
            aria-label="Simulated data"
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              color: 'var(--pulse-text-dim)',
              border: '1px solid var(--pulse-text-dim)',
              padding: '1px 4px',
              borderRadius: 2,
            }}
          >
            MOCK
          </span>
        )}

        <button
          onClick={handleBack}
          aria-label="Close article detail"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--pulse-text-dim)', padding: 0, display: 'flex',
            opacity: 0.5, transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.5)}
        >
          <X size={14} />
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Hero section */}
        <div
          style={{
            borderLeft: `4px solid ${color}`,
            margin: '16px 16px 0',
            paddingLeft: 12,
          }}
        >
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 16,
              color: 'var(--pulse-text-primary)',
              lineHeight: 1.4,
              marginBottom: 8,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {data.topic}
          </p>
          <p
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              color: 'var(--pulse-text-secondary)',
              marginBottom: 8,
            }}
          >
            {data.region} · {getRelativeTime(data.timestamp)}
          </p>
          {/* Volume bar */}
          <div
            style={{
              height: 4, borderRadius: 2,
              background: 'var(--pulse-surface-raised)', overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%', width: `${data.volume}%`,
                background: color, borderRadius: 2,
              }}
            />
          </div>
        </div>

        {/* Metadata */}
        {metaEntries.length > 0 && (
          <div style={{ padding: '16px 16px 0' }}>
            {metaEntries.map(([key, value]) => {
              if (value === null || value === undefined || Array.isArray(value) && !value.length) return null
              const displayValue = Array.isArray(value) ? value.join(', ') : String(value)
              return (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    gap: 8,
                    marginBottom: 6,
                    alignItems: 'flex-start',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 10,
                      color: 'var(--pulse-text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      width: 100,
                      flexShrink: 0,
                    }}
                  >
                    {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 10,
                      color: 'var(--pulse-text-primary)',
                      flex: 1,
                      wordBreak: 'break-word',
                    }}
                  >
                    {displayValue}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Action bar */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: '16px',
          }}
        >
          <button
            onClick={() => !isSaved && addSavedArticle(data)}
            disabled={isSaved}
            aria-label={isSaved ? 'Article saved' : 'Save article'}
            style={{
              flex: 1,
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '8px 12px',
              background: 'none',
              border: `1px solid ${isSaved ? 'var(--pulse-border)' : color}`,
              borderRadius: 3,
              color: isSaved ? 'var(--pulse-text-dim)' : color,
              cursor: isSaved ? 'default' : 'pointer',
              opacity: isSaved ? 0.6 : 1,
            }}
          >
            {isSaved ? 'SAVED ✓' : 'SAVE ARTICLE'}
          </button>
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open original source"
            style={{
              flex: 1,
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '8px 12px',
              background: 'none',
              border: '1px solid var(--pulse-border)',
              borderRadius: 3,
              color: 'var(--pulse-text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              textDecoration: 'none',
            }}
          >
            OPEN SOURCE <ExternalLink size={10} />
          </a>
        </div>

        {/* Related trends */}
        {relatedItems.length > 0 && (
          <CollapsibleSection title="RELATED TRENDS" defaultOpen={true}>
            <div style={{ paddingBottom: 8 }}>
              {relatedItems.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ background: 'var(--pulse-surface-raised)' }}
                  transition={{ duration: 0.2 }}
                  onClick={() => {
                    useAppStore.getState().setActivePinDetail(item)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '8px 16px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {Icon && <Icon size={12} color={color} style={{ flexShrink: 0 }} />}
                  <span
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 10,
                      color: 'var(--pulse-text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                    }}
                  >
                    {item.topic}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 9,
                      color: 'var(--pulse-text-dim)',
                      flexShrink: 0,
                    }}
                  >
                    {item.region}
                  </span>
                </motion.button>
              ))}
            </div>
          </CollapsibleSection>
        )}
      </div>
    </motion.div>
  )
}

export default PinDetailView
