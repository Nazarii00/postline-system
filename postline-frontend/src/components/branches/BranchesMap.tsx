import { MapPin, Navigation } from 'lucide-react';

export const BranchesMap = () => (
  <div className="flex-1 bg-slate-200 rounded-3xl border border-slate-200 shadow-inner relative overflow-hidden flex items-center justify-center min-h-[400px] hover:border-slate-300 transition-all">
    <div 
      className="absolute inset-0 opacity-20 pointer-events-none"
      style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #94a3b8 1px, transparent 0)', backgroundSize: '32px 32px' }} 
    />

    <div className="absolute right-6 bottom-6 flex flex-col gap-2 z-20">
      <button className="w-12 h-12 bg-white/80 backdrop-blur rounded-2xl shadow-md flex items-center justify-center text-slate-700 hover:text-pine hover:bg-white transition-all font-bold text-xl">+</button>
      <button className="w-12 h-12 bg-white/80 backdrop-blur rounded-2xl shadow-md flex items-center justify-center text-slate-700 hover:text-pine hover:bg-white transition-all font-bold text-xl">−</button>
      <button className="w-12 h-12 bg-white/80 backdrop-blur rounded-2xl shadow-md flex items-center justify-center text-slate-700 hover:text-pine hover:bg-white transition-all mt-2">
        <Navigation size={20} />
      </button>
    </div>

    <div className="text-center z-10 p-10 max-w-md bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50">
      <div className="w-24 h-24 bg-pine/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <MapPin size={48} className="text-pine" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-3">Інтерактивна карта простору</h3>
      <p className="text-slate-500 text-base mb-8 leading-relaxed">
        Тут буде підключено Google Maps або Mapbox API. Маркери автоматично фільтруватимуться відповідно до списку зліва.
      </p>
      <button className="flex items-center justify-center gap-2 w-full py-3.5 bg-pine text-white font-bold rounded-2xl hover:bg-pine/90 active:scale-95 transition-all shadow-lg hover:shadow-xl">
        Завантажити карту
      </button>
    </div>
  </div>
);