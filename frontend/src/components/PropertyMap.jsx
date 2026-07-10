import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import '../utils/leafletIconFix';
import MapResizeFix from './MapResizeFix';

const PropertyMap = ({ latitude, longitude, title }) => {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  if (isNaN(lat) || isNaN(lng)) return null;

  return (
    <div className="h-72 rounded-lg overflow-hidden border border-border">
      <MapContainer center={[lat, lng]} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapResizeFix />
        <Marker position={[lat, lng]}>
          <Popup>{title}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default PropertyMap;