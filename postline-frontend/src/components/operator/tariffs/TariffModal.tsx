import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { api } from "../../../services/api";
import { type Tariff } from "../../../types/tariffs";
import {
  INPUT_LIMITS,
  INPUT_PATTERNS,
  preventInvalidNumberInput,
  sanitizeCity,
} from "../../../utils/formUtils";

const SHIPMENT_TYPE_OPTIONS = [
  { value: "parcel", label: "Посилка" },
  { value: "letter", label: "Документи" },
  { value: "package", label: "Вантаж" },
];

const SIZE_OPTIONS = ["S", "M", "L", "XL"];

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
    shipmentType: "parcel",
    sizeCategory: "M",
    basePrice: "",
    pricePerKg: "",
    courierBaseFee: "",
    courierFeePerKg: "",
  });

  useEffect(() => {
    if (tariff) {
      setFormData({
        cityFrom: tariff.from,
        cityTo: tariff.to,
        shipmentType: tariff.type,
        sizeCategory: tariff.size,
        basePrice: String(tariff.basePrice),
        pricePerKg: String(tariff.perKg),
        courierBaseFee: String(tariff.courierBaseFee),
        courierFeePerKg: String(tariff.courierPerKg),
      });
    } else {
      setFormData({
        cityFrom: "",
        cityTo: "",
        shipmentType: "parcel",
        sizeCategory: "M",
        basePrice: "",
        pricePerKg: "",
        courierBaseFee: "",
        courierFeePerKg: "",
      });
    }
  }, [tariff]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const nextValue = name === "cityFrom" || name === "cityTo" ? sanitizeCity(value) : value;
    setFormData(prev => ({ ...prev, [name]: nextValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const moneyValues = [
      formData.basePrice,
      formData.pricePerKg,
      formData.courierBaseFee,
      formData.courierFeePerKg,
    ].map(Number);

    if (
      (!isEdit && (!new RegExp(INPUT_PATTERNS.city).test(formData.cityFrom) || !new RegExp(INPUT_PATTERNS.city).test(formData.cityTo)))
      || moneyValues.some((value) => Number.isNaN(value) || value < 0 || value > INPUT_LIMITS.moneyMax)
    ) {
      setError("Перевірте міста та ціни: міста мають містити лише літери, ціни від 0 до 100000.");
      setIsLoading(false);
      return;
    }

    try {
      if (isEdit) {
        // Використовуємо patch, оскільки він є у вашому api.ts
        await api.patch(`/tariffs/${tariff.id}`, {
          basePrice: Number(formData.basePrice),
          pricePerKg: Number(formData.pricePerKg),
          courierBaseFee: Number(formData.courierBaseFee),
          courierFeePerKg: Number(formData.courierFeePerKg),
        });
      } else {
        await api.post('/tariffs', {
          ...formData,
          basePrice: Number(formData.basePrice),
          pricePerKg: Number(formData.pricePerKg),
          courierBaseFee: Number(formData.courierBaseFee),
          courierFeePerKg: Number(formData.courierFeePerKg),
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
              <input required name="cityFrom" value={formData.cityFrom} onChange={handleChange} disabled={isEdit} minLength={INPUT_LIMITS.cityMin} maxLength={INPUT_LIMITS.cityMax} pattern={INPUT_PATTERNS.city} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-pine focus:bg-white disabled:opacity-60" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase">Куди</label>
              <input required name="cityTo" value={formData.cityTo} onChange={handleChange} disabled={isEdit} minLength={INPUT_LIMITS.cityMin} maxLength={INPUT_LIMITS.cityMax} pattern={INPUT_PATTERNS.city} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-pine focus:bg-white disabled:opacity-60" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase">Тип</label>
              <select
                required
                name="shipmentType"
                value={formData.shipmentType}
                onChange={handleChange}
                disabled={isEdit}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-pine focus:bg-white disabled:opacity-60"
              >
                {SHIPMENT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase">Розмір</label>
              <select
                required
                name="sizeCategory"
                value={formData.sizeCategory}
                onChange={handleChange}
                disabled={isEdit}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-pine focus:bg-white disabled:opacity-60"
              >
                {SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase">Базова ціна (₴)</label>
              <input required type="number" min="0" max={INPUT_LIMITS.moneyMax} step="0.01" name="basePrice" value={formData.basePrice} onChange={handleChange} onKeyDown={preventInvalidNumberInput} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-pine focus:bg-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase">За кг (₴)</label>
              <input required type="number" min="0" max={INPUT_LIMITS.moneyMax} step="0.01" name="pricePerKg" value={formData.pricePerKg} onChange={handleChange} onKeyDown={preventInvalidNumberInput} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-pine focus:bg-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase">Кур'єр базово (₴)</label>
              <input required type="number" min="0" max={INPUT_LIMITS.moneyMax} step="0.01" name="courierBaseFee" value={formData.courierBaseFee} onChange={handleChange} onKeyDown={preventInvalidNumberInput} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-pine focus:bg-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase">Кур'єр за кг (₴)</label>
              <input required type="number" min="0" max={INPUT_LIMITS.moneyMax} step="0.01" name="courierFeePerKg" value={formData.courierFeePerKg} onChange={handleChange} onKeyDown={preventInvalidNumberInput} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-pine focus:bg-white" />
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
