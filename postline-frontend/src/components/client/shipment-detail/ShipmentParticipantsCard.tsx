import { User } from 'lucide-react';
import type { ShipmentDetail } from './shipmentDetailTypes';

type ShipmentParticipantsCardProps = {
  shipment: ShipmentDetail;
};

export const ShipmentParticipantsCard = ({ shipment }: ShipmentParticipantsCardProps) => (
  <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
    <h2 className="font-bold text-slate-800 flex items-center gap-2">
      <User size={18} className="text-pine" /> Учасники
    </h2>
    <div className="space-y-3">
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Відправник</p>
        <p className="font-semibold text-slate-800">{shipment.sender_name}</p>
        <p className="text-sm text-slate-500">{shipment.sender_phone}</p>
        <p className="text-sm text-slate-500">{shipment.sender_address}</p>
      </div>
      <div className="border-t border-slate-100" />
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Одержувач</p>
        <p className="font-semibold text-slate-800">{shipment.receiver_name}</p>
        <p className="text-sm text-slate-500">{shipment.receiver_phone}</p>
        <p className="text-sm text-slate-500">{shipment.receiver_address}</p>
      </div>
    </div>
  </div>
);
