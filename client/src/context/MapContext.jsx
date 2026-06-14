import { createContext, useContext, useState } from 'react'

const MapContext = createContext({ map: null, setMap: () => {} })

// Consumed by all components that need the Mapbox instance
export const useMapContext = () => useContext(MapContext).map

// Consumed only by MapContainer to register the instance after load
export const useSetMap = () => useContext(MapContext).setMap

export const MapProvider = ({ children }) => {
  const [map, setMap] = useState(null)
  return (
    <MapContext.Provider value={{ map, setMap }}>
      {children}
    </MapContext.Provider>
  )
}
