import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Checkbox } from '@chakra-ui/react'

// ── Shared ────────────────────────────────────────────────────────────────────

const SectionLabel = ({ children }) => (
  <span
    style={{
      display: 'block',
      fontFamily: "'Space Mono', monospace",
      fontSize: 10,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--pulse-text-dim)',
      marginTop: 20,
      marginBottom: 8,
    }}
  >
    {children}
  </span>
)

const BodyText = ({ children }) => (
  <p
    style={{
      fontFamily: "'Inter', sans-serif",
      fontSize: 13,
      color: 'var(--pulse-text-secondary)',
      lineHeight: 1.65,
      margin: 0,
    }}
  >
    {children}
  </p>
)

// ── Variant: pre-onboarding ───────────────────────────────────────────────────

const PreDisclaimer = ({ onDismiss }) => {
  const [checked, setChecked] = useState(false)
  const prefersReducedMotion  = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const handleContinue = () => {
    if (!checked) return
    localStorage.setItem('pulse_disclaimer_pre', 'true')
    onDismiss()
  }

  return (
    <motion.div
      key="pre-disclaimer-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3 } }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '16px',
      }}
    >
      <motion.div
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 12 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          transition: { type: 'spring', damping: 30, stiffness: 300, delay: 0.1 },
        }}
        exit={{
          opacity: 0,
          scale: 0.97,
          y: 12,
          transition: { duration: 0.2 },
        }}
        style={{
          background: 'var(--pulse-surface)',
          border: '1px solid var(--pulse-border)',
          width: '100%',
          maxWidth: 520,
          padding: 32,
        }}
      >
        {/* Header */}
        <h2
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--pulse-accent-blue)',
            margin: '0 0 16px',
          }}
        >
          BEFORE YOU BEGIN
        </h2>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--pulse-border)', marginBottom: 16 }} />

        {/* Intro */}
        <BodyText>
          PULSE is a portfolio project and work in progress. Some features may be incomplete or
          subject to change.
        </BodyText>

        {/* Data Notice */}
        <SectionLabel>DATA NOTICE</SectionLabel>
        <BodyText>
          Several data sources in PULSE — Reddit, X/Twitter, TikTok, Instagram, and GDELT —
          display simulated data. Access to real-time APIs for these platforms is heavily
          restricted or cost-prohibitive. Google Trends and YouTube display live data.
        </BodyText>

        {/* Intellectual Property */}
        <SectionLabel>INTELLECTUAL PROPERTY</SectionLabel>
        <BodyText>
          All concepts, designs, and intellectual property within PULSE are the original work of
          Anthony T Jones. Unauthorized reproduction or use is prohibited.
        </BodyText>

        {/* Checkbox */}
        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center' }}>
          <Checkbox.Root
            checked={checked}
            onCheckedChange={({ checked: val }) => setChecked(val)}
            colorPalette="blue"
            aria-label="I understand and agree to these terms"
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Label
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.08em',
                color: 'var(--pulse-text-primary)',
                cursor: 'pointer',
              }}
            >
              I understand and agree to these terms
            </Checkbox.Label>
          </Checkbox.Root>
        </div>

        {/* Continue button */}
        <motion.button
          onClick={handleContinue}
          disabled={!checked}
          whileHover={checked ? { background: 'var(--pulse-accent-blue)', color: '#fff' } : {}}
          whileTap={checked ? { scale: 0.97 } : {}}
          transition={{ duration: 0.2 }}
          aria-label="Continue"
          style={{
            width: '100%',
            padding: '14px 0',
            marginTop: 16,
            background: 'transparent',
            border: `1px solid ${checked ? 'var(--pulse-accent-blue)' : 'var(--pulse-border)'}`,
            color: checked ? 'var(--pulse-accent-blue)' : 'var(--pulse-text-dim)',
            fontFamily: "'Space Mono', monospace",
            fontSize: 13,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: checked ? 'pointer' : 'not-allowed',
            boxShadow: checked ? '0 0 20px rgba(59,130,246,0.3)' : 'none',
          }}
        >
          CONTINUE
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// ── Variant: map session reminder ─────────────────────────────────────────────

const MapDisclaimer = ({ onDismiss }) => {
  const [checked, setChecked] = useState(false)

  const handleDismiss = () => {
    if (!checked) return
    localStorage.setItem('pulse_disclaimer_map_date', new Date().toDateString())
    onDismiss()
  }

  return (
    // Outer div holds position; inner motion.div owns the y/opacity animation
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(560px, calc(100vw - 32px))',
        zIndex: 150,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.4, delay: 1.5 } }}
        exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
        style={{
          background: 'var(--pulse-surface)',
          border: '1px solid var(--pulse-border)',
          boxShadow: '0 0 20px rgba(0,0,0,0.6)',
          padding: '20px 24px',
        }}
      >
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--pulse-accent-blue)',
            }}
          >
            PULSE BETA
          </span>
          <motion.button
            onClick={onDismiss}
            whileHover={{ color: 'var(--pulse-text-primary)' }}
            transition={{ duration: 0.2 }}
            aria-label="Close disclaimer"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--pulse-text-dim)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 0,
            }}
          >
            <X size={14} />
          </motion.button>
        </div>

        {/* Body */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            color: 'var(--pulse-text-secondary)',
            lineHeight: 1.6,
            margin: '8px 0 0',
          }}
        >
          PULSE is a work in progress. Several data sources display simulated data for
          demonstration purposes. All rights to the PULSE concept, design, and intellectual
          property are reserved by Anthony T Jones.
        </p>

        {/* Checkbox */}
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center' }}>
          <Checkbox.Root
            checked={checked}
            onCheckedChange={({ checked: val }) => setChecked(val)}
            colorPalette="blue"
            size="sm"
            aria-label="I acknowledge"
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Label
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.08em',
                color: 'var(--pulse-text-primary)',
                cursor: 'pointer',
              }}
            >
              I acknowledge
            </Checkbox.Label>
          </Checkbox.Root>
        </div>

        {/* Dismiss button */}
        <motion.button
          onClick={handleDismiss}
          disabled={!checked}
          whileHover={checked ? { background: 'var(--pulse-accent-blue)', color: '#fff' } : {}}
          whileTap={checked ? { scale: 0.97 } : {}}
          transition={{ duration: 0.2 }}
          aria-label="Dismiss disclaimer"
          style={{
            marginTop: 12,
            padding: '8px 16px',
            background: 'transparent',
            border: `1px solid ${checked ? 'var(--pulse-accent-blue)' : 'var(--pulse-border)'}`,
            color: checked ? 'var(--pulse-accent-blue)' : 'var(--pulse-text-dim)',
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            cursor: checked ? 'pointer' : 'not-allowed',
          }}
        >
          DISMISS
        </motion.button>
      </motion.div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

const Disclaimer = ({ variant, onDismiss }) => {
  if (variant === 'pre') return <PreDisclaimer onDismiss={onDismiss} />
  if (variant === 'map') return <MapDisclaimer onDismiss={onDismiss} />
  return null
}

export default Disclaimer
