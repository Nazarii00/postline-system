import { RefreshCcw, ArrowRight } from 'lucide-react';

interface Props {
  basePrice: number;
  weightSurcharge: number;
  courierPrice: number;
  insurance: number;
  totalPrice: number;
  isSubmitting: boolean;
}

export const CheckoutFooter = ({ basePrice, weightSurcharge, courierPrice, insurance, totalPrice, isSubmitting }: Props) => (
  <div className="bg-pine rounded-3xl p-6 md:p-8 text-white shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
    <div className="w-full lg:w-auto flex-1 flex flex-wrap gap-x-10 gap-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-white/60 font-bold mb-1.5">Базовий тариф</p>
        <p className="text-lg font-black">{basePrice.toFixed(2)} <span className="text-sm font-medium text-white/70">грн</span></p>
      </div>
      {weightSurcharge > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-white/60 font-bold mb-1.5">За вагу</p>
          <p className="text-lg font-black">+{weightSurcharge.toFixed(2)} <span className="text-sm font-medium text-white/70">грн</span></p>
        </div>
      )}
      {courierPrice > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-emerald-400/80 font-bold mb-1.5">Кур'єр</p>
          <p className="text-lg font-black text-emerald-400">+{courierPrice.toFixed(2)} <span className="text-sm font-medium text-emerald-400/70">грн</span></p>
        </div>
      )}
      {insurance > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-white/60 font-bold mb-1.5">Страховка</p>
          <p className="text-lg font-black">+{insurance} <span className="text-sm font-medium text-white/70">грн</span></p>
        </div>
      )}
    </div>

    <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-6 lg:border-l lg:border-white/10 lg:pl-10">
      <div className="text-center sm:text-right w-full sm:w-auto">
        <p className="text-xs uppercase tracking-widest text-white/60 font-bold mb-1">Загальна сума</p>
        <p className="text-4xl font-black tracking-tight">
          {totalPrice.toFixed(2)} <span className="text-xl font-bold text-white/70">грн</span>
        </p>
      </div>
      <button type="submit" disabled={isSubmitting} className={`w-full sm:w-auto px-8 py-4 bg-white text-pine font-black rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 whitespace-nowrap ${isSubmitting ? 'opacity-80 cursor-wait' : 'hover:bg-slate-50 active:scale-95'}`}>
        {isSubmitting ? <RefreshCcw size={20} className="animate-spin text-pine" /> : <ArrowRight size={20} className="text-pine" />}
        {isSubmitting ? 'ОБРОБКА...' : 'СТВОРИТИ ТТН'}
      </button>
    </div>
  </div>
);
