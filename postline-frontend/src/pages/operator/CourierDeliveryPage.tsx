import { useState, useEffect } from 'react';
import { MapPin, Phone, UserCheck, X } from 'lucide-react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

type Shipment = {
  id: number;
  tracking_number: string;
  status: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  dest_city: string;
};

type Courier = {
  id: number;
  full_name: string;
  phone: string;
  role: string;
};

type CourierDelivery = {
  id: number;
  shipment_id: number;
  courier_id: number | null;
  status: string;
  to_address: string;
  tracking_number: string;
  receiver_name: string;
  receiver_phone: string;
  courier_name: string | null;
};

const CourierDeliveryPage = () => {
  const user = useAuthStore((state) => state.user);

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [deliveries, setDeliveries] = useState<CourierDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Модальне вікно призначення.
  const [assigningShipment, setAssigningShipment] = useState<Shipment | null>(null);
  const [selectedCourier, setSelectedCourier] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<{ data: Shipment[] }>('/shipments?status=ready_for_pickup'),
      api.get<{ data: Courier[] }>(`/operators?departmentId=${user?.departmentId}`),
    ])
      .then(([shipmentsRes, couriersRes]) => {
        setShipments(shipmentsRes.data);
        setCouriers(couriersRes.data.filter((c) => c.role === 'courier'));
      })
      .catch(() => setError('Не вдалося завантажити дані'))
      .finally(() => setIsLoading(false));
  }, [user]);

  // Завантажити активні доставки.
  useEffect(() => {
    api.get<{ data: CourierDelivery[] }>('/courier-deliveries?status=assigned')
      .then((res) => setDeliveries(res.data))
      .catch(() => {});
  }, []);

  const handleAssign = async () => {
    if (!assigningShipment || !selectedCourier || !toAddress) return;
    setIsSubmitting(true);

    try {
      await api.post('/courier-deliveries', {
        shipmentId: assigningShipment.id,
        courierId: Number(selectedCourier),
        toAddress,
      });

      setShipments((prev) => prev.filter((s) => s.id !== assigningShipment.id));
      setAssigningShipment(null);
      setSelectedCourier('');
      setToAddress('');

      const res = await api.get<{ data: CourierDelivery[] }>('/courier-deliveries?status=assigned');
      setDeliveries(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Помилка при призначенні кур'єра");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (
    deliveryId: number,
    status: 'delivered' | 'failed',
    failureReason?: string
  ) => {
    try {
      await api.patch(`/courier-deliveries/${deliveryId}/status`, {
        status,
        failureReason: failureReason || null,
      });
      const res = await api.get<{ data: CourierDelivery[] }>('/courier-deliveries?status=assigned');
      setDeliveries(res.data);
    } catch {
      setError('Помилка при оновленні статусу');
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Кур'єрська доставка
          </h1>
          <p className="text-slate-500 text-base mt-2">
            Завдання на адресну доставку з вашого відділення
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl font-medium">
          {error}
        </div>
      )}

      <div>
        <h2 className="text-lg font-black text-slate-700 mb-4">
          Готові до кур'єрської доставки
        </h2>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Завантаження...</div>
        ) : shipments.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 font-medium">
            Немає відправлень, готових до кур'єрської доставки
          </div>
        ) : (
          <div className="space-y-4">
            {shipments.map((shipment) => (
              <div
                key={shipment.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-bold text-slate-900 text-lg">{shipment.tracking_number}</span>
                    <span className="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-600">
                      Готове до видачі
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-700 flex items-start gap-2 font-medium">
                      <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                      {shipment.dest_city}
                    </p>
                    <p className="text-sm text-slate-700 flex items-center gap-2 font-medium">
                      <Phone size={16} className="text-slate-400 shrink-0" />
                      {shipment.receiver_phone}
                      <span className="text-slate-500 font-normal">({shipment.receiver_name})</span>
                    </p>
                  </div>
                </div>

                <div className="shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                  <button
                    onClick={() => {
                      setAssigningShipment(shipment);
                      setToAddress(shipment.receiver_address || '');
                    }}
                    className="w-full md:w-auto px-6 py-3 bg-pine text-white rounded-2xl text-sm font-bold hover:bg-pine/90 active:scale-95 transition-all shadow-lg"
                  >
                    Призначити кур'єра
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deliveries.length > 0 && (
        <div>
          <h2 className="text-lg font-black text-slate-700 mb-4">Активні доставки</h2>
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-bold text-slate-900">{delivery.tracking_number}</span>
                    <span className="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase bg-amber-100 text-amber-600">
                      В дорозі
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 flex items-start gap-2">
                    <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                    {delivery.to_address}
                  </p>
                  {delivery.courier_name && (
                    <p className="text-sm text-slate-600 flex items-center gap-2 mt-2 font-medium">
                      <UserCheck size={16} className="text-emerald-500" />
                      {delivery.courier_name}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleUpdateStatus(delivery.id, 'delivered')}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all"
                  >
                    Вручено
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(delivery.id, 'failed', 'Клієнта немає на місці')}
                    className="px-4 py-2 bg-rose-100 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-200 transition-all"
                  >
                    Невдача
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {assigningShipment && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-800">Призначити кур'єра</h3>
              <button
                onClick={() => setAssigningShipment(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Відправлення</p>
                <p className="font-bold text-pine">{assigningShipment.tracking_number}</p>
                <p className="text-sm text-slate-600">{assigningShipment.receiver_name}</p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 font-black mb-2">
                  Кур'єр <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedCourier}
                  onChange={(e) => setSelectedCourier(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine text-sm font-medium"
                >
                  <option value="">Оберіть кур'єра...</option>
                  {couriers.map((c) => (
                    <option key={c.id} value={c.id}>{c.full_name} В· {c.phone}</option>
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
                  onChange={(e) => setToAddress(e.target.value)}
                  placeholder="вул. Шевченка 1, кв. 5"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine text-sm font-medium"
                />
              </div>

              <button
                onClick={handleAssign}
                disabled={!selectedCourier || !toAddress || isSubmitting}
                className="w-full py-4 bg-pine text-white font-black rounded-2xl hover:bg-pine/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Збереження...' : 'Призначити'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourierDeliveryPage;
