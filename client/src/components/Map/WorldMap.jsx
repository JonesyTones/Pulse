// Decorative CSS overlays — scanline texture, radial ambient glow, dot-grid
// All layers are pointer-events: none and must never block map interaction
const WorldMap = () => (
  <>
    <div className="scanline-overlay" />
    <div className="map-ambient" />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(37,43,59,0.9) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  </>
)

export default WorldMap
