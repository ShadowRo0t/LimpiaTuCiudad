import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix para el icono de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Componente para manejar clicks en el mapa
function MapClickHandler({ onLocationSelect, existingLocation }) {
  const map = useMapEvents({
    click: (e) => {
      if (onLocationSelect) {
        onLocationSelect({
          lat: e.latlng.lat,
          lng: e.latlng.lng
        });
      }
    }
  });

  return null;
}

const MapComponent = ({
  center = { lat: -34.6037, lng: -58.3816 }, // Buenos Aires por defecto
  zoom = 13,
  marker = null,
  onLocationSelect = null,
  height = '400px',
  readOnly = false
}) => {
  const [currentMarker, setCurrentMarker] = useState(marker || center);

  const handleLocationSelect = (location) => {
    if (!readOnly) {
      setCurrentMarker(location);
      if (onLocationSelect) {
        onLocationSelect(location);
      }
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-300" style={{ height }}>
      <MapContainer
        center={currentMarker}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {currentMarker && (
          <Marker position={[currentMarker.lat, currentMarker.lng]}>
            <Popup>
              {readOnly ? 'Ubicación del reporte' : 'Ubicación seleccionada'}
            </Popup>
          </Marker>
        )}
        {!readOnly && (
          <MapClickHandler
            onLocationSelect={handleLocationSelect}
            existingLocation={marker}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
