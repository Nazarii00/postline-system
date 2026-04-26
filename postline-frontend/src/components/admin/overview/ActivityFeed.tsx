import { Clock3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export type ActivityItem = {
  tracking_number: string;
  status_set: string;
  operator_name: string | null;
  created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  accepted: "Прийнято",
  sorting: "На сортуванні",
  in_transit: "В дорозі",
  arrived: "У відділенні",
  ready_for_pickup: "Готове до видачі",
  delivered: "Доставлено",
  returned: "Повернуто",
  cancelled: "Скасовано",
};

type ActivityFeedProps = {
  activity: ActivityItem[];
  isLoading: boolean;
};

const ActivityFeed = ({ activity, isLoading }: ActivityFeedProps) => {
  const navigate = useNavigate();

  return (
    <article className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Clock3 size={18} className="text-pine" /> Остання активність
        </h2>
        <button
          onClick={() => navigate("/admin/shipments")}
          className="text-sm font-semibold text-pine hover:text-pine/80 transition-colors"
        >
          Відкрити реєстр
        </button>
      </div>

      {isLoading ? (
        <div className="p-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 bg-slate-50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : activity.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {activity.map((item, i) => (
            <div key={i} className="p-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {item.tracking_number}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Статус змінено на «
                  {STATUS_LABELS[item.status_set] ?? item.status_set}»
                </p>
                {item.operator_name && (
                  <p className="text-xs text-slate-500 mt-1">
                    {item.operator_name}
                  </p>
                )}
              </div>
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                {new Date(item.created_at).toLocaleTimeString("uk-UA", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-sm text-slate-500 text-center">
          Поки що немає нових подій.
        </div>
      )}
    </article>
  );
};

export default ActivityFeed;