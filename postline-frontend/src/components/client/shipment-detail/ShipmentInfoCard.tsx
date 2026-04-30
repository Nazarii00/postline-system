import { Package } from 'lucide-react';
import type { ShipmentDetail } from './shipmentDetailTypes';
import { SIZE_LABELS, TYPE_LABELS } from './shipmentDetailUtils';

type ShipmentInfoCardProps = {
  shipment: ShipmentDetail;
};

export const ShipmentInfoCard = ({ shipment }: ShipmentInfoCardProps) => (
  <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
    <h2 className="font-bold text-slate-800 flex items-center gap-2">
      <Package size={18} className="text-pine" /> Деталі
    </h2>
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div>
        <p className="text-slate-400 text-xs uppercase tracking-wider">Тип</p>
        <p className="font-medium text-slate-800">
          {TYPE_LABELS[shipment.shipment_type] ?? shipment.shipment_type}
        </p>
      </div>
      <div>
        <p className="text-slate-400 text-xs uppercase tracking-wider">Розмір</p>
        <p className="font-medium text-slate-800">
          {SIZE_LABELS[shipment.size_category] ?? shipment.size_category}
        </p>
      </div>
      <div>
        <p className="text-slate-400 text-xs uppercase tracking-wider">Вага</p>
        <p className="font-medium text-slate-800">{shipment.weight_kg} кг</p>
      </div>
      <div>
        <p className="text-slate-400 text-xs uppercase tracking-wider">Габарити</p>
        <p className="font-medium text-slate-800">
          {shipment.length_cm}x{shipment.width_cm}x{shipment.height_cm} см
        </p>
      </div>
      {shipment.declared_value && (
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-wider">Оголошена цінність</p>
          <p className="font-medium text-slate-800">{shipment.declared_value} грн</p>
        </div>
      )}
      <div>
        <p className="text-slate-400 text-xs uppercase tracking-wider">Кур'єр</p>
        <p className="font-medium text-slate-800">{shipment.is_courier ? 'Так' : 'Ні'}</p>
      </div>
    </div>
    {shipment.description && (
      <div className="border-t border-slate-100 pt-3">
        <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Опис</p>
        <p className="text-sm text-slate-600">{shipment.description}</p>
      </div>
    )}
  </div>
);
