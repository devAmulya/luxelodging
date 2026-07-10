import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

// Leaflet sometimes measures its container before the surrounding
// grid/flex layout has fully settled, causing an undersized map.
// Forcing a resize check right after mount fixes this reliably.
const MapResizeFix = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

export default MapResizeFix;