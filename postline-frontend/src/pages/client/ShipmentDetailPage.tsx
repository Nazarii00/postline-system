import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Clock, User, CreditCard } from 'lucide-react';
import { api } from '../../services/api';

type StatusEvent = {
  status_set: string;
  notes: string | null;
  created_at: string;
  department_city: string | null;
  department_address: string | null;
  operator_name: string | null;
};

type ShipmentDetail = {
  id: number;
  tracking_number: string;
  status: string;
  total_cost: string;
  created_at: string;
  shipment_type: string;
  size_category: string;
  weight_kg: string;
  length_cm: string;
  width_cm: string;
  height_cm: string;
  declared_value: string | null;
  description: string | null;
  sender_address: string;
  receiver_address: string;
  is_courier: boolean;
  sender_name: string;
  sender_phone: string;
  receiver_name: string;
  receiver_phone: string;
  origin_city: string;
  origin_address: string;
  dest_city: string;
  dest_address: string;
  history?: StatusEvent[];
};

const STATUS_LABELS: Record<string, string> = {
  accepted:         'Прийнято',
  sorting:          'На сортуванні',
  in_transit:       'В дорозі',
  arrived:          'У відділенні',
  ready_for_pickup: 'Готове до видачі',
  delivered:        'Доставлено',
  returned:         'Повернуто',
  cancelled:        'Скасовано',
};

const TYPE_LABELS: Record<string, string> = {
  letter:  'Лист',
  parcel:  'Посилка',
  package: 'Бандероль',
};

const SIZE_LABELS: Record<string, string> = {
  S: 'Малий (S)',
  M: 'Середній (M)',
  L: 'Великий (L)',
  XL: 'Дуже великий (XL)',
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'delivered':        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'in_transit':       return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'ready_for_pickup': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'cancelled':        return 'bg-red-100 text-red-700 border-red-200';
    case 'returned':         return 'bg-orange-100 text-orange-700 border-orange-200';
    default:                 return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const getTimelineDot = (status: string) => {
  switch (status) {
    case 'delivered':        return 'bg-emerald-500';
    case 'cancelled':        return 'bg-red-500';
    case 'returned':         return 'bg-orange-500';
    default:                 return 'bg-pine';
  }
};

const ShipmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState<ShipmentDetail | null>(null);
  const [history, setHistory] = useState<StatusEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get<{ data: ShipmentDetail }>(`/shipments/${id}`),
      api.get<{ data: StatusEvent[] }>(`/shipments/${id}/history`),
    ])
      .then(([shipmentRes, historyRes]) => {
        setShipment(shipmentRes.data);
        setHistory(historyRes.data);
      })
      .catch(() => setError('Не вдалося завантажити дані відправлення'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto w-full">
        <div className="p-12 text-center text-slate-500">Завантаження...</div>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="max-w-4xl mx-auto w-full">
        <div className="p-12 text-center text-rose-500">{error || 'Відправлення не знайдено'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">

      {/* Назад */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-pine transition-colors font-medium"
      >
        <ArrowLeft size={18} />
        Назад до списку
      </button>

      {/* Заголовок */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{shipment.tracking_number}</h1>
          <p className="text-slate-500 text-sm mt-1">
            Зареєстровано {new Date(shipment.created_at).toLocaleDateString('uk-UA')}
          </p>
        </div>
        <span className={`px-4 py-2 text-sm font-bold uppercase tracking-widest rounded-xl border ${getStatusColor(shipment.status)}`}>
          {STATUS_LABELS[shipment.status] ?? shipment.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Відправник і одержувач */}
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

        {/* Деталі відправлення */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Package size={18} className="text-pine" /> Деталі
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider">Тип</p>
              <p className="font-medium text-slate-800">{TYPE_LABELS[shipment.shipment_type] ?? shipment.shipment_type}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider">Розмір</p>
              <p className="font-medium text-slate-800">{SIZE_LABELS[shipment.size_category] ?? shipment.size_category}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider">Вага</p>
              <p className="font-medium text-slate-800">{shipment.weight_kg} кг</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider">Габарити</p>
              <p className="font-medium text-slate-800">{shipment.length_cm}×{shipment.width_cm}×{shipment.height_cm} см</p>
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

        {/* Маршрут */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <MapPin size={18} className="text-pine" /> Маршрут
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex-1 text-center">
              <p className="font-bold text-slate-800">{shipment.origin_city}</p>
              <p className="text-xs text-slate-400">{shipment.origin_address}</p>
            </div>
            <div className="text-slate-300 font-bold">→</div>
            <div className="flex-1 text-center">
              <p className="font-bold text-slate-800">{shipment.dest_city}</p>
              <p className="text-xs text-slate-400">{shipment.dest_address}</p>
            </div>
          </div>
        </div>

        {/* Вартість */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <CreditCard size={18} className="text-pine" /> Вартість
          </h2>
          <div className="text-3xl font-black text-pine">
            {parseFloat(shipment.total_cost).toFixed(2)} грн
          </div>
        </div>
      </div>

      {/* Хронологія статусів */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
          <Clock size={18} className="text-pine" /> Хронологія
        </h2>
        {history.length === 0 ? (
          <p className="text-slate-400 text-sm">Немає записів</p>
        ) : (
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-100" />
            <div className="space-y-4">
              {history.map((event, i) => (
                <div key={i} className="relative flex gap-4 pl-10">
                  <div className={`absolute left-0 w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${getTimelineDot(event.status_set)}`} />
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800 text-sm">
                        {STATUS_LABELS[event.status_set] ?? event.status_set}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(event.created_at).toLocaleString('uk-UA')}
                      </span>
                    </div>
                    {event.department_city && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {event.department_city}, {event.department_address}
                      </p>
                    )}
                    {event.operator_name && (
                      <p className="text-xs text-slate-400">Оператор: {event.operator_name}</p>
                    )}
                    {event.notes && (
                      <p className="text-xs text-slate-500 italic mt-1">{event.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ShipmentDetailPage;