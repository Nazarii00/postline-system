import { useState, type FormEvent } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { ShipmentSearchCard } from '../../components/operator/status-change/ShipmentSearchCard';
import { StatusSessionHistory } from '../../components/operator/status-change/StatusSessionHistory';
import { StatusUpdateCard } from '../../components/operator/status-change/StatusUpdateCard';
import type { Shipment, StatusHistoryItem } from '../../components/operator/status-change/statusChangeTypes';
import {
  canApplyStatusInDepartment,
  getStatusActionLabel,
  getWorkflowStatuses,
} from '../../components/operator/status-change/statusChangeUtils';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const StatusChangePage = () => {
  const user = useAuthStore((state) => state.user);
  const [trackingInput, setTrackingInput] = useState('');
  const [scannedShipment, setScannedShipment] = useState<Shipment | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<StatusHistoryItem[]>([]);

  const handleSearch = async (event?: FormEvent) => {
    event?.preventDefault();
    setError(null);
    setSuccess(null);
    setNewStatus('');
    setNotes('');

    const tracking = trackingInput.trim().toUpperCase();
    if (!tracking) return;

    setIsLoading(true);
    try {
      const res = await api.get<{ data: Shipment[] }>(`/shipments?trackingNumber=${tracking}`);
      const shipment = res.data[0];

      if (!shipment) {
        setScannedShipment(null);
        setError('Відправлення з таким трекінг-номером не знайдено.');
        return;
      }

      setScannedShipment(shipment);
      setTrackingInput('');
    } catch {
      setError('Помилка при пошуку відправлення.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyStatus = async () => {
    if (!scannedShipment || !newStatus) return;

    setIsLoading(true);
    try {
      await api.patch(`/shipments/${scannedShipment.id}/status`, {
        status: newStatus,
        notes: notes || undefined,
      });

      const timeString = new Date().toLocaleTimeString('uk-UA', {
        hour: '2-digit',
        minute: '2-digit',
      });

      setHistory((prev) => [
        { tracking_number: scannedShipment.tracking_number, newStatus, time: timeString },
        ...prev,
      ]);

      setSuccess(`Статус ${scannedShipment.tracking_number} успішно оновлено: "${getStatusActionLabel(scannedShipment, newStatus)}".`);
      setScannedShipment(null);
      setNewStatus('');
      setNotes('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Помилка при зміні статусу.');
    } finally {
      setIsLoading(false);
    }
  };

  const workflowStatuses = scannedShipment ? getWorkflowStatuses(scannedShipment) : [];
  const availableStatuses = scannedShipment
    ? workflowStatuses.filter((status) =>
      canApplyStatusInDepartment(scannedShipment, status, user?.departmentId)
    )
    : [];

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 pb-10">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
          Управління статусами
        </h1>
        <p className="text-slate-500 text-sm md:text-base mt-2">
          Швидке оновлення стану відправлень за допомогою сканера або ручного вводу.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <ShipmentSearchCard
            trackingInput={trackingInput}
            isLoading={isLoading}
            onTrackingInputChange={setTrackingInput}
            onSearch={handleSearch}
          />

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3">
              <AlertCircle size={20} className="text-rose-500 shrink-0" />
              <p className="text-sm font-bold text-rose-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
              <p className="text-sm font-bold text-emerald-800">{success}</p>
            </div>
          )}

          {scannedShipment && (
            <StatusUpdateCard
              shipment={scannedShipment}
              availableStatuses={availableStatuses}
              workflowStatuses={workflowStatuses}
              newStatus={newStatus}
              notes={notes}
              isLoading={isLoading}
              onNewStatusChange={setNewStatus}
              onNotesChange={setNotes}
              onApplyStatus={handleApplyStatus}
              onClose={() => setScannedShipment(null)}
            />
          )}
        </div>

        <div className="lg:col-span-4">
          <StatusSessionHistory history={history} />
        </div>
      </div>
    </div>
  );
};

export default StatusChangePage;
