import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import '../utils/leafletIconFix';
import MapResizeFix from './MapResizeFix';

const LocationMarker = ({ position, onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return position ? <Marker position={[position.lat, position.lng]} /> : null;
};

const RecenterOnChange = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position && !isNaN(position.lat) && !isNaN(position.lng)) {
      map.setView([position.lat, position.lng], map.getZoom() < 10 ? 13 : map.getZoom());
    }
  }, [position?.lat, position?.lng]);
  return null;
};

const LocationPicker = ({ position, onSelect }) => {
  const center = position ? [position.lat, position.lng] : [20.5937, 78.9629];
  const zoom = position ? 13 : 5;

  return (
    <div>
      <div className="h-64 w-full rounded-lg overflow-hidden border border-border">
        <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onSelect={onSelect} />
          <RecenterOnChange position={position} />
          <MapResizeFix />
        </MapContainer>
      </div>
      <p className="text-xs text-muted font-sans mt-1">
        Click the map to set this property's exact location.
      </p>
    </div>
  );
};

export default LocationPicker;