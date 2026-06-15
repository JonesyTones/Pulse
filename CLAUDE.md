# PULSE — Global Intelligence Visualization Platform
# CLAUDE.md — Project Memory & Coding Standards
# Version 1.5 — May 2026

---

## What is PULSE?

PULSE is a real-time global intelligence visualization platform. It displays an interactive
world map populated with live data flag pins and animated arc lines showing how information
spreads between geographic regions.

Data sources: Google Trends, YouTube, Reddit, GDELT, X (Twitter), TikTok, and Instagram.
Google Trends and YouTube use real APIs. Reddit, GDELT, X, TikTok, and Instagram use
permanent mock data — real API access is not available for these sources.
An AI assistant (Claude API) answers natural-language questions grounded in the live map data.

This is a portfolio project. Code must be clean, modular, and impressive to a technical reviewer.
No user authentication. No database. All state is in-session only.

---

## Aesthetic Direction

**DOD / Mission Ops Center** — think Palantir, NORAD, a live intelligence dashboard.
- Dark backgrounds only. Default map tile: CARTO dark.
- Primary font: Space Mono (monospace) — all UI chrome, labels, data readouts, headers
- Secondary font: Inter — body text, AI responses, readable prose content
- All labels and headers: uppercase, wide letter-spacing
- Glowing data indicators. Subtle dot-grid overlay on the map. Scanline/CRT texture overlay.
- No rounded cards, no drop shadows, no gradients except arc glow effects.

### Color Palette (CSS Custom Properties)
```css
--pulse-bg:              #0A0C10
--pulse-surface:         #111318
--pulse-surface-raised:  #1A1F2E
--pulse-border:          #252B3B
--pulse-text-primary:    #F0F4FF
--pulse-text-secondary:  #6B7A99
--pulse-text-dim:        #8B9AAF
--pulse-accent-blue:     #3B82F6
--pulse-arc-red:         #EF4444
--pulse-arc-orange:      #F97316
--pulse-arc-amber:       #F59E0B
--pulse-arc-cyan:        #06B6D4
--pulse-arc-pink:        #EC4899
--pulse-arc-purple:      #A855F7
--pulse-success:         #10B981
--pulse-warning:         #FBBF24
```

### Data Source Color + Icon Map
```
Google Trends  Blue    #3B82F6  FaGoogle    (react-icons/fa)   Real API
YouTube        Red     #EF4444  FaYoutube   (react-icons/fa)   Real API
Reddit         Orange  #F97316  FaReddit    (react-icons/fa)   Permanent mock
GDELT          Amber   #F59E0B  FaNewspaper (react-icons/fa)   Permanent mock
X / Twitter    Cyan    #06B6D4  FaXTwitter  (react-icons/fa6)  Permanent mock
TikTok         Pink    #EC4899  FaTiktok    (react-icons/fa6)  Permanent mock
Instagram      Purple  #A855F7  FaInstagram (react-icons/fa)   Permanent mock
```

Color alone never conveys source identity — always pair with icon and label.

---

## Tech Stack

### Frontend
- **React 19** with **Vite** (not Create React App)
- **Chakra UI v3** — primary component library for all interactive UI elements.
  Use Chakra's accessible primitives; override visual styles with Tailwind.
  Do NOT use MUI, Ant Design, Radix UI, or any other component library.
- **Framer Motion** — ALL animations and transitions without exception. Do not use raw CSS
  transitions for interactive elements. Use CSS only for continuous/infinite animations
  (pulse glow, scanline texture, live dot) via Tailwind's animate-pulse class.
- **Mapbox GL JS** — map rendering, perspective tilt, 3D terrain, building extrusions.
  Do NOT use Leaflet or Google Maps.
- **D3.js** — arc/flow line rendering via Mapbox's CustomLayerInterface (WebGL canvas).
  Do NOT use SVG overlays for arcs — D3 must respect camera pitch in 3D mode.
- **Tailwind CSS v4** — layout and custom styling alongside Chakra.
  No tailwind.config.js — use @import "tailwindcss" in index.css.
- **Zustand** — global state management. All state is in-session only (no persistence).
- **DOMPurify** — frontend input sanitization before any data leaves the browser.
- **react-icons** — brand SVG icons for all source references throughout the UI.
- Language: **JavaScript + JSX**. No TypeScript.

### Backend
- **Node.js + Express** — REST API server
- **Axios** — all external HTTP calls
- **node-cron** — scheduled data polling every 60 seconds
- **helmet** — secure HTTP headers
- **express-rate-limit** — rate limiting
- **express-validator** — backend input sanitization
- No database. No authentication. Data is live/in-memory only.

### AI
- **Groq API** (model: llama-3.3-70b-versatile)
- Called from the backend only — API key never exposed to frontend
- Context injected per query: active region, top trends, source breakdown,
  active tags, timestamp
- Response shape: `{ answer, confidence (0-100), citations: [{title, url, source}], followUps: [string x3] }`

### Hosting
- Frontend → Vercel | Backend → Railway
- All secrets in environment variables, never hardcoded

---

## Supported Devices & Breakpoints

PULSE targets tablet through ultrawide displays. Phones are explicitly out of scope.

| Breakpoint | Min Width | Device           | Layout Behavior                                                        |
|------------|-----------|------------------|------------------------------------------------------------------------|
| sm         | 768px     | iPad portrait    | Single panel mode — controls icon-only, AI panel full overlay          |
| md         | 1024px    | iPad landscape   | Full layout, panels narrower                                           |
| lg         | 1280px    | Laptop           | Full layout, standard panel widths                                     |
| xl         | 1440px    | Desktop          | Optimal — primary design target                                        |
| 2xl        | 1920px+   | Wide/ultrawide   | Map expands, panels stay fixed width                                   |

**Below 768px:** Render full-screen unsupported message only:
  "PULSE REQUIRES A TABLET OR LARGER DISPLAY"

### Panel Widths by Breakpoint
- AI Panel: 440px on lg+, full-screen overlay on sm/md
- Chat Panel: 520px on lg+, full-width on sm/md
- Floating Controls: always left-anchored, icon-only below md
- Search Control: 600px on lg+, full-width minus 32px on sm/md
- Timeline Scrubber: 600px on lg+, full-width minus 32px on sm/md
- Data Sources Panel: 320px fixed
- Map Style Panel: 280px fixed
- Compass Panel: 200px fixed

---

## Folder Structure

Follow this structure exactly. Do not deviate.

```
pulse/
├── client/
│   ├── public/
│   │   └── resume.pdf
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map/
│   │   │   │   ├── MapContainer.jsx        # Mapbox GL JS wrapper, data wiring
│   │   │   │   ├── WorldMap.jsx            # Scanline, grid, ambient glows
│   │   │   │   ├── DataPin.jsx             # Flag pin — brand icon + topic text
│   │   │   │   ├── ArcLayer.jsx            # D3 arcs via CustomLayerInterface
│   │   │   │   ├── TerrainLayer.jsx        # 3D terrain
│   │   │   │   └── TimelineScrubber.jsx    # Horizontal scrubber above QueryBar
│   │   │   │
│   │   │   ├── Controls/
│   │   │   │   ├── FloatingControls.jsx    # Left side vertical icon menu wrapper
│   │   │   │   ├── DataSourcesPanel.jsx    # 7 sources, toggles, MOCK badges, density
│   │   │   │   ├── MapStylePanel.jsx       # DARK / SATELLITE / TERRAIN / NATURAL / STREET
│   │   │   │   ├── NavigationControls.jsx  # Zoom, 3D, location, compass
│   │   │   │   └── CompassPanel.jsx        # Heading + tilt sliders
│   │   │   │
│   │   │   ├── Search/
│   │   │   │   ├── SearchControl.jsx       # Region + topic input, creates tags
│   │   │   │   ├── SearchHistory.jsx       # In-session history dropdown
│   │   │   │   └── TopicTags.jsx           # Tag strip below search bar
│   │   │   │
│   │   │   ├── AI/
│   │   │   │   ├── AIPanel.jsx             # Expanded right panel (440px)
│   │   │   │   ├── CollapsedAIPanel.jsx    # Vertical tab on right edge
│   │   │   │   ├── CollapsibleSection.jsx  # Reusable expand/collapse wrapper
│   │   │   │   ├── QueryBar.jsx            # Bottom center, always visible
│   │   │   │   ├── ChatPanel.jsx           # 520x320, bottom-right
│   │   │   │   ├── ChatHistory.jsx         # Slides over chat panel
│   │   │   │   ├── PinDetailView.jsx       # Slides over AIPanel on pin click
│   │   │   │   └── SavedArticles.jsx       # Collapsible section inside AIPanel
│   │   │   │
│   │   │   └── UI/
│   │   │       ├── TopBar.jsx
│   │   │       ├── Logo.jsx
│   │   │       ├── BetaTag.jsx
│   │   │       ├── ProfileMenu.jsx
│   │   │       ├── NavLinks.jsx
│   │   │       ├── StatusBar.jsx
│   │   │       └── ImageWithFallback.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useLiveData.js
│   │   │   ├── useAIQuery.js
│   │   │   └── useClickOutside.js
│   │   │
│   │   ├── store/
│   │   │   └── appStore.js
│   │   │
│   │   ├── utils/
│   │   │   ├── geoHelpers.js
│   │   │   └── logger.js
│   │   │
│   │   ├── styles/
│   │   │   ├── index.css
│   │   │   ├── fonts.css
│   │   │   ├── theme.css
│   │   │   └── globals.css
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   ├── .env
│   └── vite.config.js
│
├── server/
│   ├── routes/
│   │   ├── trends.js
│   │   ├── youtube.js
│   │   ├── reddit.js
│   │   ├── gdelt.js
│   │   ├── twitter.js
│   │   ├── tiktok.js
│   │   ├── instagram.js
│   │   └── ai.js
│   ├── services/
│   │   ├── googleTrends.js
│   │   ├── youtubeService.js
│   │   ├── redditService.js
│   │   ├── gdeltService.js
│   │   ├── twitterService.js
│   │   ├── tiktokService.js
│   │   └── instagramService.js
│   ├── middleware/
│   │   ├── cors.js
│   │   ├── rateLimiter.js
│   │   ├── sanitize.js
│   │   └── secureHeaders.js
│   ├── cache.js
│   ├── poller.js
│   └── index.js
│
├── .env.example
├── .gitignore
├── CLAUDE.md
└── README.md
```

---

## Flag Pin Design Spec (DataPin.jsx)

Pins are **map flags** — speech bubble with bottom-left arrow pointer staked into the map.
NOT dots. NOT circles. NOT standard Mapbox markers.

### Default State
```
┌─────────────────────┐
│ [icon]  topic text  │
└──▼──────────────────┘
   ↑ arrow bottom-left, acts as the stake point
```
- Width: 120px, height: 36px
- Shape: rounded rectangle (border-radius 6px) + bottom-left CSS arrow (::after pseudo-element)
- Background: source color at 90% opacity
- Left strip: 28px wide, slightly darker source color, brand icon (white, 14px)
- Right area: topic text, Space Mono, white, 10px, truncated 1 line, padding 0 8px
- Glow: filter drop-shadow in source color
- Arrow: CSS ::after, bottom-left corner, pointing downward, matches background color
- aria-label: "[Source]: [topic] — [region], volume [n]/100"

### Hover State (Framer Motion spring expand)
- Height → 80px, spring { damping: 25, stiffness: 300 }
- Reveals below topic text:
  Region (Space Mono, 9px, rgba(255,255,255,0.7))
  Relative timestamp e.g. "2m ago" (same style)
  Volume bar: full width, 3px, white at volume% opacity
  MOCK badge if applicable (dim outlined, 9px)
- Cursor: pointer

### Click Action
- Set activePinDetail to pin's data object in Zustand
- Set isPinDetailOpen: true in Zustand

### Query Focus
- Related pins: opacity 1.0, scale 1.05
- Unrelated pins: opacity 0.2
- Framer Motion animate, 0.3s transition

### Load Animation
- { opacity: 0, scale: 0, y: 10 } → { opacity: 1, scale: 1, y: 0 }
- Duration: 0.4s, easing: easeOut
- Stagger: index * 0.1s

---

## TimelineScrubber Spec (TimelineScrubber.jsx)

### Position & Layout
- Fixed, bottom center, above QueryBar (bottom: 80px from viewport bottom)
- Width: 600px on lg+, full-width minus 32px on sm/md
- Height: auto (collapses/expands with top row)
- Z-index: 65
- Background: var(--pulse-surface)
- Border: 1px solid var(--pulse-border)
- Box-shadow: 0 0 20px rgba(59,130,246,0.15) — matches QueryBar glow

### Top Row — Time Range Selector (Collapsible)
- Four pill buttons: "1H" / "6H" / "12H" / "24H"
- Active pill: var(--pulse-accent-blue) filled, white text
- Inactive: transparent bg, dim border, secondary text
- Collapse/expand with AnimatePresence (accordion variant)
- Clicking the time label in bottom row toggles this open/closed
- Updates scrubberRange in Zustand on pill click

### Bottom Row — Scrubber Track (Always Visible)
Left to right:

1. **Play/Pause button**
   - Lucide Play/Pause icon, 14px, accent blue
   - Toggles isPlaying (local state)

2. **Time label + collapse toggle**
   - Displays e.g. "24H AGO", "6H AGO", "LIVE"
   - Space Mono, 9px, dim, uppercase
   - Clickable — ChevronDown rotates 180° when top row expanded
   - Calculated from scrubberRange and scrubberProgress:
     `(1 - progress/100) * rangeHours`
     e.g. progress 75, range 24h → "6H AGO"
     e.g. progress 100 → "LIVE"
     Format: "XH YM AGO" or "XM AGO" or "LIVE"

3. **Track**
   - Height: 4px (h-1), rounded-full
   - Background: var(--pulse-surface-raised)
   - Filled portion: var(--pulse-accent-blue) from left to handle position
   - Blue glow on filled: box-shadow 0 0 6px var(--pulse-accent-blue)
   - Clickable anywhere to jump handle to that position

4. **Draggable handle**
   - 12px circle (w-3 h-3)
   - Background: var(--pulse-accent-blue), border: 2px solid white
   - Position: left: ${progress}% with transform to center
   - Scale: 1.2x while dragging (Framer Motion)
   - Cursor: grab → grabbing
   - Drag: native mouse events (mousedown, mousemove, mouseup)
   - Global listeners handle dragging beyond track bounds
   - Snaps to nearest 5-minute interval on release

5. **Tooltip** (while isDragging only)
   - Floats above handle (-top-8)
   - Shows time label e.g. "5H AGO" or "LIVE"
   - AnimatePresence fade in/out
   - Background: var(--pulse-surface-raised)
   - Border: 1px solid var(--pulse-accent-blue), blue glow

6. **LIVE indicator** (far right)
   - Pulsing green dot (w-1.5 h-1.5) with green glow — animate-pulse
   - "LIVE" text, Space Mono, 9px, uppercase, success green
   - Dot ONLY pulses when scrubberProgress === 100

### State Management
**In Zustand (shared — MapContainer reacts to these):**
```javascript
scrubberProgress: 100         // 0–100, 100 = LIVE
scrubberRange: '24h'          // '1h' | '6h' | '12h' | '24h'
```

**Local to TimelineScrubber only:**
```javascript
isPlaying: false              // play/pause state
isDragging: false             // active drag tracking
isExpanded: false             // time range pills visible
```

### Historical Mock Data
Pre-generate on app load:
- 288 snapshots — one per 5 minutes covering 24 hours
- Each snapshot: `{ timestamp: ISO8601, data: [...normalized data objects] }`
- Stored in trendSnapshots Zustand array
- Vary volumes slightly per snapshot (Math.random() ± 20%)
- Same topics/regions, different volumes/timestamps
- When scrubberProgress < 100: MapContainer shows matching snapshot
- When scrubberProgress === 100: MapContainer shows live trendData

### Load Animation
- { opacity: 0, y: 20 } → { opacity: 1, y: 0 }, delay 0.35s

---

## DataSourcesPanel Spec (DataSourcesPanel.jsx)

### Layout
- Width: 320px, slideFromLeft Framer Motion variant
- Background: var(--pulse-surface)
- Header: "DATA SOURCES" Space Mono uppercase + close X button

### 7 Source Rows (in exact order)
1. GOOGLE TRENDS — blue #3B82F6 — no MOCK badge
2. YOUTUBE — red #EF4444 — no MOCK badge
3. REDDIT — orange #F97316 — MOCK badge
4. GDELT — amber #F59E0B — MOCK badge
5. X / TWITTER — cyan #06B6D4 — MOCK badge
6. TIKTOK — pink #EC4899 — MOCK badge
7. INSTAGRAM — purple #A855F7 — MOCK badge

### Each Row Contains (left to right)
- Source color dot (8px circle, source color)
- Brand icon (react-icons, source color, 14px)
- Source name (Space Mono, 11px, uppercase, primary text)
- MOCK badge (if applicable):
  Outlined pill, 1px solid var(--pulse-text-dim), color: var(--pulse-text-dim)
  Space Mono, 9px, uppercase, padding 1px 4px
  Subtle — should not dominate the row
  aria-label="Simulated data"
- Main Chakra Switch (far right):
  Toggles source in/out of activeSources Zustand
  Active: accent blue | Inactive: gray border
- "ARCS" sub-toggle (smaller Chakra Switch, below main):
  Toggles dataSourceArcs for this source
  Label: "ARCS" Space Mono, 9px, dim text

Row divider: 1px var(--pulse-border) between rows
Row hover: background → var(--pulse-surface-raised), 200ms Framer Motion

### Bottom Section
- Label: "DATA DENSITY" Space Mono, 10px, uppercase, secondary
- Chakra Slider: 0–100, default 50, accent blue track
- Left label: "SPARSE" | Right label: "DENSE" (Space Mono, 9px, dim)
- Updates dataDensity in Zustand on change

---

## PinDetailView Spec (PinDetailView.jsx)

Slides over AIPanel as absolute top layer. AIPanel container must be position: relative.

### Layout
- Absolute, top 0, left 0, full width + height of AIPanel container
- Background: var(--pulse-surface)
- Slide in: slideFromRight variant on mount
- Slide out: { x: '100%' } on back button click

### Contents (top to bottom)
1. **Header bar**
   - Back arrow (Lucide ArrowLeft) → isPinDetailOpen: false, activePinDetail: null
   - Brand icon (react-icons, source color, 16px)
   - Source name (Space Mono, uppercase, 11px)
   - MOCK badge if applicable (aria-label="Simulated data")
   - Close X button (opacity 0.5 → 1 on hover)

2. **Hero section**
   - Left border: 4px solid source color
   - Topic/title (Inter, 16px, primary, max 3 lines)
   - Region + timestamp (Space Mono, 11px, secondary)
   - Volume bar (full width, 4px height, source color)

3. **Metadata section**
   - Key-value pairs from data.metadata object
   - Space Mono, 10px — secondary keys / primary values
   - Render all metadata fields present in the data object

4. **Action bar (two buttons)**
   "SAVE ARTICLE":
     Border + text: source color | Space Mono uppercase 11px
     On click: add to savedArticles in Zustand with savedAt timestamp
     If already saved: "SAVED ✓" disabled state
   "OPEN SOURCE":
     Border: var(--pulse-border) | Text: secondary
     Opens data.url in new tab (rel="noopener noreferrer")

5. **Related trends** (CollapsibleSection)
   - Header: "RELATED TRENDS"
   - Other items from same source in trendData
   - Smaller flag-style rows: brand icon + topic truncated

---

## SavedArticles Spec (SavedArticles.jsx)

Collapsible section inside AIPanel. In-session only — resets on page refresh.

- Uses CollapsibleSection.jsx wrapper
- Header: "SAVED ARTICLES" + count badge + chevron
- Collapsed by default
- Reads savedArticles from Zustand

Each saved item:
- Left border: 3px solid source color
- Brand icon (react-icons, source color, 12px)
- Topic truncated 1 line (Inter, 12px, primary)
- Region + relative timestamp (Space Mono, 10px, dim)
- X remove button (opacity 0.5 → 1 on hover)
- Row hover: surface-raised bg, 200ms
- On row click: set activePinDetail + isPinDetailOpen: true

Empty state: "NO SAVED ARTICLES" (Space Mono, dim, centered, 11px)

---

## TopicTags Spec (TopicTags.jsx)

Tag strip below SearchControl. Only visible when activeTags.length > 0.

### Layout
- Same width as SearchControl
- Framer Motion: height 0→auto when first tag added (AnimatePresence)
- Horizontal scrollable row, overflow-x: auto, scrollbar hidden

### Tag States
- **Active:** source/accent colored border, opacity 1.0, filters map
- **Saved:** bookmark icon filled, persists in-session
- **Disabled:** var(--pulse-border) border, opacity 0.4, not filtering

### Each Tag
- Background: var(--pulse-surface-raised)
- Border: 1px solid (active color or dim)
- Border-radius: 4px, padding: 4px 8px
- Left icon: Lucide 'MapPin' for region | Lucide 'Hash' for topic
- Label: Space Mono, 10px, uppercase
- Bookmark icon: Lucide 'Bookmark'/'BookmarkCheck' — toggles saved state
- X button: removes from activeTags Zustand
- aria-label: "[type] filter: [label]"

### Tag Animations
- Enter: { opacity: 0, scale: 0.8 } → { opacity: 1, scale: 1 }, 200ms
- Exit: { opacity: 0, scale: 0.8 }, 150ms
- Use AnimatePresence for enter/exit

### Behavior
- Multiple tags active simultaneously
- Map shows only pins matching ANY active tag
  Match: topic contains tag label OR region contains tag label
- Disabled tag: stays visible but does not filter
- Active tags array injected into every AI query automatically

---

## Zustand Store Shape

`appStore.js` must initialize with exactly this state. No persistence. Resets on refresh.

```javascript
{
  // Data
  trendData: [],
  activeRegion: null,
  trendSnapshots: [],           // [{ timestamp: ISO8601, data: [...] }] max 288

  // Source controls
  activeSources: ['google', 'youtube', 'reddit', 'gdelt', 'twitter', 'tiktok', 'instagram'],
  dataSourceArcs: {
    google: true, youtube: true, reddit: false, gdelt: false,
    twitter: false, tiktok: false, instagram: false,
  },
  dataDensity: 50,

  // Time
  timeRange: '24h',
  scrubberProgress: 100,        // 0–100, 100 = LIVE
  scrubberRange: '24h',         // '1h' | '6h' | '12h' | '24h'

  // Map
  mapStyle: 'dark',
  is3DMode: false,
  compassHeading: 0,
  compassTilt: 0,
  activeGranularity: 'country',

  // Search + Tags
  searchHistory: [],
  activeTags: [],               // [{ id, type, label, color, saved, active }]

  // AI Panel
  isAIPanelOpen: false,
  aiResponse: null,

  // Pin Detail
  isPinDetailOpen: false,
  activePinDetail: null,

  // Saved Articles
  savedArticles: [],            // [{ ...data, savedAt: ISO8601 }]

  // Chat
  isChatPanelOpen: false,
  activeChat: null,
  chatHistory: [],
}
```

---

## Environment Variables

```
# server/.env
GROQ_API_KEY=
YOUTUBE_API_KEY=
PORT=3001
ALLOWED_ORIGIN=https://your-vercel-app.vercel.app
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=30

# client/.env
VITE_API_BASE_URL=http://localhost:3001
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here
```

---

## Data Contract

```javascript
{
  id: "unique-string",
  source: "google"|"youtube"|"reddit"|"gdelt"|"twitter"|"tiktok"|"instagram",
  topic: "string",
  lat: number,
  lng: number,
  region: "string",
  volume: number,           // 0–100
  granularity: "continent"|"country"|"region",
  timestamp: ISO8601,
  url: "string",
  metadata: {}
}
```

---

## Top Bar Layout

```
[PULSE + pulse icon]  [● LIVE]     ←spacer→     [RESUME] [LINKEDIN] [BETA] [Profile ▾]
```

- Logo.jsx: "PULSE" Space Mono + Activity icon animate-pulse (CSS only)
- StatusBar.jsx: green dot + "LIVE", aria-live="polite"
- NavLinks.jsx: RESUME → /resume.pdf | LINKEDIN → placeholder, both new tab
- BetaTag.jsx: outlined pill, accent blue, "BETA"
- ProfileMenu.jsx: profile icon → dropdown: "VIEW CV" + "LINKEDIN" only

---

## Progressive Data Disclosure (Zoom)

| Tier | Zoom | Granularity | What Shows                          |
|------|------|-------------|-------------------------------------|
| 1    | 1–3  | Continent   | Continental trends, major arcs      |
| 2    | 4–5  | Country     | Country-level trends                |
| 3    | 6+   | Region      | City/state trends                   |

Pins and arcs fade in/out via Framer Motion — no hard cuts.

---

## 3D Camera System

| Zoom | Pitch  | What Renders                        |
|------|--------|-------------------------------------|
| 1–3  | 0°     | Flat top-down, continental arcs     |
| 4–5  | 20–30° | Subtle tilt, terrain emerges        |
| 6–7  | 45–60° | Bird's eye, 3D terrain              |
| 8+   | 60°+   | Building extrusions (Post-V1)       |

3D Mode off by default. Camera via Mapbox flyTo/easeTo only — never jump cuts.

---

## Animation System (Framer Motion)

All interactive motion uses Framer Motion. Continuous/infinite effects (pulse glow,
live dot, scanline) use Tailwind animate-pulse or static CSS only.

### Timing Reference

| Category      | Duration   | Used For                                              |
|---------------|------------|-------------------------------------------------------|
| Instant       | 0ms        | Text updates, data changes, state switches            |
| Quick         | 100–200ms  | Hover states, border colors, chevrons, small elements |
| Medium        | 200–300ms  | Tooltips, dropdowns, accordions, opacity changes      |
| Slow          | 300–500ms  | Panel collapses, content swaps, focus animations      |
| Extended      | 500–800ms  | Panel slides, major layout changes, spring motion     |
| Very Extended | 1–2s       | Arc line drawing, initial load, staggered reveals     |

### Spring Physics
```javascript
{ type: 'spring', damping: 30, stiffness: 300 }  // panels, major slides
{ type: 'spring', damping: 25, stiffness: 300 }  // sub-panels, pin hover expand
```

### Standard Animation Variants
```javascript
// Panel slide from right (AI panel, PinDetailView, chat history)
const slideFromRight = {
  hidden:  { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', damping: 30, stiffness: 300 } },
  exit:    { x: '100%', opacity: 0, transition: { duration: 0.2 } }
}

// Panel slide from left (data sources, time range, map style)
const slideFromLeft = {
  hidden:  { x: -300, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit:    { x: -300, opacity: 0, transition: { duration: 0.2 } }
}

// Accordion (collapsible sections — always overflow: hidden on container)
const accordion = {
  hidden:  { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1, transition: { duration: 0.2 } },
  exit:    { height: 0, opacity: 0, transition: { duration: 0.2 } }
}

// Fade (tooltips, overlays)
const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } }
}

// Floating control buttons — apply via whileHover / whileTap
// whileHover={{ scale: 1.05, x: 4 }}
// whileTap={{ scale: 0.95 }}
// transition={{ duration: 0.2 }}
```

### Initial Load Sequence
```
0.15s  Search control + TopicTags area   { opacity:0, y:-20 } → { opacity:1, y:0 }
0.15s  Floating controls cascade         { opacity:0, x:-20 } → { opacity:1, x:0 }
         Search: 0.15s | DataSources: 0.20s | TimeRange: 0.30s | MapStyle: 0.40s
0.20s  Navigation controls cascade       { opacity:0, x:-20 } → { opacity:1, x:0 }
         ZoomIn: 0.20s | ZoomOut: 0.25s | 3D: 0.30s | Location: 0.35s | Compass: 0.40s
0.30s  CollapsedAIPanel slides in        { opacity:0, x:20 }  → { opacity:1, x:0 }
0.35s  TimelineScrubber slides up        { opacity:0, y:20 }  → { opacity:1, y:0 }
0.40s  Arc lines draw                    pathLength 0→1, 1.5s each, stagger 300ms
0.60s  Flag pins animate in              { opacity:0, scale:0, y:10 } → { opacity:1, scale:1, y:0 }
         0.4s per pin, stagger 100ms

Total: ~2–3 seconds
```

### Query Submission Flow
```
0ms     User submits query
0ms     AI panel slides in from right (if not open)
200ms   Chat panel slides in
700ms   Content populates with fade
300ms   Map: inactive pins/arcs → opacity 0.2 | active → opacity 1.0 (0.3s)
Total perceived: ~1 second
```

### Hover State System

**Floating Control Buttons (Left Side)**
```
Default: bg var(--pulse-surface), border 1px var(--pulse-border),
         icon var(--pulse-text-secondary), box-shadow 0 4px 12px rgba(0,0,0,0.5)
Hover:   border → var(--pulse-accent-blue), scale 1.05, x +4px
         Tooltip fades in (300ms, pointer-events: none)
Press:   scale 0.95
```

**Tooltip Specifications**
```
Background:   var(--pulse-surface-raised)
Border:       1px solid var(--pulse-border)
Font:         Space Mono, 10px, uppercase, wide letter-spacing
Color:        var(--pulse-text-primary)
Box-shadow:   0 4px 12px rgba(0,0,0,0.5)
Opacity:      0 → 1, 300ms transition
Labels:       DATA SOURCES / TIME RANGE / MAP STYLE / SEARCH
              ZOOM IN / ZOOM OUT / 3D MODE / MY LOCATION / COMPASS
```

**Navigation Controls**
- Same hover/press as floating controls
- 3D Mode active: blue border + bg + icon (persists while enabled)
- Compass active: blue border while panel open

**Time Range Pills:** hover → blue bg + white text (200ms) | active → blue bg, white, bold

**Map Style Tiles:** hover → blue border | active → blue border + blue label

**Data Source Toggle Rows:** hover → surface-raised bg (200ms)

**Suggested Query Chips:** hover → blue border + primary text (200ms, cursor pointer)

**Input Fields (all):** focus → blue border (200ms)
**Send Buttons:** hover → blue bg + white icon (200ms) | press → scale 0.95

**Close Buttons (X icons):** hover → opacity 0.7 (200ms)

**Chat History + Live Feed + Saved Article rows:**
hover → surface-raised bg (200ms, cursor pointer)

**Chevrons (collapsible sections):** 0° → 90° on expand (200ms)

**Flag Pins:** whileHover expands height, spring { damping: 25, stiffness: 300 }

**Timeline Scrubber handle:** scale 1.2x while isDragging

### Reduced Motion (Mandatory — WCAG 2.1 AA)
```css
/* globals.css */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
```javascript
// In components using Framer Motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// If true: use opacity-only variants, skip all transforms
```

### Performance Rules
- Only animate transform and opacity — never width/height/top/left directly
- Use overflow: hidden on accordion containers
- Stagger large groups — never animate 10+ elements simultaneously
- Target 60fps minimum — test on iPad as lowest-spec device

---

## Continuous Visual Effects (Static CSS in globals.css)

### Scanline Texture
```css
.scanline-overlay {
  background: repeating-linear-gradient(
    0deg, transparent 0px, transparent 2px,
    rgba(26,31,46,0.15) 2px, rgba(26,31,46,0.15) 4px
  );
  opacity: 0.3; mix-blend-mode: overlay; pointer-events: none;
}
```

### Radial Gradient Ambient Glows
```css
.map-ambient {
  background:
    radial-gradient(circle at 25% 30%, rgba(59,130,246,0.05) 0%, transparent 40%),
    radial-gradient(circle at 75% 65%, rgba(239,68,68,0.05) 0%, transparent 40%);
  mix-blend-mode: screen; pointer-events: none;
}
```

### Flag Pin Glow
```css
.flag-pin {
  box-shadow:
    0 0 12px 4px var(--pin-color),
    0 0 24px 8px color-mix(in srgb, var(--pin-color) 40%, transparent);
  filter: drop-shadow(0 0 6px var(--pin-color));
}
```

### Live Status Dot
```css
.live-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--pulse-success);
  box-shadow: 0 0 8px var(--pulse-success);
}
/* Tailwind animate-pulse on .live-dot */
```

---

## AI Prompt Template

```javascript
const systemPrompt = `You are PULSE, an intelligence analyst assistant embedded in a
real-time global trend visualization platform. Data from Google Trends and YouTube is live.
Reddit, GDELT, X/Twitter, TikTok, and Instagram data is simulated for demonstration purposes.
Be concise, precise, and analytical. Always cite sources.
Return JSON: { answer, confidence (0-100), citations: [{title, url, source}], followUps: [x3] }`;

const userPrompt = `
Current context:
- Active region: ${region}
- Time range: ${timeRange}
- Active sources: ${activeSources.join(', ')}
- Active topic/region filters: ${activeTags.map(t => t.label).join(', ')}
- Top trends in region: ${JSON.stringify(topTrends)}
- Global top trends: ${JSON.stringify(globalTop)}

User question: ${userQuery}
`;
```

Note: activeTags are automatically injected into every AI query.

---

## Security Requirements

### API Key Protection
- All API keys in server/.env only — never in client code
- Frontend communicates exclusively with /api/* endpoints
- No external API calls from the browser under any circumstances
- .env is in .gitignore — verify before every commit

### Input Sanitization
- DOMPurify on frontend before any input leaves the browser
- express-validator on backend before processing
- Strip HTML tags, scripts, special characters from all inputs
- Max query length: 500 characters — enforce on both sides

### Secure HTTP Headers (helmet.js)
```javascript
import helmet from 'helmet';
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc:  ["'self'"],
    styleSrc:   ["'self'", "https://fonts.googleapis.com"],
    imgSrc:     ["'self'", "data:", "https://*.carto.com"],
    connectSrc: ["'self'"],
  }
}));
```

### CORS Lockdown
```javascript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};
```
Never use origin: '*' in production.

### Rate Limiting
- All /api/*: 30 requests/minute per IP
- /api/ai specifically: 10 requests/minute per IP
- Return 429 with Retry-After header on limit exceeded

### HTTPS
- Vercel and Railway enforce HTTPS automatically
- Set Strict-Transport-Security header via helmet

---

## Accessibility Requirements (WCAG 2.1 AA)

### Core Rules
- All interactive elements keyboard navigable (Tab, Enter, Space, Arrow keys)
- Focus order logical and visible — never remove focus outlines
- Color is never the only means of conveying information — always pair with icon + label
- Minimum contrast: 4.5:1 normal text, 3:1 large text (18pt+)
- No content flashes more than 3 times per second
- prefers-reduced-motion respected (mandatory — see Animation System)

### Map
- role="application" and aria-label="Global trend map" on map container
- "Switch to Table View" button — sortable data table fallback
- Flag pins: aria-label="[Source]: [topic] — [region], volume [n]/100"
- Live updates: aria-live="polite" on StatusBar

### AI Panel
- Query bar: aria-label="Ask PULSE about global trends", role="searchbox"
- AI responses: aria-live="assertive" on response container
- Suggested chips: keyboard activatable
- Loading: aria-busy="true" on panel container

### New Components
- PinDetailView: aria-label="Article detail for [topic]"
- SavedArticles: aria-live="polite" when items added/removed
- TopicTags: each tag aria-label="[type] filter: [label]"
- TimelineScrubber: aria-label="Timeline scrubber",
  aria-valuetext on handle showing current time position
- MOCK badges: aria-label="Simulated data"

### Testing Checklist (before each phase completion)
- [ ] Tab through entire UI — all elements reachable
- [ ] axe DevTools / Lighthouse — zero critical errors
- [ ] Screen reader test (NVDA or VoiceOver)
- [ ] All text 4.5:1 contrast minimum
- [ ] No keyboard traps
- [ ] Test at 768px — layout holds
- [ ] prefers-reduced-motion disables all animations

---

## Coding Rules

1. **One component per file.** No exceptions.
2. **Chakra UI v3 for components, Tailwind for layout.**
3. **Framer Motion for all animations.** No raw CSS transitions on interactive elements.
4. **No inline styles.** Tailwind classes or Chakra style props only.
5. **No console.log in committed code.** Use utils/logger.js.
6. **All API calls go through the backend.** No direct external calls from browser.
7. **Handle loading and error states** for every async operation.
8. **Comment non-obvious logic.** D3 arc math, CustomLayerInterface, zoom-granularity,
   flag pin CSS arrow, scrubber drag math, snapshot interpolation.
9. **const by default.** let only when reassignment is necessary.
10. **Functional components only.** No class components.
11. **Custom hooks for all data fetching.**
12. **Sanitize all inputs** — frontend and backend.
13. **Every interactive element needs aria-label.**
14. **GPU-accelerated animations only.** Only transform and opacity.
15. **Responsive from 768px.**
16. **Mock data varies every poll cycle** — never identical twice.
17. **MOCK badge on all simulated sources** in all UI surfaces.
18. **react-icons for all source brand icons** — never text-only source identification.
19. **activeTags injected into every AI query** automatically.
20. **DataPin is a FLAG SHAPE** — never a dot or circle. See Flag Pin Design Spec.
21. **TimelineScrubber state split:**
    scrubberProgress + scrubberRange → Zustand (shared)
    isPlaying + isDragging + isExpanded → local component state only

---

## Development Phases

| Phase | Name                  | Status      |
|-------|-----------------------|-------------|
| 1     | Project Scaffold      | DONE        |
| 2     | Map Foundation        | DONE        |
| 3     | Data Pipeline         | DONE        |
| 4     | Live Visualization    | NOT STARTED |
| 5     | AI Integration        | NOT STARTED |
| 6     | Polish & Deploy       | NOT STARTED |

---

## What PULSE Is NOT

- Not authenticated — no login, no database, no accounts, no persistence
- Not a social media platform
- Not a news aggregator
- Not a generic dashboard — every decision should feel like a war room tool
- Not over-engineered — simpler solution always wins

---

## Notes for Claude Code

- Always read this file at the start of every session before any code.
- Flag anything conflicting with these rules before proceeding.
- DataPin = FLAG SHAPE. See Flag Pin Design Spec. Not a dot. Not a circle.
- MapCard.jsx is retired — flag pin hover state replaces it entirely.
- TimelineScrubber: scrubberProgress + scrubberRange in Zustand only.
  isPlaying, isDragging, isExpanded are local state only.
- Time range is controlled exclusively by the TimelineScrubber range pills.
  TimeRangePanel is retired — do not recreate it.
  Pill click updates both scrubberRange AND timeRange in Zustand.
- Pre-generate 288 mock snapshots on app load (1 per 5 min, 24h window).
- PinDetailView is absolute overlay inside AIPanel — same container.
- SavedArticles is a collapsible section inside AIPanel — not a panel.
- react-icons required for all source brand icons throughout.
- activeTags always injected into AI query context automatically.
- Resume and LinkedIn links are placeholders — do not hardcode real URLs.

---

## Verification Rules (MANDATORY)

### Before creating any file:
1. pwd — confirm correct working directory
2. ls — confirm target folder exists
3. Confirm file does not already exist
4. State destination folder before writing

### Before running any terminal command:
1. pwd before mkdir, mv, npm install, or file creation
2. Never assume directory — always verify
3. Unexpected output → stop and diagnose before continuing

### After creating or moving any file:
1. ls in target directory to confirm file landed
2. Config files (.env, vite.config.js, package.json) → open and verify contents
3. Confirm folder structure still matches spec above

### After every install:
1. Verify node_modules exists in correct directory
2. Check package.json lists installed packages
3. Never npm install without confirming you are in client/ or server/

### General:
- One step at a time — complete and verify before starting next
- Something looks wrong → stop and fix before continuing
- Moving files → confirm source and destination before executing
