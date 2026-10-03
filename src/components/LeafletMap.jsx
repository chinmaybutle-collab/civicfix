import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Eye, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

// Vector DivIcon generator that never depends on local PNG assets
export const createPinIcon = (status = 'Reported', priority = 'Medium') => {
  let color = '#2563EB'; // Blue
  if (status === 'Resolved') color = '#10B981'; // Green
  else if (status === 'In Progress') color = '#8B5CF6'; // Purple
  else if (status === 'Assigned') color = '#6366F1'; // Indigo
  else if (status === 'Verified') color = '#0284C7'; // Sky
  else if (status === 'Reported') color = '#F59E0B'; // Amber
  else if (status === 'Rejected') color = '#EF4444'; // Red

  const isCritical = priority === 'Critical';

  return L.divIcon({
    className: 'civic-marker-wrapper',
    html: `
      <div style="position: relative; width: 34px; height: 34px;">
        ${isCritical ? `<div style="position: absolute; inset: -4px; border-radius: 50%; background: #EF4444; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
        <div style="
          background-color: ${color};
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background: white;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34]
  });
};

// Component to handle map clicks for coordinate selection
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect({
          lat: Number(e.latlng.lat.toFixed(5)),
          lng: Number(e.latlng.lng.toFixed(5))
        });
      }
    }
  });
  return null;
}

// Component to auto-center map when center coordinates change
function RecenterController({ center, zoom = 14 }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

export default function LeafletMap({
  mode = 'multi', // 'multi' | 'single' | 'picker'
  complaints = [],
  singleComplaint = null,
  selectedLocation = null, // { lat, lng }
  onLocationSelect = null,
  height = '400px',
  defaultCenter = [28.6139, 77.2090], // Metro City default
  defaultZoom = 13
}) {
  const [mapCenter, setMapCenter] = useState(
    selectedLocation ? [selectedLocation.lat, selectedLocation.lng] :
    singleComplaint?.location ? [singleComplaint.location.lat, singleComplaint.location.lng] :
    defaultCenter
  );

  const [locating, setLocating] = useState(false);

  // Handle current location GPS click
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        setMapCenter([lat, lng]);
        if (onLocationSelect) {
          onLocationSelect({
            lat,
            lng,
            address: `GPS Pin (${lat}, ${lng})`
          });
        }
        setLocating(false);
      },
      (err) => {
        // Fallback for sandboxed environments without real GPS
        const fallbackLat = 28.6180;
        const fallbackLng = 77.2150;
        setMapCenter([fallbackLat, fallbackLng]);
        if (onLocationSelect) {
          onLocationSelect({
            lat: fallbackLat,
            lng: fallbackLng,
            address: 'Metro City Center (Simulated GPS)'
          });
        }
        setLocating(false);
      },
      { timeout: 5000 }
    );
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xs" style={{ height }}>
      {/* Floating GPS trigger button for picker mode */}
      {mode === 'picker' && (
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className="absolute top-4 right-4 z-[500] bg-white hover:bg-slate-50 text-blue-600 font-semibold text-xs px-3.5 py-2 rounded-lg shadow-md border border-slate-200 flex items-center gap-1.5 transition-all active:scale-95"
        >
          <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
          <span>{locating ? 'Detecting Location...' : 'Use Current GPS'}</span>
        </button>
      )}

      {/* Picker instructional banner */}
      {mode === 'picker' && (
        <div className="absolute bottom-4 left-4 right-4 z-[500] bg-white/95 backdrop-blur-xs border border-slate-200 p-2.5 rounded-lg text-xs text-slate-700 shadow-md flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Click anywhere on the map to pin exact issue location</span>
          </div>
          {selectedLocation && (
            <span className="font-mono text-slate-500 font-medium">
              {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
            </span>
          )}
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={defaultZoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterController center={mapCenter} zoom={defaultZoom} />

        {/* Picker Mode: Single draggable/clickable pin */}
        {mode === 'picker' && (
          <>
            <MapClickHandler onLocationSelect={onLocationSelect} />
            {selectedLocation && (
              <Marker
                position={[selectedLocation.lat, selectedLocation.lng]}
                icon={createPinIcon('Reported', 'High')}
              >
                <Popup>
                  <div className="p-1 text-xs">
                    <p className="font-bold text-slate-900">Selected Issue Location</p>
                    <p className="text-slate-600 font-mono mt-0.5">
                      Lat: {selectedLocation.lat}, Lng: {selectedLocation.lng}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}
          </>
        )}

        {/* Single Mode: Display one complaint on details page */}
        {mode === 'single' && singleComplaint && singleComplaint.location && (
          <Marker
            position={[singleComplaint.location.lat, singleComplaint.location.lng]}
            icon={createPinIcon(singleComplaint.status, singleComplaint.priority)}
          >
            <Popup>
              <div className="p-2 min-w-[180px]">
                <div className="text-[11px] font-mono text-slate-400 font-bold mb-1">
                  {singleComplaint.id}
                </div>
                <div className="font-bold text-slate-900 text-xs mb-1">
                  {singleComplaint.category}
                </div>
                <p className="text-[11px] text-slate-600 mb-2 line-clamp-2">
                  {singleComplaint.location.address}
                </p>
                <StatusBadge status={singleComplaint.status} size="sm" />
              </div>
            </Popup>
          </Marker>
        )}

        {/* Multi Mode: Authority Live Map */}
        {mode === 'multi' &&
          complaints.map((item) => {
            if (!item.location || !item.location.lat || !item.location.lng) return null;
            return (
              <Marker
                key={item.id}
                position={[item.location.lat, item.location.lng]}
                icon={createPinIcon(item.status, item.priority)}
              >
                <Popup>
                  <div className="p-1.5 min-w-[220px] space-y-2">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1">
                      <span className="font-mono text-[11px] font-bold text-blue-600">
                        {item.id}
                      </span>
                      <PriorityBadge priority={item.priority} />
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{item.category}</h4>
                      <p className="text-slate-500 text-[11px] line-clamp-2 mt-0.5">
                        {item.title || item.description}
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-500 font-medium truncate">
                      📍 {item.location.address}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <StatusBadge status={item.status} size="sm" />
                      <Link
                        to={`/complaints/${item.id}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                      >
                        <span>Details</span>
                        <Eye className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
}
