import { CreditCard } from 'lucide-react';
import type { ShipmentDetail } from './shipmentDetailTypes';

type ShipmentCostCardProps = {
  shipment: ShipmentDetail;
};

export const ShipmentCostCard = ({ shipment }: ShipmentCostCardProps) => (
  <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
    <h2 className="font-bold text-slate-800 flex items-center gap-2">
      <CreditCard size={18} className="text-pine" /> Вартість
    </h2>
    <div className="text-3xl font-black text-pine">
      {parseFloat(shipment.total_cost).toFixed(2)} грн
    </div>
  </div>
);
