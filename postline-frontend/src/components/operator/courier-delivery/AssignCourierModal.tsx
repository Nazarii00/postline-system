import { X } from 'lucide-react';
import type { Courier, ReadyForCourierShipment } from '../../../types/courier';
import { INPUT_LIMITS } from '../../../utils/formUtils';

type AssignCourierModalProps = {
  shipment: ReadyForCourierShipment;
  couriers: Courier[];
  selectedCourier: string;
  toAddress: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSelectedCourierChange: (value: string) => void;
  onToAddressChange: (value: string) => void;
  onAssign: () => void;
};

export const AssignCourierModal = ({
  shipment,
  couriers,
  selectedCourier,
  toAddress,
  isSubmitting,
  onClose,
  onSelectedCourierChange,
  onToAddressChange,
  onAssign,
}: AssignCourierModalProps) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-slate-800">Призначити кур'єра</h3>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Відправлення</p>
          <p className="font-bold text-pine">{shipment.tracking_number}</p>
          <p className="text-sm text-slate-600">{shipment.receiver_name}</p>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-500 font-black mb-2">
            Кур'єр <span className="text-rose-500">*</span>
          </label>
          <select
            value={selectedCourier}
            onChange={(event) => onSelectedCourierChange(event.target.value)}
            required
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine text-sm font-medium"
          >
            <option value="">Оберіть кур'єра...</option>
            {couriers.map((courier) => (
              <option key={courier.id} value={courier.id}>{courier.full_name} · {courier.phone}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-500 font-black mb-2">
            Адреса доставки <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={toAddress}
            onChange={(event) => onToAddressChange(event.target.value)}
            placeholder="вул. Шевченка, 1"
            required
            minLength={INPUT_LIMITS.addressMin}
            maxLength={INPUT_LIMITS.addressMax}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine text-sm font-medium"
          />
        </div>

        <button
          onClick={onAssign}
          disabled={!selectedCourier || !toAddress || isSubmitting}
          className="w-full py-4 bg-pine text-white font-black rounded-2xl hover:bg-pine/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Збереження...' : 'Призначити'}
        </button>
      </div>
    </div>
  </div>
);
