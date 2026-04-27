import { CheckCircle2 } from 'lucide-react';
import { type TariffPlan } from '../../types/tariffs';

interface Props {
  plan: TariffPlan;
}

export const TariffCard = ({ plan }: Props) => {
  const isPopular = plan.popular;

  return (
    <div className={`relative flex flex-col p-6 md:p-8 rounded-3xl border shadow-sm transition-all hover:-translate-y-1 ${
      isPopular 
        ? 'bg-pine text-white border-pine shadow-xl shadow-pine/20' 
        : 'bg-white/80 backdrop-blur text-slate-900 border-slate-200 hover:shadow-lg hover:border-slate-300'
    }`}>
      {isPopular && (
        <div className="absolute -top-4 left-8 bg-amber-400 text-amber-900 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md">
          Найпопулярніший
        </div>
      )}

      <div className="flex items-center gap-4 mb-5">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
          isPopular ? 'bg-white/20 text-white' : 'bg-slate-50 text-pine border border-slate-100'
        }`}>
          {plan.icon}
        </div>
        <div>
          <h3 className={`text-xl font-bold ${isPopular ? 'text-white' : 'text-slate-900'}`}>
            {plan.title}
          </h3>
        </div>
      </div>

      <p className={`text-base mb-6 min-h-[48px] ${isPopular ? 'text-white/90' : 'text-slate-500'}`}>
        {plan.description}
      </p>

      <div className={`mb-8 pb-8 border-b ${isPopular ? 'border-white/20' : 'border-slate-100'}`}>
        <span className="text-4xl font-black tracking-tight">{plan.price}</span>
      </div>

      <ul className="space-y-3.5 mb-8 flex-1">
        {plan.features.map((feature, i) => (
          <li key={i} className={`flex items-start gap-3 text-sm font-semibold ${
            isPopular ? 'text-white/95' : 'text-slate-700'
          }`}>
            <CheckCircle2 size={20} className={`shrink-0 mt-0.5 ${isPopular ? 'text-amber-400' : 'text-pine'}`} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <a href="#calculator" className={`w-full py-3.5 mt-auto rounded-2xl font-bold transition-all text-base active:scale-95 text-center ${
        isPopular 
          ? 'bg-white text-pine hover:bg-slate-50 shadow-lg' 
          : 'bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
      }`}>
        Розрахувати тариф
      </a>
    </div>
  );
};
