import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ShipmentCostCard } from '../../components/client/shipment-detail/ShipmentCostCard';
import { ShipmentInfoCard } from '../../components/client/shipment-detail/ShipmentInfoCard';
import { ShipmentParticipantsCard } from '../../components/client/shipment-detail/ShipmentParticipantsCard';
import { ShipmentRouteCard } from '../../components/client/shipment-detail/ShipmentRouteCard';
import { ShipmentTimelineCard } from '../../components/client/shipment-detail/ShipmentTimelineCard';
import type { ShipmentDetail, StatusEvent } from '../../components/client/shipment-detail/shipmentDetailTypes';
import { getStatusColor, STATUS_LABELS } from '../../components/client/shipment-detail/shipmentDetailUtils';
import { api } from '../../services/api';

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
        <div className="p-12 text-center text-rose-500">
          {error || 'Відправлення не знайдено'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-pine transition-colors font-medium"
      >
        <ArrowLeft size={18} />
        Назад до списку
      </button>

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
        <ShipmentParticipantsCard shipment={shipment} />
        <ShipmentInfoCard shipment={shipment} />
        <ShipmentRouteCard shipment={shipment} />
        <ShipmentCostCard shipment={shipment} />
      </div>

      <ShipmentTimelineCard history={history} />
    </div>
  );
};

export default ShipmentDetailPage;
