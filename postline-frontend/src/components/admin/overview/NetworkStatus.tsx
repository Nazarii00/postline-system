import { MapPin } from "lucide-react";

export type Department = {
  id: number;
  city: string;
  address: string;
  deleted_at: string | null;
};

type NetworkStatusProps = {
  departments: Department[];
  isLoading: boolean;
};

const NetworkStatus = ({ departments, isLoading }: NetworkStatusProps) => {
  return (
    <article className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <MapPin size={18} className="text-pine" /> Стан мережі
      </h3>

      {isLoading ? (
        <div className="space-y-3 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-6 bg-slate-50 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          {departments.map((d) => (
            <div key={d.id} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">
                {d.city} — {d.address}
              </span>
              <span className="text-pine font-semibold">Онлайн</span>
            </div>
          ))}
          {departments.length === 0 && (
            <p className="text-sm text-slate-400">Відділень не знайдено</p>
          )}
        </div>
      )}
    </article>
  );
};

export default NetworkStatus;