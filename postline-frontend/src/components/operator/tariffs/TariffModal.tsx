import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { api } from "../../../services/api";
import { type Tariff } from "../../../types/tariffs";
interface TariffModalProps {
  isOpen: boolean;
  onClose: () => void;
  tariff: Tariff | null;
  onSuccess: () => void;
}

const TariffModal = ({ isOpen, onClose, tariff, onSuccess }: TariffModalProps) => {
  const isEdit = !!tariff;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    cityFrom: "",
    cityTo: "",
    shipmentType: "Посилка",
    sizeCategory: "Середня",
    basePrice: "",
    pricePerKg: ""
  });

  useEffect(() => {
    if (tariff) {
      setFormData({
        cityFrom: tariff.from,
        cityTo: tariff.to,
        shipmentType: tariff.type,
        sizeCategory: tariff.size,
        basePrice: String(tariff.basePrice),
        pricePerKg: String(tariff.perKg)
      });
    }
  }, [tariff]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isEdit) {
        // Використовуємо patch, оскільки він є у вашому api.ts
        await api.patch(`/tariffs/${tariff.id}`, {
          basePrice: Number(formData.basePrice),
          pricePerKg: Number(formData.pricePerKg)
        });
      } else {
        await api.post('/tariffs', {
          ...formData,
          basePrice: Number(formData.basePrice),
          pricePerKg: Number(formData.pricePerKg)
        });
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Сталася помилка при збереженні");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">
            {isEdit ? "Редагувати тариф" : "Новий тариф"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-slate-50 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-sm text-rose-600 bg-rose-50 p-3 rounded-xl">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase">Звідки</label>
              <input required name="cityFrom" value={formData.cityFrom} onChange={handleChange} disabled={isEdit} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-pine focus:bg-white disabled:opacity-60" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase">Куди</label>
              <input required name="cityTo" value={formData.cityTo} onChange={handleChange} disabled={isEdit} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-pine focus:bg-white disabled:opacity-60" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase">Базова ціна (₴)</label>
              <input required type="number" name="basePrice" value={formData.basePrice} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-pine focus:bg-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase">За кг (₴)</label>
              <input required type="number" name="pricePerKg" value={formData.pricePerKg} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-pine focus:bg-white" />
            </div>
          </div>

          <div className="pt-4 flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              Скасувати
            </button>
            <button type="submit" disabled={isLoading} className="px-5 py-2.5 text-sm font-semibold text-white bg-pine hover:bg-pine/90 rounded-xl transition-colors disabled:opacity-70">
              {isLoading ? "Збереження..." : "Зберегти"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TariffModal;