/**
 * Convert lat/lng to a Mapbox LngLat-compatible array.
 * Mapbox uses [lng, lat] order (GeoJSON standard).
 * @param {number} lat
 * @param {number} lng
 * @returns {[number, number]}
 */
export const coordsToMapbox = (lat, lng) => [lng, lat]

/**
 * Determine the zoom-based data granularity tier.
 * Controls which pins and arcs are rendered at any zoom level.
 * @param {number} zoom - Mapbox zoom level
 * @returns {'continent' | 'country' | 'region'}
 */
export const getZoomGranularity = (zoom) => {
  if (zoom <= 3) return 'continent'
  if (zoom <= 5) return 'country'
  return 'region'
}

/**
 * Generate interpolated arc path points between two geo-coordinates.
 * Uses a great-circle approximation with a vertical midpoint offset
 * to create the parabolic arc effect rendered by D3.
 * @param {{ lat: number, lng: number }} origin
 * @param {{ lat: number, lng: number }} destination
 * @param {number} steps - Number of intermediate points
 * @returns {Array<[number, number]>} Array of [lng, lat] tuples
 */
export const interpolateArcPath = (origin, destination, steps = 50) => {
  const points = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const lat = origin.lat + (destination.lat - origin.lat) * t
    const lng = origin.lng + (destination.lng - origin.lng) * t
    // Parabolic lift: arc peaks at midpoint
    const lift = Math.sin(Math.PI * t) * 0.3 * Math.abs(destination.lat - origin.lat)
    points.push([lng, lat + lift])
  }
  return points
}
