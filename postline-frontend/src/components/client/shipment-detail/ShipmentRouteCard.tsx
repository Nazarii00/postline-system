import { MapPin } from 'lucide-react';
import type { ShipmentDetail } from './shipmentDetailTypes';

type ShipmentRouteCardProps = {
  shipment: ShipmentDetail;
};

export const ShipmentRouteCard = ({ shipment }: ShipmentRouteCardProps) => (
  <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
    <h2 className="font-bold text-slate-800 flex items-center gap-2">
      <MapPin size={18} className="text-pine" /> Маршрут
    </h2>
    <div className="flex items-center gap-3">
      <div className="flex-1 text-center">
        <p className="font-bold text-slate-800">{shipment.origin_city}</p>
        <p className="text-xs text-slate-400">{shipment.origin_address}</p>
      </div>
      <div className="text-slate-300 font-bold">{'->'}</div>
      <div className="flex-1 text-center">
        <p className="font-bold text-slate-800">{shipment.dest_city}</p>
        <p className="text-xs text-slate-400">{shipment.dest_address}</p>
      </div>
    </div>
  </div>
);
