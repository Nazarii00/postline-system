import { CheckCircle, RefreshCcw } from 'lucide-react';

interface Props {
  tracking: string;
  onReset: () => void;
}

export const SuccessView = ({ tracking, onReset }: Props) => (
  <div className="max-w-2xl mx-auto w-full mt-10">
    <div className="bg-white/80 backdrop-blur rounded-3xl border border-slate-200 shadow-sm p-10 text-center">
      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
        <CheckCircle size={40} className="text-emerald-500" />
      </div>
      <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Відправлення зареєстровано</h2>
      <p className="text-slate-500 text-base mb-8">Дані успішно внесено в базу. Ваш трекінг-номер:</p>
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 mb-10 inline-block">
        <p className="text-xs uppercase tracking-wider text-slate-400 font-black mb-2">Трекінг-номер</p>
        <p className="text-4xl font-black text-pine tracking-tight">{tracking}</p>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button onClick={onReset} className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-pine hover:bg-pine/90 text-white font-bold rounded-2xl shadow-sm transition-all text-sm">
          <RefreshCcw size={18} /> Нова реєстрація
        </button>
      </div>
    </div>
  </div>
);
