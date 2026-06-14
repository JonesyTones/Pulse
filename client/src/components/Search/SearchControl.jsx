import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Clock } from 'lucide-react'
import DOMPurify from 'dompurify'
import useAppStore from '../../store/appStore.js'
import { useMapContext } from '../../context/MapContext.jsx'
import SearchHistory from './SearchHistory.jsx'
import TopicTags from './TopicTags.jsx'

// Common regions/countries used for type detection
const KNOWN_REGIONS = new Set([
  'united states', 'usa', 'us', 'uk', 'united kingdom', 'canada', 'australia',
  'germany', 'france', 'japan', 'china', 'india', 'brazil', 'mexico', 'russia',
  'south korea', 'italy', 'spain', 'netherlands', 'sweden', 'norway', 'denmark',
  'new york', 'los angeles', 'london', 'paris', 'tokyo', 'beijing', 'mumbai',
  'sydney', 'toronto', 'berlin', 'madrid', 'rome', 'amsterdam', 'seoul',
  'singapore', 'dubai', 'chicago', 'san francisco', 'miami', 'boston',
  'europe', 'asia', 'africa', 'north america', 'south america', 'middle east',
  'latin america', 'southeast asia', 'eastern europe', 'western europe',
])

// Approximate geo centers for known regions (for map flyTo)
const REGION_COORDS = {
  'united states': { center: [-98, 39], zoom: 3 },
  'usa': { center: [-98, 39], zoom: 3 },
  'us': { center: [-98, 39], zoom: 3 },
  'uk': { center: [-2, 54], zoom: 5 },
  'united kingdom': { center: [-2, 54], zoom: 5 },
  'canada': { center: [-96, 56], zoom: 3 },
  'australia': { center: [134, -25], zoom: 3 },
  'germany': { center: [10, 51], zoom: 5 },
  'france': { center: [2, 46], zoom: 5 },
  'japan': { center: [138, 36], zoom: 5 },
  'china': { center: [104, 35], zoom: 4 },
  'india': { center: [78, 22], zoom: 4 },
  'brazil': { center: [-53, -15], zoom: 3 },
  'europe': { center: [15, 52], zoom: 3 },
  'asia': { center: [90, 30], zoom: 2 },
}

const isRegion = (query) => KNOWN_REGIONS.has(query.toLowerCase().trim())

const SearchControl = () => {
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const map = useMapContext()

  const addActiveTag    = useAppStore((s) => s.addActiveTag)
  const searchHistory   = useAppStore((s) => s.searchHistory)
  const setSearchHistory = useAppStore((s) => s.setSearchHistory)
  const activeTags      = useAppStore((s) => s.activeTags)

  const handleSubmit = (rawValue) => {
    const clean = DOMPurify.sanitize(rawValue || inputValue).trim().slice(0, 500)
    if (!clean) return

    const type = isRegion(clean) ? 'region' : 'topic'

    // Fly map to region if known
    if (type === 'region' && map) {
      const coords = REGION_COORDS[clean.toLowerCase()]
      if (coords) {
        map.flyTo({ center: coords.center, zoom: coords.zoom, duration: 1200 })
      }
    }

    // Add tag (deduplication handled in store)
    const tag = {
      id: crypto.randomUUID(),
      type,
      label: clean,
      color: 'var(--pulse-accent-blue)',
      saved: false,
      active: true,
    }
    addActiveTag(tag)

    // Update search history
    const newEntry = { id: crypto.randomUUID(), label: clean, timestamp: new Date().toISOString() }
    setSearchHistory([newEntry, ...searchHistory].slice(0, 20))

    setInputValue('')
    setShowHistory(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') {
      setShowHistory(false)
      inputRef.current?.blur()
    }
  }

  const borderColor = isFocused ? 'var(--pulse-accent-blue)' : 'var(--pulse-border)'

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: 'min(600px, calc(100vw - 32px))',
        position: 'relative',
      }}
    >
      {/* Input row */}
      <motion.div
        animate={{ borderColor }}
        transition={{ duration: 0.2 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--pulse-surface)',
          border: `1px solid ${borderColor}`,
          borderRadius: 4,
          padding: '0 12px',
          height: 40,
        }}
      >
        <Search size={14} color="var(--pulse-text-secondary)" style={{ flexShrink: 0 }} />

        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value.slice(0, 500))}
          onKeyDown={handleKeyDown}
          onFocus={() => { setIsFocused(true); setShowHistory(true) }}
          onBlur={() => setIsFocused(false)}
          placeholder="Search locations or topics..."
          maxLength={500}
          aria-label="Search locations or topics"
          role="searchbox"
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.04em',
            color: 'var(--pulse-text-primary)',
          }}
        />

        {/* History toggle */}
        {searchHistory.length > 0 && (
          <button
            onMouseDown={(e) => { e.preventDefault(); setShowHistory((v) => !v) }}
            aria-label="Toggle search history"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              color: showHistory ? 'var(--pulse-accent-blue)' : 'var(--pulse-text-dim)',
              padding: 0,
              transition: 'color 0.2s',
            }}
          >
            <Clock size={13} />
          </button>
        )}
      </motion.div>

      {/* Topic tags strip */}
      <TopicTags />

      {/* History dropdown */}
      <AnimatePresence>
        {showHistory && searchHistory.length > 0 && (
          <SearchHistory
            onSelect={(label) => { setInputValue(label); handleSubmit(label) }}
            onClose={() => setShowHistory(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default SearchControl
