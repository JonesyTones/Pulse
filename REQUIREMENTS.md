# PULSE — Real-Time Global Intelligence Visualization Platform
# Product Requirements Document
# Version 1.5 — May 2026

---

## Project Overview

PULSE is a dark ops-center style web application for visualizing real-time global intelligence
data. Portfolio project demonstrating full-stack engineering, real-time data integration,
AI-powered analysis, and sophisticated UI/UX design.

Aesthetic: military/DOD mission control — Palantir, NORAD, live intelligence dashboard.
No authentication. No database. No persistence across sessions.

---

## Design System

### Colors
```
Background:      #0A0C10
Surface:         #111318
Surface Raised:  #1A1F2E
Border:          #252B3B
Text Primary:    #F0F4FF
Text Secondary:  #6B7A99
Text Dim:        #8B9AAF
Google/Actions:  #3B82F6  Blue
YouTube:         #EF4444  Red
Reddit:          #F97316  Orange
GDELT:           #F59E0B  Amber
X/Twitter:       #06B6D4  Cyan
TikTok:          #EC4899  Pink
Instagram:       #A855F7  Purple
Success:         #10B981
Warning:         #FBBF24
```

### Typography
- Space Mono — UI chrome, labels, data (uppercase, wide tracking)
- Inter — body text, AI responses, prose

---

## Supported Devices

| Breakpoint | Min Width | Device        |
|------------|-----------|---------------|
| sm         | 768px     | iPad portrait |
| md         | 1024px    | iPad landscape|
| lg         | 1280px    | Laptop        |
| xl         | 1440px    | Desktop target|
| 2xl        | 1920px+   | Ultrawide     |

Below 768px: unsupported message only.

---

## Tech Stack

- React 19 + Vite
- Chakra UI v3 + Framer Motion
- Mapbox GL JS + D3.js
- Tailwind CSS v4 + Zustand
- react-icons (brand SVG icons)
- Node.js + Express + Claude API
- Vercel + Railway

---

## Data Sources

| Source    | Color  | Hex     | Type           | Brand Icon  |
|-----------|--------|---------|----------------|-------------|
| Google    | Blue   | #3B82F6 | Real API       | FaGoogle    |
| YouTube   | Red    | #EF4444 | Real API       | FaYoutube   |
| Reddit    | Orange | #F97316 | Permanent mock | FaReddit    |
| GDELT     | Amber  | #F59E0B | Permanent mock | FaNewspaper |
| X/Twitter | Cyan   | #06B6D4 | Permanent mock | FaXTwitter  |
| TikTok    | Pink   | #EC4899 | Permanent mock | FaTiktok    |
| Instagram | Purple | #A855F7 | Permanent mock | FaInstagram |

Mock data varies every 60s. MOCK badge shown everywhere for simulated sources.

---

## Application Layout

### Top Bar (48px fixed)
```
[PULSE + icon] [● LIVE]     ←spacer→     [RESUME] [LINKEDIN] [BETA] [Profile ▾]
```

### World Map
- Full viewport, Mapbox GL, CARTO dark tiles
- Scanline texture + dot-grid + ambient glows
- Flag pins + arc lines

### Search Control + Topic Tags (Top Center)
- 600px wide, fixed below top bar
- Accepts region (flies map + creates tag) or topic (creates tag only)
- **TopicTags strip** below search when tags active
- In-session search history dropdown

### Topic Tags
- Horizontal scrollable strip below SearchControl
- Active: colored border, filters map + AI context
- Saved: bookmark icon filled
- Disabled: 0.4 opacity, not filtering
- Multiple active simultaneously
- Auto-injected into every AI query

### Left Side — Floating Controls
1. **Data Sources** (320px) — 7 sources, MOCK badges, toggles, density slider
2. **Time Range** (220px) — 1H / 24H / 7D
3. **Map Style** (280px) — DARK / SATELLITE / TERRAIN / NATURAL / STREET

### Left Side — Navigation Controls (bottom)
Zoom In / Zoom Out / 3D Mode / My Location / Compass

### Timeline Scrubber (Bottom Center, above QueryBar)
600px wide floating bar, same style as QueryBar.

**Two rows:**

Top row (collapsible): time range pills — 1H / 6H / 12H / 24H
- Active pill: filled accent blue
- Click time label to expand/collapse
- Controls scrubberRange in Zustand

Bottom row (always visible): scrubber track
- Play/Pause button (left)
- Time label with chevron (e.g. "24H AGO") — click to expand top row
- Horizontal track: dim background, blue filled to handle, blue glow
- Draggable handle: accent blue circle, white border, scales 1.2x while dragging
- Tooltip above handle while dragging: shows "5H AGO", "45M AGO", or "LIVE"
- LIVE indicator (right): pulsing green dot + "LIVE" — only pulses at progress 100

**Behavior:**
- Default: handle far right = LIVE, real-time data shown
- Drag left: shows historical mock snapshot for that time
- Pre-generated 288 mock snapshots (1 per 5 min, 24h window) on app load
- Click anywhere on track: jumps to that position
- Snap to nearest 5-minute interval on release
- Play: auto-animates 0→100 over 10s

**State:**
- Zustand: scrubberProgress (0–100), scrubberRange ('1h'|'6h'|'12h'|'24h')
- Local: isPlaying, isDragging, isExpanded

### Query Bar (Bottom Center, below scrubber)
- Always visible, floating glow, pulsing Activity icon
- Active tags auto-included in AI context

### AI Intelligence Panel (Right, 440px)

**Collapsed:** vertical tab, "PULSE INTELLIGENCE", pulsing icon, click to expand

**Expanded sections (all collapsible):**
1. Global Activity Summary — top trends all sources
2. Analysis — AI text + confidence % (query only)
3. Sources — citations with brand icons + MOCK badges
4. Live Feed — latest items, color-coded borders
5. Saved Articles — in-session saved pins

**PinDetailView** — absolute overlay inside AIPanel on flag pin click:
- Slides over AI panel content
- Full topic detail, metadata, volume bar
- SAVE ARTICLE → adds to Saved Articles
- OPEN SOURCE → opens url in new tab
- Back arrow → returns to AIPanel
- Related trends (collapsible)

### Saved Articles (inside AIPanel)
- Collapsible, collapsed by default
- In-session only
- Each: brand icon + topic + region + timestamp + remove
- Click → opens PinDetailView

### Chat Panel (520×320, bottom-right)
- Appears when conversation active
- History, suggested chips, input

---

## Flag Pin Design

NOT dots. NOT circles. Speech bubble with bottom-left arrow.

```
┌─────────────────────┐
│ [brand icon] topic  │
└──▼──────────────────┘
```

- 120×36px default, rounded rect + CSS arrow ::after
- Source color bg at 90%, brand icon left strip, topic text right
- Glow: drop-shadow in source color
- Hover: expands to 80px, shows full detail + MOCK badge
- Click: opens PinDetailView
- Load: { opacity:0, scale:0, y:10 } → { opacity:1, scale:1, y:0 }

---

## Data Sources Panel

7 rows in order: Google, YouTube, Reddit, GDELT, X/Twitter, TikTok, Instagram

Each row:
- Color dot + brand icon + source name
- MOCK badge (sources 3–7): dim outlined pill, aria-label="Simulated data"
- Main toggle (activeSources) + ARCS sub-toggle (dataSourceArcs)
- Row hover: surface-raised bg

Bottom: DATA DENSITY slider (SPARSE → DENSE, updates dataDensity)

---

## User Flows

### Default State
- Map with flag pins + arcs
- Search bar + empty tag strip
- Timeline scrubber at LIVE
- Floating controls + nav controls
- Query bar visible
- Collapsed AI tab right edge

### After Adding Tags
- Tag strip populates below search
- Map dims unrelated pins (0.2 opacity)
- AI context updated

### After Clicking Flag Pin
- PinDetailView slides over AIPanel
- Detail + metadata shown
- Save + Open Source available
- Back arrow returns to AIPanel

### Using Timeline Scrubber
- Drag left: historical snapshot shown
- Release: snaps to nearest 5-min interval
- Click play: auto-plays to LIVE
- At LIVE: real-time data

### After Submitting Query
- AI panel expands
- Chat panel appears
- Analysis + Sources populate
- Active tags in context

---

## Animation System

All interactive: Framer Motion
Continuous: Tailwind animate-pulse / static CSS

Key springs:
- Panels: damping 30, stiffness 300
- Pin expand / sub-panels: damping 25, stiffness 300

Initial load order:
1. Search + tags (0.15s)
2. Floating controls (0.15–0.40s)
3. Nav controls (0.20–0.40s)
4. CollapsedAIPanel (0.30s)
5. TimelineScrubber (0.35s)
6. Arcs draw (0.40s+)
7. Flag pins pop in (0.60s+)

Reduced motion: mandatory CSS + Framer Motion check.

---

## AI Integration

- Claude API backend only
- Active tags auto-injected into every query
- Response: { answer, confidence, citations, followUps: [x3] }
- System prompt acknowledges mock sources

---

## Security

- API keys server-side only
- DOMPurify + express-validator, 500 char max
- helmet CSP, CORS locked, rate limiting

---

## Accessibility (WCAG 2.1 AA)

- Color + icon + label always together
- MOCK badges: aria-label="Simulated data"
- Flag pins: descriptive aria-labels
- TimelineScrubber: aria-label + aria-valuetext
- prefers-reduced-motion mandatory

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
