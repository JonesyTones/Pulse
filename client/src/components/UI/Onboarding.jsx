import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, ArrowLeft, Search, X } from 'lucide-react'
import { Switch } from '@chakra-ui/react'
import {
  FaGoogle, FaYoutube, FaReddit, FaNewspaper, FaInstagram,
} from 'react-icons/fa'
import { FaXTwitter, FaTiktok } from 'react-icons/fa6'
import useAppStore from '../../store/appStore.js'
import useAIQuery from '../../hooks/useAIQuery.js'
import useClickOutside from '../../hooks/useClickOutside.js'

const TOPICS = [
  'POLITICS', 'TECHNOLOGY', 'SCIENCE', 'FINANCE',
  'CLIMATE', 'SPACE', 'HEALTH', 'CONFLICT',
  'CRIME', 'ENTERTAINMENT', 'SPORTS', 'CULTURE',
  'BUSINESS', 'AI & TECH', 'ENERGY', 'NATURAL EVENTS',
  'STRANGE EVENTS', 'CONSPIRACY', 'VIRAL', 'BREAKING NEWS',
  'ENVIRONMENT', 'RELIGION', 'MILITARY', 'CYBERSECURITY',
]

const NEWS_SOURCES = [
  { key: 'google',    label: 'GOOGLE TRENDS', color: '#3B82F6', icon: FaGoogle,    mock: false, defaultOn: true  },
  { key: 'youtube',   label: 'YOUTUBE',        color: '#EF4444', icon: FaYoutube,   mock: false, defaultOn: true  },
  { key: 'bbc',       label: 'BBC WORLD',      color: '#1D4ED8', icon: FaNewspaper, mock: false, defaultOn: true  },
  { key: 'euronews',  label: 'EURONEWS',       color: '#F59E0B', icon: FaNewspaper, mock: false, defaultOn: true  },
  { key: 'guardian',  label: 'THE GUARDIAN',   color: '#059669', icon: FaNewspaper, mock: false, defaultOn: true  },
  { key: 'nypost',    label: 'NY POST',         color: '#DC2626', icon: FaNewspaper, mock: false, defaultOn: true  },
  { key: 'aljazeera', label: 'AL JAZEERA',     color: '#D97706', icon: FaNewspaper, mock: false, defaultOn: true  },
]

const SOCIAL_SOURCES = [
  { key: 'reddit',    label: 'REDDIT',       color: '#F97316', icon: FaReddit,    mock: true, defaultOn: false },
  { key: 'twitter',   label: 'X / TWITTER', color: '#06B6D4', icon: FaXTwitter,  mock: true, defaultOn: false },
  { key: 'tiktok',    label: 'TIKTOK',       color: '#EC4899', icon: FaTiktok,    mock: true, defaultOn: false },
  { key: 'instagram', label: 'INSTAGRAM',    color: '#A855F7', icon: FaInstagram, mock: true, defaultOn: false },
]

const SOURCES = [...NEWS_SOURCES, ...SOCIAL_SOURCES]

const MAX_REGIONS = 3
const MAX_TOPICS  = 5
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

const slideVariants = {
  enter:  (dir) => ({ x: dir > 0 ? '40%' : '-40%', opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { type: 'spring', damping: 30, stiffness: 300 } },
  exit:   (dir) => ({ x: dir > 0 ? '-40%' : '40%', opacity: 0, transition: { duration: 0.18 } }),
}

const overlayVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit:    { opacity: 0, transition: { duration: 0.4 } },
}

// ─── Shared sub-components ──────────────────────────────────────────────────

const ProgressDots = ({ step }) => (
  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 4 }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <motion.div
        key={s}
        animate={{
          background: s <= step ? '#3B82F6' : 'var(--pulse-border)',
          scale: s === step ? 1.3 : 1,
        }}
        transition={{ duration: 0.2 }}
        style={{ width: 8, height: 8, borderRadius: '50%' }}
      />
    ))}
  </div>
)

const ContinueButton = ({ onClick, disabled, label = 'CONTINUE' }) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    whileHover={!disabled ? { background: 'var(--pulse-accent-blue)', color: '#fff' } : {}}
    whileTap={!disabled ? { scale: 0.97 } : {}}
    transition={{ duration: 0.2 }}
    aria-label={label}
    style={{
      width: '100%',
      padding: '14px 0',
      background: 'transparent',
      border: `1px solid ${!disabled ? 'var(--pulse-accent-blue)' : 'var(--pulse-border)'}`,
      color: !disabled ? 'var(--pulse-accent-blue)' : 'var(--pulse-text-dim)',
      fontFamily: "'Space Mono', monospace",
      fontSize: 13,
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      cursor: disabled ? 'not-allowed' : 'pointer',
      boxShadow: !disabled ? '0 0 20px rgba(59,130,246,0.3)' : 'none',
      flexShrink: 0,
    }}
  >
    {label}
  </motion.button>
)

const BackButton = ({ onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ borderColor: 'var(--pulse-accent-blue)', color: 'var(--pulse-accent-blue)' }}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.2 }}
    aria-label="Go back"
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      background: 'transparent',
      border: '1px solid var(--pulse-border)',
      color: 'var(--pulse-text-secondary)',
      cursor: 'pointer',
      padding: '6px 10px',
      width: 'fit-content',
      fontFamily: "'Space Mono', monospace",
      fontSize: 11,
      flexShrink: 0,
    }}
  >
    <ArrowLeft size={14} />
  </motion.button>
)

// ─── Left panel shared layout ────────────────────────────────────────────────

const LeftPanel = ({ step, onBack, title, body, note }) => (
  <div
    style={{
      width: '38%',
      padding: '28px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      borderRight: '1px solid var(--pulse-border)',
      flexShrink: 0,
      overflowY: 'auto',
    }}
  >
    <ProgressDots step={step} />
    <BackButton onClick={onBack} />
    <h2
      style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--pulse-text-primary)',
        margin: 0,
      }}
    >
      {title}
    </h2>
    <p
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 13,
        color: 'var(--pulse-text-secondary)',
        lineHeight: 1.65,
        margin: 0,
        flex: 1,
      }}
    >
      {body}
    </p>
    {note && (
      <div
        style={{
          border: '1px solid var(--pulse-border)',
          background: 'var(--pulse-surface-raised)',
          padding: '10px 12px',
        }}
      >
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            color: 'var(--pulse-text-dim)',
            lineHeight: 1.5,
          }}
        >
          {note}
        </span>
      </div>
    )}
    <span
      style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 10,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--pulse-text-dim)',
        flexShrink: 0,
      }}
    >
      STEP {step} OF 5
    </span>
  </div>
)

// ─── Step 1: Welcome ─────────────────────────────────────────────────────────

const StepWelcome = ({ onNext }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      padding: '20px 24px 32px',
    }}
  >
    <div
      style={{
        width: '100%',
        maxWidth: 460,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
      }}
    >
      <ProgressDots step={1} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
        <Activity size={30} color="var(--pulse-accent-blue)" />
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--pulse-text-primary)',
          }}
        >
          PULSE
        </span>
      </div>

      <span
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: 'var(--pulse-text-secondary)',
        }}
      >
        GLOBAL INTELLIGENCE PLATFORM
      </span>

      <div style={{ width: '100%', height: 1, background: 'var(--pulse-border)' }} />

      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 14,
          color: 'var(--pulse-text-primary)',
          textAlign: 'center',
          lineHeight: 1.65,
          margin: 0,
          maxWidth: 380,
        }}
      >
        PULSE monitors real-time signals across Google Trends, YouTube, and live news feeds
        from BBC, Euronews, The Guardian, NY Post, and Al Jazeera — plus social signals from
        Reddit, X, TikTok, and Instagram — to surface what matters, where it matters.
      </p>

      <ContinueButton onClick={onNext} label="INITIALIZE" />
    </div>
  </div>
)

// ─── Step 2: Select Regions ───────────────────────────────────────────────────

const StepRegions = ({ onNext, onBack, selectedRegions, setSelectedRegions }) => {
  const [query,      setQuery]      = useState('')
  const [results,    setResults]    = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const dropdownRef = useRef(null)

  useClickOutside(dropdownRef, () => setResults([]))

  const handleSearch = useCallback(async (q) => {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    setIsSearching(true)
    try {
      const res  = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${MAPBOX_TOKEN}&types=country,place&limit=5`,
      )
      const data = await res.json()
      setResults(data.features || [])
    } catch {
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const addRegion = (feature) => {
    if (selectedRegions.length >= MAX_REGIONS) return
    if (selectedRegions.some((r) => r.id === feature.id)) return
    setSelectedRegions((prev) => [
      ...prev,
      { id: feature.id, label: feature.text, placeName: feature.place_name },
    ])
    setQuery('')
    setResults([])
  }

  const removeRegion = (id) => setSelectedRegions((prev) => prev.filter((r) => r.id !== id))
  const atMax = selectedRegions.length >= MAX_REGIONS

  return (
    <div style={{ display: 'flex', minHeight: 520 }}>
      <LeftPanel
        step={2}
        onBack={onBack}
        title="SELECT YOUR REGIONS"
        body={
          <>
            Choose up to 3 geographic regions to monitor. PULSE will track signals and trends
            specific to these locations.
            <br /><br />
            We recommend starting with one region you want to understand deeply — a city,
            country, or area of interest. From there, add related regions to trace how
            information spreads and connects across locations.
            <br /><br />
            Your regions appear as active filters on the map and are automatically included in
            every AI query you run. You can update them at any time using the search bar at
            the top of the map.
          </>
        }
      />

      <div
        style={{
          flex: 1,
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {/* Search */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              border: `1px solid ${results.length > 0 ? 'var(--pulse-accent-blue)' : 'var(--pulse-border)'}`,
              background: 'var(--pulse-surface-raised)',
              padding: '10px 14px',
              transition: 'border-color 0.2s',
            }}
          >
            <Search size={14} color="var(--pulse-text-secondary)" style={{ flexShrink: 0 }} />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={atMax ? 'MAXIMUM REGIONS SELECTED' : 'Search countries or cities...'}
              disabled={atMax}
              aria-label="Search regions"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--pulse-text-primary)',
                fontFamily: "'Space Mono', monospace",
                fontSize: 12,
                flex: 1,
                opacity: atMax ? 0.5 : 1,
                cursor: atMax ? 'not-allowed' : 'text',
              }}
            />
          </div>

          <AnimatePresence>
            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 10,
                  background: 'var(--pulse-surface-raised)',
                  border: '1px solid var(--pulse-accent-blue)',
                  marginTop: 2,
                }}
              >
                {results.map((feature) => (
                  <motion.div
                    key={feature.id}
                    onClick={() => addRegion(feature)}
                    whileHover={{ background: 'var(--pulse-surface)' }}
                    transition={{ duration: 0.15 }}
                    style={{
                      padding: '10px 14px',
                      cursor: 'pointer',
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 11,
                      color: 'var(--pulse-text-primary)',
                      borderBottom: '1px solid var(--pulse-border)',
                    }}
                  >
                    {feature.place_name}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Selected tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, minHeight: 36 }}>
          <AnimatePresence>
            {selectedRegions.map((region) => (
              <motion.div
                key={region.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  border: '1px solid var(--pulse-accent-blue)',
                  color: 'var(--pulse-accent-blue)',
                  padding: '6px 10px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                {region.label}
                <button
                  onClick={() => removeRegion(region.id)}
                  aria-label={`Remove ${region.label}`}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--pulse-accent-blue)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                >
                  <X size={12} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Counter */}
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: atMax ? 'var(--pulse-warning)' : 'var(--pulse-text-dim)',
          }}
        >
          {atMax ? 'MAXIMUM REGIONS SELECTED' : `${selectedRegions.length} OF ${MAX_REGIONS} REGIONS SELECTED`}
        </span>

        <div style={{ marginTop: 'auto' }}>
          <ContinueButton onClick={onNext} disabled={selectedRegions.length === 0} />
        </div>
      </div>
    </div>
  )
}

// ─── Step 3: Select Topics ────────────────────────────────────────────────────

const StepTopics = ({ onNext, onBack, selectedTopics, setSelectedTopics }) => {
  const atMax = selectedTopics.length >= MAX_TOPICS

  const toggleTopic = (topic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics((prev) => prev.filter((t) => t !== topic))
    } else if (!atMax) {
      setSelectedTopics((prev) => [...prev, topic])
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: 520 }}>
      <LeftPanel
        step={3}
        onBack={onBack}
        title="SELECT YOUR TOPICS"
        body={
          <>
            Choose up to 5 topics to monitor across all data sources. PULSE will prioritize
            signals related to your selected topics.
            <br /><br />
            For the most powerful experience, choose topics that are related to each other.
            This lets you trace how a story or signal moves across platforms, regions, and
            sources — revealing patterns and connections that aren't obvious from a single feed.
            <br /><br />
            You can swap topics out at any time during your session using the tag strip below
            the search bar.
          </>
        }
      />

      <div
        style={{
          flex: 1,
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          overflow: 'hidden',
        }}
      >
        <div
          className="grid grid-cols-3 lg:grid-cols-4"
          style={{ gap: 8, overflowY: 'auto', flex: 1 }}
        >
          {TOPICS.map((topic) => {
            const isSelected = selectedTopics.includes(topic)
            const isDisabled = atMax && !isSelected
            return (
              <motion.button
                key={topic}
                onClick={() => toggleTopic(topic)}
                whileHover={!isDisabled ? { borderColor: 'var(--pulse-accent-blue)' } : {}}
                whileTap={!isDisabled ? { scale: 0.95 } : {}}
                transition={{ duration: 0.15 }}
                aria-pressed={isSelected}
                aria-label={`${topic} topic filter`}
                style={{
                  padding: '10px 6px',
                  background: isSelected ? 'rgba(59,130,246,0.12)' : 'var(--pulse-surface-raised)',
                  border: `1px solid ${isSelected ? 'var(--pulse-accent-blue)' : 'var(--pulse-border)'}`,
                  color: isSelected
                    ? 'var(--pulse-accent-blue)'
                    : isDisabled
                    ? 'var(--pulse-text-dim)'
                    : 'var(--pulse-text-secondary)',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 9,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.4 : 1,
                }}
              >
                {topic}
              </motion.button>
            )
          })}
        </div>

        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: atMax ? 'var(--pulse-warning)' : 'var(--pulse-text-dim)',
            flexShrink: 0,
          }}
        >
          {atMax ? 'MAXIMUM TOPICS SELECTED' : `${selectedTopics.length} TOPICS SELECTED`}
        </span>

        <ContinueButton onClick={onNext} disabled={selectedTopics.length === 0} />
      </div>
    </div>
  )
}

// ─── Step 4: Select Sources ───────────────────────────────────────────────────

const SourceToggleRow = ({ source, localSources, setLocalSources }) => {
  const Icon    = source.icon
  const enabled = localSources[source.key] ?? source.defaultOn
  return (
    <motion.div
      whileHover={{ background: 'var(--pulse-surface-raised)' }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 24px',
        borderBottom: '1px solid var(--pulse-border)',
      }}
    >
      <span
        style={{
          width: 8, height: 8, borderRadius: '50%',
          background: source.color, flexShrink: 0,
        }}
      />
      <Icon size={14} color={source.color} style={{ flexShrink: 0 }} />
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
        {source.label}
      </span>
      {source.mock && (
        <span
          aria-label="Simulated data"
          style={{
            border: '1px solid var(--pulse-text-dim)',
            color: 'var(--pulse-text-dim)',
            fontFamily: "'Space Mono', monospace",
            fontSize: 9,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '1px 4px',
            flexShrink: 0,
          }}
        >
          MOCK
        </span>
      )}
      <Switch.Root
        checked={enabled}
        onCheckedChange={({ checked }) =>
          setLocalSources((prev) => ({ ...prev, [source.key]: checked }))
        }
        size="sm"
        colorPalette="blue"
        aria-label={`Toggle ${source.label}`}
      >
        <Switch.HiddenInput />
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
      </Switch.Root>
    </motion.div>
  )
}

const SourceGroupLabel = ({ children }) => (
  <div
    style={{
      padding: '7px 24px 5px',
      borderBottom: '1px solid var(--pulse-border)',
      background: 'var(--pulse-surface)',
    }}
  >
    <span
      style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 9,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: 'var(--pulse-text-dim)',
      }}
    >
      {children}
    </span>
  </div>
)

const StepSources = ({ onNext, onBack, localSources, setLocalSources }) => (
  <div style={{ display: 'flex', minHeight: 520 }}>
    <LeftPanel
      step={4}
      onBack={onBack}
      title="SELECT YOUR SOURCES"
      body={
        <>
          PULSE pulls from two types of sources.
          <br /><br />
          <strong>News &amp; Search</strong> sources — Google Trends, YouTube, and live RSS
          feeds from BBC, Euronews, The Guardian, NY Post, and Al Jazeera — are enabled by
          default and provide real or near-real-time signal.
          <br /><br />
          <strong>Social</strong> sources — Reddit, X/Twitter, TikTok, and Instagram — are
          simulated for demonstration purposes and are off by default. Enable them to layer in
          social conversation signals alongside news coverage.
          <br /><br />
          All sources can be toggled at any time from the Data Sources panel.
        </>
      }
      note="NOTE: SOCIAL sources are simulated (MOCK) — not connected to live APIs"
    />

    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <SourceGroupLabel>NEWS &amp; SEARCH</SourceGroupLabel>
        {NEWS_SOURCES.map((source) => (
          <SourceToggleRow
            key={source.key}
            source={source}
            localSources={localSources}
            setLocalSources={setLocalSources}
          />
        ))}
        <SourceGroupLabel>SOCIAL — OFF BY DEFAULT</SourceGroupLabel>
        {SOCIAL_SOURCES.map((source) => (
          <SourceToggleRow
            key={source.key}
            source={source}
            localSources={localSources}
            setLocalSources={setLocalSources}
          />
        ))}
      </div>

      <div style={{ padding: '16px 24px', flexShrink: 0 }}>
        <ContinueButton onClick={onNext} />
      </div>
    </div>
  </div>
)

// ─── Step 5: Pulse Activated ──────────────────────────────────────────────────

const StepActivated = ({ selectedRegions, selectedTopics, onEnter }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      padding: '20px 24px 32px',
    }}
  >
    <div
      style={{
        width: '100%',
        maxWidth: 460,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 18,
      }}
    >
      <ProgressDots step={5} />

      <Activity
        size={40}
        color="var(--pulse-accent-blue)"
        className="animate-pulse"
        style={{ marginTop: 8 }}
      />

      <h2
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--pulse-accent-blue)',
          margin: 0,
          textAlign: 'center',
        }}
      >
        PULSE ACTIVATED
      </h2>

      <p
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--pulse-text-dim)',
          textAlign: 'center',
          margin: 0,
        }}
      >
        YOUR INTELLIGENCE FEED IS BEING PREPARED
      </p>

      <p
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--pulse-text-dim)',
          textAlign: 'center',
          margin: 0,
        }}
      >
        MONITORING {selectedRegions.length} REGION{selectedRegions.length !== 1 ? 'S' : ''} AND{' '}
        {selectedTopics.length} TOPIC{selectedTopics.length !== 1 ? 'S' : ''}
      </p>

      <ContinueButton onClick={onEnter} label="ENTER PULSE" />
    </div>
  </div>
)

// ─── Main Onboarding component ────────────────────────────────────────────────

const Onboarding = ({ onComplete }) => {
  const [currentStep,      setCurrentStep]      = useState(1)
  const [direction,        setDirection]        = useState(1)
  const [selectedRegions,  setSelectedRegions]  = useState([])
  const [selectedTopics,   setSelectedTopics]   = useState([])
  const [localSources,     setLocalSources]     = useState(
    Object.fromEntries(SOURCES.map((s) => [s.key, s.defaultOn])),
  )

  const setActiveTags    = useAppStore((s) => s.setActiveTags)
  const setActiveSources = useAppStore((s) => s.setActiveSources)
  const { submit }       = useAIQuery()

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const goNext = () => {
    setDirection(1)
    setCurrentStep((s) => s + 1)
  }

  const goBack = () => {
    setDirection(-1)
    setCurrentStep((s) => s - 1)
  }

  const handleEnterPulse = () => {
    // 1. Persist onboarding completion
    localStorage.setItem('pulse_onboarded', 'true')

    // 2. Build and apply Zustand tags from selections
    const tags = [
      ...selectedRegions.map((r) => ({
        id:     `onboard-region-${r.id}`,
        type:   'region',
        label:  r.label,
        color:  '#3B82F6',
        saved:  false,
        active: true,
      })),
      ...selectedTopics.map((t) => ({
        id:     `onboard-topic-${t.toLowerCase().replace(/[\s&]/g, '-')}`,
        type:   'topic',
        label:  t,
        color:  '#3B82F6',
        saved:  false,
        active: true,
      })),
    ]
    setActiveTags(tags)

    // 3. Apply source preferences
    const activeSrcs = SOURCES.filter((s) => localSources[s.key]).map((s) => s.key)
    setActiveSources(activeSrcs)

    // 4. Build query from selections
    const regionList = selectedRegions.map((r) => r.label).join(' and ')
    const topicList  = selectedTopics.join(' and ')
    const query      = `Analyze current trends and signals for ${regionList} related to ${topicList}. What patterns are emerging and where are signals strongest?`

    // 5. Brief defer so React flushes Zustand changes before submit reads them
    setTimeout(() => submit(query), 50)

    // 6. Close modal after map has time to render
    setTimeout(() => onComplete(), 800)
  }

  const isNarrowStep = currentStep === 1 || currentStep === 5

  return (
    <motion.div
      key="onboarding-overlay"
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '16px',
      }}
    >
      <div
        style={{
          background: 'var(--pulse-surface)',
          border: '1px solid var(--pulse-border)',
          width: '100%',
          maxWidth: isNarrowStep ? 540 : 900,
          maxHeight: '90vh',
          overflow: 'hidden',
          transition: 'max-width 0.3s ease',
        }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={prefersReducedMotion ? {} : slideVariants}
            initial={prefersReducedMotion ? { opacity: 0 } : 'enter'}
            animate={prefersReducedMotion ? { opacity: 1 } : 'center'}
            exit={prefersReducedMotion ? { opacity: 0 } : 'exit'}
          >
            {currentStep === 1 && <StepWelcome onNext={goNext} />}

            {currentStep === 2 && (
              <StepRegions
                onNext={goNext}
                onBack={goBack}
                selectedRegions={selectedRegions}
                setSelectedRegions={setSelectedRegions}
              />
            )}

            {currentStep === 3 && (
              <StepTopics
                onNext={goNext}
                onBack={goBack}
                selectedTopics={selectedTopics}
                setSelectedTopics={setSelectedTopics}
              />
            )}

            {currentStep === 4 && (
              <StepSources
                onNext={goNext}
                onBack={goBack}
                localSources={localSources}
                setLocalSources={setLocalSources}
              />
            )}

            {currentStep === 5 && (
              <StepActivated
                selectedRegions={selectedRegions}
                selectedTopics={selectedTopics}
                onEnter={handleEnterPulse}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default Onboarding
