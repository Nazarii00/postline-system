import { useMemo, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { type Branch } from '../../types/branches';

interface Props {
  branches: Branch[];
  isLoading?: boolean;
  error?: string | null;
}

const getMarkerPosition = (branch: Branch, index: number) => {
  const seed = branch.id * 31 + index * 17;
  return {
    left: 14 + (seed % 70),
    top: 16 + ((seed * 7) % 64),
  };
};

export const BranchesMap = ({ branches, isLoading, error }: Props) => {
  const [zoom, setZoom] = useState(1);
  const visibleBranches = branches.slice(0, 18);

  const cities = useMemo(
    () => Array.from(new Set(branches.map((branch) => branch.city))).slice(0, 4),
    [branches]
  );

  if (isLoading) {
    return (
      <div className="flex-1 bg-slate-200 rounded-3xl border border-slate-200 shadow-inner min-h-[400px] animate-pulse" />
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-white rounded-3xl border border-rose-100 shadow-sm min-h-[400px] flex items-center justify-center p-10 text-center">
        <div>
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin size={28} />
          </div>
          <h3 className="text-xl font-black text-slate-900">Карту не вдалося побудувати</h3>
          <p className="text-slate-500 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#dfe8df] rounded-3xl border border-slate-200 shadow-inner relative overflow-hidden min-h-[400px] hover:border-slate-300 transition-all">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(26,54,45,0.18),transparent_22%),radial-gradient(circle_at_78%_30%,rgba(34,197,94,0.12),transparent_18%),linear-gradient(135deg,rgba(255,255,255,0.55),rgba(148,163,184,0.18))]" />
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)', backgroundSize: `${42 / zoom}px ${42 / zoom}px` }}
      />

      <div className="absolute inset-8 rounded-[2rem] border border-white/70 bg-white/20 backdrop-blur-[1px] overflow-hidden">
        <div
          className="absolute inset-0 transition-transform duration-300"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
        >
          <div className="absolute left-[8%] top-[35%] h-4 w-[84%] rounded-full bg-white/50 rotate-[-8deg]" />
          <div className="absolute left-[18%] top-[12%] h-[78%] w-4 rounded-full bg-white/40 rotate-[18deg]" />
          <div className="absolute left-[28%] top-[68%] h-3 w-[58%] rounded-full bg-white/50 rotate-[11deg]" />

          {visibleBranches.map((branch, index) => {
            const position = getMarkerPosition(branch, index);
            return (
              <div
                key={branch.id}
                className="absolute -translate-x-1/2 -translate-y-full group"
                style={{ left: `${position.left}%`, top: `${position.top}%` }}
              >
                <div className={`relative flex items-center justify-center w-9 h-9 rounded-2xl shadow-lg border-2 border-white transition-transform group-hover:scale-110 ${
                  branch.openNow ? 'bg-pine text-white' : 'bg-slate-500 text-white'
                }`}>
                  <MapPin size={19} fill="currentColor" />
                  {branch.openNow && (
                    <span className="absolute -right-1 -top-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="absolute left-1/2 top-10 -translate-x-1/2 w-56 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-30">
                  <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4">
                    <p className="text-xs font-black text-pine uppercase tracking-wider">Відділення {branch.number}</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{branch.city}</p>
                    <p className="text-xs text-slate-500 mt-1">{branch.address}</p>
                    <p className="text-[11px] font-bold text-slate-400 mt-2">{branch.schedule}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute left-6 top-6 z-20 bg-white/90 backdrop-blur rounded-3xl shadow-lg border border-white/60 p-5 max-w-sm">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Мережа PostLine</p>
        <h3 className="text-2xl font-black text-slate-900 mt-1">
          {branches.length > 0 ? `${branches.length} точок на мапі` : 'Відділень не знайдено'}
        </h3>
        <p className="text-sm text-slate-500 mt-2">
          {branches.length > 0
            ? `Показано відфільтровані відділення${cities.length ? `: ${cities.join(', ')}` : ''}.`
            : 'Змініть пошук зліва, щоб побачити доступні точки.'}
        </p>
      </div>

      <div className="absolute right-6 bottom-6 flex flex-col gap-2 z-20">
        <button
          onClick={() => setZoom((value) => Math.min(1.4, value + 0.2))}
          className="w-12 h-12 bg-white/90 backdrop-blur rounded-2xl shadow-md flex items-center justify-center text-slate-700 hover:text-pine hover:bg-white transition-all font-bold text-xl"
        >
          +
        </button>
        <button
          onClick={() => setZoom((value) => Math.max(0.8, value - 0.2))}
          className="w-12 h-12 bg-white/90 backdrop-blur rounded-2xl shadow-md flex items-center justify-center text-slate-700 hover:text-pine hover:bg-white transition-all font-bold text-xl"
        >
          -
        </button>
        <button
          onClick={() => setZoom(1)}
          className="w-12 h-12 bg-white/90 backdrop-blur rounded-2xl shadow-md flex items-center justify-center text-slate-700 hover:text-pine hover:bg-white transition-all mt-2"
          title="Скинути масштаб"
        >
          <Navigation size={20} />
        </button>
      </div>

      {visibleBranches.length === 18 && branches.length > visibleBranches.length && (
        <div className="absolute left-6 bottom-6 z-20 bg-white/90 backdrop-blur rounded-2xl shadow-md border border-white/60 px-4 py-3 text-xs font-bold text-slate-500">
          Ще {branches.length - visibleBranches.length} точок доступні у списку зліва
        </div>
      )}
    </div>
  );
};
