import { useEffect } from 'react'
import logger from '../../utils/logger.js'
import { useMapContext } from '../../context/MapContext.jsx'

const TERRAIN_SOURCE_ID = 'mapbox-dem'

const TerrainLayer = ({ is3DMode }) => {
  const mapInstance = useMapContext()
  useEffect(() => {
    if (!mapInstance) return

    if (is3DMode) {
      try {
        if (!mapInstance.getSource(TERRAIN_SOURCE_ID)) {
          mapInstance.addSource(TERRAIN_SOURCE_ID, {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
            maxzoom: 14,
          })
        }
        mapInstance.setTerrain({ source: TERRAIN_SOURCE_ID, exaggeration: 1.5 })
        logger.info('Terrain enabled')
      } catch (e) {
        logger.error('TerrainLayer enable error', e)
      }
    } else {
      try {
        mapInstance.setTerrain(null)
        if (mapInstance.getSource(TERRAIN_SOURCE_ID)) {
          mapInstance.removeSource(TERRAIN_SOURCE_ID)
        }
        logger.info('Terrain disabled')
      } catch (_) { /* source may not exist */ }
    }
  }, [mapInstance, is3DMode])

  return null
}

export default TerrainLayer
