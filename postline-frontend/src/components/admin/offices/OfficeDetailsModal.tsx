import { X, MapPin, Phone, Clock, Info } from 'lucide-react';
import type { Department } from '../../../types/departments';

interface OfficeDetailsModalProps {
  department: Department;
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  sorting_center: 'Сортувальний центр',
  post_office: 'Відділення',
  pickup_point: 'Пункт видачі',
};

const OfficeDetailsModal = ({ department, onClose }: OfficeDetailsModalProps) => {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Info className="text-pine" size={24} />
            Деталі відділення
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Місто</p>
            <p className="text-lg font-bold text-slate-900">{department.city}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                <MapPin size={16} className="text-pine" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-400">Адреса</p>
                <p className="font-medium text-slate-900">{department.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                <Info size={16} className="text-pine" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-400">Тип відділення</p>
                <p className="font-medium text-slate-900">{TYPE_LABELS[department.type] ?? department.type}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                <Phone size={16} className="text-pine" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-400">Телефон</p>
                <p className="font-medium text-slate-900">{department.phone || 'Не вказано'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                <Clock size={16} className="text-pine" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-400">Графік роботи</p>
                <p className="font-medium text-slate-900">
                  {department.opening_time && department.closing_time
                    ? `${department.opening_time} - ${department.closing_time}`
                    : 'Не вказано'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfficeDetailsModal;
