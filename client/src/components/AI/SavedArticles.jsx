import { motion } from 'framer-motion'
import { X } from 'lucide-react'
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

const getRelativeTime = (iso) => {
  const diffMs  = Date.now() - new Date(iso).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1)  return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  return `${Math.floor(diffMin / 60)}h ago`
}

const SavedArticles = () => {
  const savedArticles      = useAppStore((s) => s.savedArticles)
  const removeSavedArticle = useAppStore((s) => s.removeSavedArticle)
  const setActivePinDetail = useAppStore((s) => s.setActivePinDetail)
  const setIsPinDetailOpen = useAppStore((s) => s.setIsPinDetailOpen)

  return (
    <CollapsibleSection
      title="SAVED ARTICLES"
      badge={savedArticles.length || undefined}
      defaultOpen={false}
    >
      <div aria-live="polite">
        {savedArticles.length === 0 ? (
          <div
            style={{
              padding: '16px',
              textAlign: 'center',
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--pulse-text-dim)',
            }}
          >
            NO SAVED ARTICLES
          </div>
        ) : (
          savedArticles.map((article) => {
            const color = SOURCE_COLORS[article.source] || '#3B82F6'
            const Icon  = SOURCE_ICONS[article.source]

            return (
              <motion.div
                key={article.id}
                layout
                whileHover={{ background: 'var(--pulse-surface-raised)' }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderLeft: `3px solid ${color}`,
                  borderBottom: '1px solid var(--pulse-border)',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setActivePinDetail(article)
                  setIsPinDetailOpen(true)
                }}
              >
                {Icon && <Icon size={12} color={color} style={{ flexShrink: 0 }} />}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12,
                      color: 'var(--pulse-text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: 2,
                    }}
                  >
                    {article.topic}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 10,
                      color: 'var(--pulse-text-dim)',
                    }}
                  >
                    {article.region} · {getRelativeTime(article.savedAt)}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeSavedArticle(article.id)
                  }}
                  aria-label={`Remove ${article.topic} from saved`}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--pulse-text-dim)', padding: 0,
                    display: 'flex', opacity: 0.5, transition: 'opacity 0.2s', flexShrink: 0,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.5)}
                >
                  <X size={12} />
                </button>
              </motion.div>
            )
          })
        )}
      </div>
    </CollapsibleSection>
  )
}

export default SavedArticles
