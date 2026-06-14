import Logo from './Logo.jsx'
import StatusBar from './StatusBar.jsx'
import NavLinks from './NavLinks.jsx'
import BetaTag from './BetaTag.jsx'
import ProfileMenu from './ProfileMenu.jsx'

const TopBar = ({ showProfile = true }) => {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '48px',
        zIndex: 100,
        background: 'var(--pulse-surface)',
        borderBottom: '1px solid var(--pulse-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '16px',
      }}
    >
      <Logo />
      <StatusBar />
      <div style={{ flex: 1 }} />
      <NavLinks />
      <BetaTag />
      {showProfile && <ProfileMenu />}
    </header>
  )
}

export default TopBar
