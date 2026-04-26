import { Package, Scale, Shield } from 'lucide-react';
import { type ShipmentFormData, type Tariff } from '../../types/shipment';
import { ErrorMsg } from '../../components/ui/ErrorMsg';
import { getFieldClass, preventInvalidNumberInput, labelClass } from '../../utils/formUtils';

const TYPE_OPTIONS = [
  { value: 'parcel',  label: 'Посилка' },
  { value: 'letter',  label: 'Документи' },
  { value: 'package', label: 'Вантаж' },
];

interface Props {
  formData: ShipmentFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  errors: Record<string, string>;
  calculatedSize: string;
  maxDim: number;
  isCourier: boolean;
  setIsCourier: (val: boolean) => void;
  tariff: Tariff | null;
}

export const ParcelSection = ({ formData, onChange, errors, calculatedSize, maxDim, isCourier, setIsCourier, tariff }: Props) => {
  const hasDimError = !!(errors.length || errors.width || errors.height);

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-pine/5 text-pine rounded-2xl"><Package size={20} /></div>
        <h2 className="text-lg font-black text-slate-800">Параметри посилки</h2>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div>
            <label className={labelClass}>Тип <span className="text-rose-500">*</span></label>
            <select name="type" value={formData.type} onChange={onChange} className={getFieldClass('type', errors)}>
              {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          
          <div>
            <label className={labelClass}>Розмір (Авто)</label>
            <div className="w-full px-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-pine font-black flex items-center justify-between cursor-not-allowed">
              <span>{maxDim === 0 ? '-' : calculatedSize}</span>
              <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                {maxDim === 0 ? 'Введіть габарити' : calculatedSize === 'S' ? 'до 30 см' : calculatedSize === 'M' ? 'до 50 см' : calculatedSize === 'L' ? 'до 80 см' : '> 80 см'}
              </span>
            </div>
          </div>

          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1.5"><Scale size={14} className="text-pine" /> Вага (кг) <span className="text-rose-500">*</span></span>
            </label>
            <input type="number" step="0.1" min="0.1" name="weight" value={formData.weight} onChange={onChange} onKeyDown={preventInvalidNumberInput} placeholder="0.0" className={getFieldClass('weight', errors)} />
            <ErrorMsg field="weight" errors={errors} />
          </div>

          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1.5"><Shield size={14} className="text-pine" /> Цінність (грн)</span>
            </label>
            <input type="number" min="0" name="declaredValue" value={formData.declaredValue} onChange={onChange} onKeyDown={preventInvalidNumberInput} placeholder="0" className={getFieldClass('declaredValue', errors)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <label className={labelClass}>Габарити (см) <span className="text-rose-500">*</span></label>
            <div className={`grid grid-cols-3 gap-4 p-4 rounded-2xl border transition-all ${hasDimError ? 'bg-rose-50/50 border-rose-300' : 'bg-slate-50 border-slate-200'}`}>
              {(['length', 'width', 'height'] as const).map((dim, i) => (
                <div key={dim}>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">
                    {['Довжина', 'Ширина', 'Висота'][i]}
                  </p>
                  <input type="number" min="1" name={dim} value={formData[dim]} onChange={onChange} onKeyDown={preventInvalidNumberInput} placeholder="0"
                    className={`w-full bg-transparent border-b ${errors[dim] ? 'border-rose-400 text-rose-600' : 'border-slate-300'} focus:border-pine outline-none text-base py-1 font-bold transition-colors`}
                  />
                  <ErrorMsg field={dim} errors={errors} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-start">
            <label className="flex items-center mt-7 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer group hover:border-pine/30 transition-all h-[76px]">
              <input type="checkbox" checked={isCourier} onChange={(e) => setIsCourier(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-pine focus:ring-pine cursor-pointer accent-pine flex-shrink-0" />
              <span className="text-sm font-bold text-slate-700 group-hover:text-pine transition-colors leading-tight">
                Кур'єр до дверей<br />
                <span className="text-xs text-slate-500 font-medium">+20 грн до тарифу</span>
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className={labelClass}>Опис (необов'язково)</label>
          <textarea name="description" value={formData.description} onChange={onChange} placeholder="Короткий опис вмісту..." rows={2}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pine/20 focus:border-pine focus:bg-white transition-all text-sm font-medium resize-none"
          />
        </div>

        {errors.tariff && <p className="text-rose-500 text-sm font-bold">{errors.tariff}</p>}
        {tariff && (
          <p className="text-xs text-slate-400">
            Тариф: {tariff.city_from} → {tariff.city_to} · База: {tariff.base_price} грн + {tariff.price_per_kg} грн/кг
          </p>
        )}
      </div>
    </section>
  );
};