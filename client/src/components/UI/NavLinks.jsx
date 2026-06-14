import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'

const NavLink = ({ href, children }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      fontFamily: "'Space Mono', monospace",
      fontSize: '11px',
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
      color: '#6B7A99',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    }}
    whileHover={{ color: '#F0F4FF' }}
    transition={{ duration: 0.2 }}
  >
    {children}
    <ExternalLink size={9} />
  </motion.a>
)

const NavLinks = () => (
  <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
    <NavLink href="/resume.pdf">RESUME</NavLink>
    <NavLink href="#">LINKEDIN</NavLink>
  </nav>
)

export default NavLinks
