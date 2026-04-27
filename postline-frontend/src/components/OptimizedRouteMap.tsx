import { divIcon } from 'leaflet';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import type { OptimizedRouteResult } from '../services/routeOptimizationService';

type Props = {
  route: OptimizedRouteResult;
};

const createMarkerIcon = (label: string, color: string) =>
  divIcon({
    className: '',
    html: `<div style="width:34px;height:34px;border-radius:14px;background:${color};color:white;display:flex;align-items:center;justify-content:center;font-weight:800;border:3px solid white;box-shadow:0 8px 20px rgba(15,23,42,.22);font-size:12px;">${label}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

const startIcon = createMarkerIcon('S', '#1a362d');

export const OptimizedRouteMap = ({ route }: Props) => {
  const center: [number, number] = [route.start.lat, route.start.lng];
  const routePositions = route.geometry.coordinates.map(
    ([lng, lat]) => [lat, lng] as [number, number]
  );

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
      <MapContainer center={center} zoom={12} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={routePositions} pathOptions={{ color: '#1a362d', weight: 5 }} />
        <Marker position={center} icon={startIcon}>
          <Popup>
            <strong>Старт</strong>
            <br />
            {route.start.address}
          </Popup>
        </Marker>
        {route.orderedDeliveries.map((delivery) => (
          <Marker
            key={delivery.id}
            position={[delivery.lat, delivery.lng]}
            icon={createMarkerIcon(String(delivery.order), '#0f766e')}
          >
            <Popup>
              <strong>#{delivery.order} · {delivery.trackingNumber}</strong>
              <br />
              {delivery.resolvedAddress}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
