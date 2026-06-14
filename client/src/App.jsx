import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity } from 'lucide-react'
import { MapProvider } from './context/MapContext.jsx'
import MapContainer from './components/Map/MapContainer.jsx'
import WorldMap from './components/Map/WorldMap.jsx'
import TimelineScrubber from './components/Map/TimelineScrubber.jsx'
import TopBar from './components/UI/TopBar.jsx'
import FloatingControls from './components/Controls/FloatingControls.jsx'
import NavigationControls from './components/Controls/NavigationControls.jsx'
import SearchControl from './components/Search/SearchControl.jsx'
import QueryBar from './components/AI/QueryBar.jsx'
import AIPanel from './components/AI/AIPanel.jsx'
import CollapsedAIPanel from './components/AI/CollapsedAIPanel.jsx'
import ChatPanel from './components/AI/ChatPanel.jsx'
import Onboarding from './components/UI/Onboarding.jsx'
import Disclaimer from './components/UI/Disclaimer.jsx'
import PulseLoader from './components/UI/PulseLoader.jsx'
import useAppStore from './store/appStore.js'

const UnsupportedScreen = () => (
  <div style={{ height: '100vh', width: '100vw', background: 'var(--pulse-bg)', display: 'flex', flexDirection: 'column' }}>
    {/* TopBar — RESUME and LINKEDIN accessible, profile icon hidden */}
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 48 }}>
      <TopBar showProfile={false} />
    </div>

    {/* Message — centered in space below TopBar */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 48,
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: 24,
        textAlign: 'center',
      }}
    >
      <Activity size={32} color="var(--pulse-accent-blue)" className="animate-pulse" />

      <p style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 24,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--pulse-text-primary)',
        marginTop: 16,
        marginBottom: 0,
      }}>
        PULSE
      </p>

      <div style={{
        width: 200,
        height: 1,
        background: 'var(--pulse-border)',
        margin: '16px auto',
      }} />

      <p style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--pulse-text-secondary)',
        lineHeight: 1.8,
        margin: 0,
      }}>
        THIS EXPERIENCE IS OPTIMIZED FOR<br />
        TABLET AND LARGER DISPLAYS
      </p>

      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 13,
        color: 'var(--pulse-text-dim)',
        lineHeight: 1.6,
        marginTop: 12,
        marginBottom: 0,
      }}>
        Please open PULSE on an iPad, tablet,<br />
        or desktop for the full experience.
      </p>

      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 12,
        color: 'var(--pulse-text-dim)',
        lineHeight: 1.6,
        marginTop: 24,
        marginBottom: 0,
      }}>
        You can still access the resume and LinkedIn<br />
        links in the menu above.
      </p>
    </motion.div>
  </div>
)

const App = () => {
  const isAIPanelOpen      = useAppStore((s) => s.isAIPanelOpen)
  const setIsChatPanelOpen = useAppStore((s) => s.setIsChatPanelOpen)
  const setIsAppLoading    = useAppStore((s) => s.setIsAppLoading)
  const setLoadingMessage  = useAppStore((s) => s.setLoadingMessage)

  // Viewport detection — switches between mobile message and full app
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Read localStorage once at mount to derive initial modal states
  const hasSeenPreDisclaimer = localStorage.getItem('pulse_disclaimer_pre') === 'true'
  const hasOnboarded         = localStorage.getItem('pulse_onboarded') === 'true'
  const mapDisclaimerNeeded  =
    localStorage.getItem('pulse_disclaimer_map_date') !== new Date().toDateString()

  const [showPreDisclaimer, setShowPreDisclaimer] = useState(!hasSeenPreDisclaimer)
  const [showOnboarding,    setShowOnboarding]    = useState(hasSeenPreDisclaimer && !hasOnboarded)
  const [showMapDisclaimer, setShowMapDisclaimer] = useState(
    hasSeenPreDisclaimer && hasOnboarded && mapDisclaimerNeeded,
  )

  // Close ChatPanel when AIPanel closes
  useEffect(() => {
    if (!isAIPanelOpen) setIsChatPanelOpen(false)
  }, [isAIPanelOpen, setIsChatPanelOpen])

  const handlePreDisclaimerDismiss = () => {
    setShowPreDisclaimer(false)
    if (!hasOnboarded) {
      setShowOnboarding(true)
    } else if (mapDisclaimerNeeded) {
      setShowMapDisclaimer(true)
    }
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    setLoadingMessage('INITIALIZING PULSE...')
    setIsAppLoading(true)
    setTimeout(() => {
      setIsAppLoading(false)
      if (mapDisclaimerNeeded) setShowMapDisclaimer(true)
    }, 1500)
  }

  if (isMobile) {
    return <UnsupportedScreen />
  }

  return (
    <>
      {/* Main app — tablet and above */}
      <MapProvider>
      <div className="relative w-screen h-screen overflow-hidden">

        {/* z-0: map canvas + pins + arcs + terrain */}
        <MapContainer />

        {/* z-1: visual overlays — scanline, ambient glows, dot-grid */}
        <WorldMap />

        {/* z-100: top bar — always on top */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
          <TopBar />
        </div>

        {/* z-60: search control + topic tags — top center */}
        <div
          style={{
            position: 'fixed',
            top: 64,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 60,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <SearchControl />
        </div>

        {/* z-50: left-side floating controls + navigation controls */}
        <FloatingControls />
        <NavigationControls />

        {/* z-65: timeline scrubber — above query bar */}
        <TimelineScrubber />

        {/* z-50: query bar — bottom center */}
        <QueryBar />

        {/* z-50: collapsed AI tab — right edge (hidden when panel is open) */}
        <AnimatePresence>
          {!isAIPanelOpen && <CollapsedAIPanel key="collapsed-ai" />}
        </AnimatePresence>

        {/* z-70: AI panel — right side */}
        <AnimatePresence>
          {isAIPanelOpen && <AIPanel key="ai-panel" />}
        </AnimatePresence>

        {/* chat tab + panel — permanent fixture, always rendered */}
        <ChatPanel />

        {/* z-150: map disclaimer — bottom-center, once per day */}
        <AnimatePresence>
          {showMapDisclaimer && (
            <Disclaimer
              key="map-disclaimer"
              variant="map"
              onDismiss={() => setShowMapDisclaimer(false)}
            />
          )}
        </AnimatePresence>

        {/* z-200: onboarding modal — shown on first visit only */}
        <AnimatePresence>
          {showOnboarding && (
            <Onboarding key="onboarding" onComplete={handleOnboardingComplete} />
          )}
        </AnimatePresence>

        {/* z-300: pre-disclaimer — shown before onboarding, first visit only */}
        <AnimatePresence>
          {showPreDisclaimer && (
            <Disclaimer
              key="pre-disclaimer"
              variant="pre"
              onDismiss={handlePreDisclaimerDismiss}
            />
          )}
        </AnimatePresence>
      </div>
      </MapProvider>

      {/* z-400: full-screen loader — initial map load, onboarding transition, scrubber seek */}
      <PulseLoader />
    </>
  )
}

export default App
