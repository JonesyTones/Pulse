import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import './styles/index.css'
import './styles/fonts.css'
import './styles/theme.css'
import './styles/globals.css'
import App from './App.jsx'

const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        heading: { value: "'Space Mono', monospace" },
        body: { value: "'Inter', sans-serif" },
        mono: { value: "'Space Mono', monospace" },
      },
      colors: {
        pulseBg: { value: '#0A0C10' },
        pulseSurface: { value: '#111318' },
        pulseSurfaceRaised: { value: '#1A1F2E' },
        pulseBorder: { value: '#252B3B' },
        pulseTextPrimary: { value: '#F0F4FF' },
        pulseTextSecondary: { value: '#6B7A99' },
        pulseTextDim: { value: '#8B9AAF' },
        pulseAccentBlue: { value: '#3B82F6' },
        pulseArcRed: { value: '#EF4444' },
        pulseArcOrange: { value: '#F97316' },
        pulseArcAmber: { value: '#F59E0B' },
        pulseSuccess: { value: '#10B981' },
        pulseWarning: { value: '#FBBF24' },
      },
    },
    semanticTokens: {
      colors: {
        bg: { value: '{colors.pulseBg}' },
      },
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChakraProvider value={system}>
      <App />
    </ChakraProvider>
  </StrictMode>,
)
