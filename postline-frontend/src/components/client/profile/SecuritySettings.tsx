import React from 'react';
import { Shield } from 'lucide-react';

export const SecuritySettings: React.FC = () => {
  return (
    <div className="bg-white/90 backdrop-blur p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
      <div className="flex gap-4 items-center">
        <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center shrink-0">
          <Shield size={24} />
        </div>
        <div>
          <h3 className="text-base font-black text-slate-900">Безпека акаунту</h3>
          <p className="text-sm text-slate-500 mt-1">Останній вхід: сьогодні</p>
        </div>
      </div>
      <button 
        type="button"
        className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-2xl hover:bg-slate-50 transition-colors active:scale-95 shadow-sm"
      >
        Змінити пароль
      </button>
    </div>
  );
};