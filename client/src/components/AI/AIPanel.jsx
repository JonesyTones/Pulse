import { motion, AnimatePresence } from 'framer-motion'
import { Activity, X, ExternalLink } from 'lucide-react'
import {
  FaGoogle, FaYoutube, FaReddit, FaNewspaper, FaInstagram,
} from 'react-icons/fa'
import { FaXTwitter, FaTiktok } from 'react-icons/fa6'
import useAppStore from '../../store/appStore.js'
import CollapsibleSection from './CollapsibleSection.jsx'
import PinDetailView from './PinDetailView.jsx'
import SavedArticles from './SavedArticles.jsx'

const SOURCE_COLORS = {
  google:    '#3B82F6',
  youtube:   '#EF4444',
  bbc:       '#1D4ED8',
  euronews:  '#F59E0B',
  guardian:  '#059669',
  nypost:    '#DC2626',
  aljazeera: '#D97706',
  reddit:    '#F97316',
  twitter:   '#06B6D4',
  tiktok:    '#EC4899',
  instagram: '#A855F7',
}

const SOURCE_ICONS = {
  google:    FaGoogle,
  youtube:   FaYoutube,
  bbc:       FaNewspaper,
  euronews:  FaNewspaper,
  guardian:  FaNewspaper,
  nypost:    FaNewspaper,
  aljazeera: FaNewspaper,
  reddit:    FaReddit,
  twitter:   FaXTwitter,
  tiktok:    FaTiktok,
  instagram: FaInstagram,
}

const SOURCE_LABELS = {
  google:    'GOOGLE TRENDS',
  youtube:   'YOUTUBE',
  bbc:       'BBC WORLD',
  euronews:  'EURONEWS',
  guardian:  'THE GUARDIAN',
  nypost:    'NY POST',
  aljazeera: 'AL JAZEERA',
  reddit:    'REDDIT',
  twitter:   'X / TWITTER',
  tiktok:    'TIKTOK',
  instagram: 'INSTAGRAM',
}

const MOCK_SOURCES = new Set(['reddit', 'twitter', 'tiktok', 'instagram'])

// Uppercase relative time — Global Activity Summary
const getRelativeTimeUpper = (iso) => {
  const diffMs  = Date.now() - new Date(iso).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1)  return 'JUST NOW'
  if (diffMin < 60) return `${diffMin} MIN AGO`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24)  return `${diffHr}H AGO`
  return `${Math.floor(diffHr / 24)}D AGO`
}

// Lowercase relative time — Live Feed
const getRelativeTime = (iso) => {
  const diffMs  = Date.now() - new Date(iso).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1)  return 'just now'
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24)  return `${diffHr}h ago`
  return `${Math.floor(diffHr / 24)}d ago`
}

const MockBadge = () => (
  <span
    aria-label="Simulated data"
    style={{
      fontFamily: "'Space Mono', monospace",
      fontSize: 8,
      color: 'var(--pulse-text-dim)',
      border: '1px solid var(--pulse-text-dim)',
      padding: '1px 3px',
      borderRadius: 2,
      flexShrink: 0,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    }}
  >
    MOCK
  </span>
)

const AIPanel = () => {
  const isAIPanelOpen    = useAppStore((s) => s.isAIPanelOpen)
  const setIsAIPanelOpen = useAppStore((s) => s.setIsAIPanelOpen)
  const aiResponse       = useAppStore((s) => s.aiResponse)
  const trendData        = useAppStore((s) => s.trendData)
  const activeSources    = useAppStore((s) => s.activeSources)
  const isPinDetailOpen  = useAppStore((s) => s.isPinDetailOpen)

  if (!isAIPanelOpen) return null

  const topTrends = [...trendData]
    .filter((d) => activeSources.includes(d.source))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5)

  const liveFeed = [...trendData]
    .filter((d) => activeSources.includes(d.source))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10)

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1, transition: { type: 'spring', damping: 30, stiffness: 300 } }}
      exit={{ x: '100%', opacity: 0, transition: { duration: 0.2 } }}
      style={{
        position: 'fixed',
        top: 48,
        right: 0,
        width: 440,
        bottom: 0,
        background: 'var(--pulse-surface)',
        borderLeft: '1px solid var(--pulse-border)',
        zIndex: 70,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      aria-label="PULSE Intelligence panel"
      aria-live="assertive"
      aria-busy={!aiResponse && !!useAppStore.getState().aiResponse}
    >
      {/* Header */}
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
        <Activity size={14} color="var(--pulse-accent-blue)" className="animate-pulse" aria-hidden />
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--pulse-text-primary)',
            flex: 1,
          }}
        >
          PULSE INTELLIGENCE
        </span>
        <button
          onClick={() => setIsAIPanelOpen(false)}
          aria-label="Close intelligence panel"
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

      {/* Scrollable sections */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* 1 — Global Activity Summary */}
        <CollapsibleSection title="GLOBAL ACTIVITY SUMMARY" defaultOpen={true}>
          <div style={{ paddingBottom: 4 }}>
            {topTrends.length === 0 ? (
              <div style={{ padding: '12px 16px', fontFamily: "'Space Mono', monospace", fontSize: 10, color: 'var(--pulse-text-dim)' }}>
                LOADING DATA...
              </div>
            ) : topTrends.map((item) => {
              const color = SOURCE_COLORS[item.source] || '#3B82F6'
              return (
                <div key={item.id} style={{ padding: '8px 16px 10px' }}>
                  {/* Topic + timestamp row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span
                      style={{
                        flex: 1,
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 11,
                        color: 'var(--pulse-text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
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
                      {getRelativeTimeUpper(item.timestamp)}
                    </span>
                  </div>
                  {/* Full-width volume bar in source color */}
                  <div style={{ height: 3, borderRadius: 1, background: `${color}33` }}>
                    <div style={{ height: '100%', width: `${item.volume}%`, background: color, borderRadius: 1 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </CollapsibleSection>

        {/* 2 — Analysis */}
        {aiResponse && (
          <CollapsibleSection title="ANALYSIS" defaultOpen={true}>
            <div style={{ padding: '12px 16px' }}>
              {/*
               * Confidence block floated right so answer text wraps around it.
               * float must come before the text node in DOM order.
               */}
              <div style={{ float: 'right', textAlign: 'right', marginLeft: 16, marginBottom: 4 }}>
                <p
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 9,
                    color: 'var(--pulse-text-dim)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: 2,
                  }}
                >
                  CONFIDENCE
                </p>
                <p
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 36,
                    fontWeight: 'bold',
                    color: 'var(--pulse-accent-blue)',
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {aiResponse.confidence}%
                </p>
                <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: 'var(--pulse-text-dim)' }}>
                  {aiResponse.citations?.length ?? 0} sources
                </p>
              </div>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  color: 'var(--pulse-text-primary)',
                  lineHeight: 1.6,
                }}
              >
                {aiResponse.answer}
              </p>
              <div style={{ clear: 'both' }} />
            </div>
          </CollapsibleSection>
        )}

        {/* 3 — Sources */}
        {aiResponse?.citations?.length > 0 && (
          <CollapsibleSection title="SOURCES" defaultOpen={false}>
            <div style={{ paddingBottom: 4 }}>
              {aiResponse.citations.map((cite, i) => {
                const color    = SOURCE_COLORS[cite.source] || '#6B7A99'
                const isMock   = MOCK_SOURCES.has(cite.source)
                const srcLabel = SOURCE_LABELS[cite.source] || (cite.source?.toUpperCase() ?? 'SOURCE')
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 16px',
                      borderTop: i > 0 ? '1px solid var(--pulse-border)' : 'none',
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    {/* Source label — clickable row opens URL */}
                    <a
                      href={cite.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0, textDecoration: 'none', minWidth: 0 }}
                    >
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: 'var(--pulse-text-secondary)', flexShrink: 0 }}>
                        {srcLabel}
                      </span>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: 'var(--pulse-text-secondary)', flexShrink: 0, margin: '0 4px' }}>
                        —
                      </span>
                      <span
                        style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: 10,
                          color: color,
                          textDecoration: 'underline',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                        }}
                      >
                        {cite.title}
                      </span>
                      <ExternalLink size={9} color={color} style={{ flexShrink: 0, marginLeft: 4 }} />
                    </a>
                    {isMock && <MockBadge />}
                  </div>
                )
              })}
            </div>
          </CollapsibleSection>
        )}

        {/* 4 — Live Feed */}
        <CollapsibleSection title="LIVE FEED" defaultOpen={false}>
          <div>
            {liveFeed.length === 0 ? (
              <div style={{ padding: '12px 16px', fontFamily: "'Space Mono', monospace", fontSize: 10, color: 'var(--pulse-text-dim)' }}>
                LOADING FEED...
              </div>
            ) : liveFeed.map((item) => {
              const color       = SOURCE_COLORS[item.source] || '#3B82F6'
              const description = item.metadata?.description
                || item.metadata?.summary
                || item.metadata?.content
                || null
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ background: 'var(--pulse-surface-raised)' }}
                  transition={{ duration: 0.2 }}
                  onClick={() => {
                    useAppStore.getState().setActivePinDetail(item)
                    useAppStore.getState().setIsPinDetailOpen(true)
                  }}
                  style={{
                    padding: '10px 16px',
                    borderTop: '1px solid var(--pulse-border)',
                    cursor: 'pointer',
                  }}
                >
                  {/* Row 1: source label + timestamp */}
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, marginRight: 6, flexShrink: 0 }} />
                    <span
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 9,
                        color: color,
                        flex: 1,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {SOURCE_LABELS[item.source]}
                    </span>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: 'var(--pulse-text-dim)' }}>
                      {getRelativeTime(item.timestamp)}
                    </span>
                  </div>
                  {/* Row 2: topic title */}
                  <p
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 11,
                      color: 'var(--pulse-text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: description ? 3 : 0,
                    }}
                  >
                    {item.topic}
                  </p>
                  {/* Row 3: content excerpt (when available in metadata) */}
                  {description && (
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 11,
                        color: 'var(--pulse-text-dim)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {description}
                    </p>
                  )}
                </motion.div>
              )
            })}
          </div>
        </CollapsibleSection>

        {/* 5 — Saved Articles */}
        <SavedArticles />
      </div>

      {/* PinDetailView — absolute overlay inside this fixed panel */}
      <AnimatePresence>
        {isPinDetailOpen && <PinDetailView key="pin-detail" />}
      </AnimatePresence>
    </motion.div>
  )
}

export default AIPanel
