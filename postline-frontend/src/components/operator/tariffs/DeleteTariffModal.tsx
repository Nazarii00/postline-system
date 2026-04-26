import { useState } from "react";
import { AlertTriangle, } from "lucide-react";
import { api } from "../../../services/api";
import { type Tariff } from "../../../types/tariffs";

interface DeleteTariffModalProps {
  isOpen: boolean;
  onClose: () => void;
  tariff: Tariff;
  onSuccess: () => void;
}

const DeleteTariffModal = ({ isOpen, onClose, tariff, onSuccess }: DeleteTariffModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/tariffs/${tariff.id}`);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Не вдалося видалити тариф");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-xl overflow-hidden p-6 text-center">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} />
        </div>
        
        <h2 className="text-xl font-bold text-slate-900 mb-2">Видалити тариф?</h2>
        <p className="text-slate-500 text-sm mb-6">
          Ви дійсно хочете видалити маршрут <strong className="text-slate-800">{tariff.from} — {tariff.to}</strong>?
        </p>

        {error && <p className="text-sm text-rose-600 bg-rose-50 p-3 rounded-xl mb-4">{error}</p>}

        <div className="flex gap-3 justify-center">
          <button onClick={onClose} disabled={isLoading} className="flex-1 px-5 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
            Скасувати
          </button>
          <button onClick={handleDelete} disabled={isLoading} className="flex-1 px-5 py-3 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors disabled:opacity-70">
            {isLoading ? "Видалення..." : "Видалити"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteTariffModal;