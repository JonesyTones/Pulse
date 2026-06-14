import { Activity } from 'lucide-react'

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <Activity
      size={18}
      className="animate-pulse"
      style={{ color: 'var(--pulse-accent-blue)', flexShrink: 0 }}
    />
    <span
      style={{
        fontFamily: "'Space Mono', monospace",
        fontWeight: 700,
        fontSize: '16px',
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        color: 'var(--pulse-text-primary)',
        userSelect: 'none',
      }}
    >
      PULSE
    </span>
  </div>
)

export default Logo
