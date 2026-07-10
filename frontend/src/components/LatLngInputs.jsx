import { useState, useEffect } from 'react';

const LatLngInputs = ({ position, onSelect }) => {
  const [latInput, setLatInput] = useState(position?.lat?.toString() ?? '');
  const [lngInput, setLngInput] = useState(position?.lng?.toString() ?? '');

  useEffect(() => {
    setLatInput(position?.lat?.toString() ?? '');
    setLngInput(position?.lng?.toString() ?? '');
  }, [position?.lat, position?.lng]);

  const commitLat = (value) => {
    setLatInput(value);
    const num = parseFloat(value);
    if (!isNaN(num)) onSelect({ lat: num, lng: position?.lng ?? 78.9629 });
  };

  const commitLng = (value) => {
    setLngInput(value);
    const num = parseFloat(value);
    if (!isNaN(num)) onSelect({ lat: position?.lat ?? 20.5937, lng: num });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-ink mb-1">Latitude</label>
        <input
          type="text" inputMode="decimal"
          value={latInput}
          onChange={(e) => commitLat(e.target.value)}
          placeholder="28.6139"
          className="w-full px-3 py-2 border border-border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-1">Longitude</label>
        <input
          type="text" inputMode="decimal"
          value={lngInput}
          onChange={(e) => commitLng(e.target.value)}
          placeholder="77.2090"
          className="w-full px-3 py-2 border border-border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <p className="text-xs text-muted font-sans">Or click the map — both stay in sync.</p>
    </div>
  );
};

export default LatLngInputs;