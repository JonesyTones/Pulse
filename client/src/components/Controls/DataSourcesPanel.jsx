import { motion } from 'framer-motion'
import { Switch, Slider } from '@chakra-ui/react'
import { X } from 'lucide-react'
import {
  FaGoogle, FaYoutube, FaReddit, FaNewspaper, FaInstagram,
} from 'react-icons/fa'
import { FaXTwitter, FaTiktok } from 'react-icons/fa6'
import useAppStore from '../../store/appStore.js'

const SOURCES = [
  { key: 'google',    label: 'GOOGLE TRENDS', color: '#3B82F6', icon: FaGoogle,    mock: false },
  { key: 'youtube',   label: 'YOUTUBE',        color: '#EF4444', icon: FaYoutube,   mock: false },
  { key: 'reddit',    label: 'REDDIT',         color: '#F97316', icon: FaReddit,    mock: true  },
  { key: 'gdelt',     label: 'GDELT',          color: '#F59E0B', icon: FaNewspaper, mock: true  },
  { key: 'twitter',   label: 'X / TWITTER',   color: '#06B6D4', icon: FaXTwitter,  mock: true  },
  { key: 'tiktok',    label: 'TIKTOK',         color: '#EC4899', icon: FaTiktok,    mock: true  },
  { key: 'instagram', label: 'INSTAGRAM',      color: '#A855F7', icon: FaInstagram, mock: true  },
]

const SourceRow = ({ source }) => {
  const activeSources   = useAppStore((s) => s.activeSources)
  const dataSourceArcs  = useAppStore((s) => s.dataSourceArcs)
  const setActiveSources = useAppStore((s) => s.setActiveSources)
  const setDataSourceArcs = useAppStore((s) => s.setDataSourceArcs)

  const isOn     = activeSources.includes(source.key)
  const arcsOn   = dataSourceArcs[source.key] ?? false
  const Icon     = source.icon

  const toggleSource = () => {
    setActiveSources(
      isOn
        ? activeSources.filter((s) => s !== source.key)
        : [...activeSources, source.key],
    )
  }

  const toggleArcs = () => {
    setDataSourceArcs({ ...dataSourceArcs, [source.key]: !arcsOn })
  }

  return (
    <motion.div
      whileHover={{ background: 'var(--pulse-surface-raised)' }}
      transition={{ duration: 0.2 }}
      style={{
        borderBottom: '1px solid var(--pulse-border)',
        padding: '10px 16px',
      }}
    >
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Color dot */}
        <span
          style={{
            width: 8, height: 8, borderRadius: '50%',
            background: source.color, flexShrink: 0,
          }}
        />

        {/* Brand icon */}
        <Icon size={14} color={source.color} style={{ flexShrink: 0 }} />

        {/* Source name */}
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

        {/* MOCK badge */}
        {source.mock && (
          <span
            aria-label="Simulated data"
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--pulse-text-dim)',
              border: '1px solid var(--pulse-text-dim)',
              padding: '1px 4px',
              borderRadius: 2,
              flexShrink: 0,
            }}
          >
            MOCK
          </span>
        )}

        {/* Main toggle */}
        <Switch.Root
          checked={isOn}
          onCheckedChange={toggleSource}
          size="sm"
          aria-label={`Toggle ${source.label} data`}
          colorPalette="blue"
        >
          <Switch.HiddenInput />
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch.Root>
      </div>

      {/* Arcs sub-row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, paddingLeft: 24 }}>
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 9,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--pulse-text-dim)',
            flex: 1,
          }}
        >
          — ARCS
        </span>
        <Switch.Root
          checked={arcsOn}
          onCheckedChange={toggleArcs}
          size="sm"
          aria-label={`Toggle ${source.label} arc lines`}
          colorPalette="blue"
          disabled={!isOn}
        >
          <Switch.HiddenInput />
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch.Root>
      </div>
    </motion.div>
  )
}

const DataSourcesPanel = ({ onClose }) => {
  const dataDensity    = useAppStore((s) => s.dataDensity)
  const setDataDensity = useAppStore((s) => s.setDataDensity)

  return (
    // FloatingControls wrapper handles positioning and slide animation
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        width: 320,
        background: 'var(--pulse-surface)',
        border: '1px solid var(--pulse-border)',
        borderRadius: 4,
        overflow: 'hidden',
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid var(--pulse-border)',
        }}
      >
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--pulse-text-primary)',
          }}
        >
          DATA SOURCES
        </span>
        <button
          onClick={onClose}
          aria-label="Close data sources panel"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--pulse-text-dim)', padding: 0, display: 'flex',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.7)}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
        >
          <X size={14} />
        </button>
      </div>

      {/* Source rows */}
      {SOURCES.map((src) => <SourceRow key={src.key} source={src} />)}

      {/* Data Density */}
      <div style={{ padding: '16px' }}>
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--pulse-text-secondary)',
            marginBottom: 10,
          }}
        >
          DATA DENSITY
        </div>
        <Slider.Root
          value={[dataDensity]}
          onValueChange={({ value }) => setDataDensity(value[0])}
          min={0}
          max={100}
          step={1}
          aria-label="Data density"
          colorPalette="blue"
        >
          <Slider.Control>
            <Slider.Track>
              <Slider.Range />
            </Slider.Track>
            <Slider.Thumb index={0}>
              <Slider.HiddenInput />
            </Slider.Thumb>
          </Slider.Control>
        </Slider.Root>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 6,
          }}
        >
          {['SPARSE', 'DENSE'].map((label) => (
            <span
              key={label}
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--pulse-text-dim)',
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DataSourcesPanel
