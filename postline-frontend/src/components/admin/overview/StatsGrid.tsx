import { MapPin, Package, TrendingUp, Users } from "lucide-react";

type Stats = {
  total: number;
  in_transit: number;
  operators: number;
  departments: number;
};

type StatCard = {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
};

type StatsGridProps = {
  stats: Stats | null;
  isLoading: boolean;
};

const StatsGrid = ({ stats, isLoading }: StatsGridProps) => {
  const statCards: StatCard[] = stats
    ? [
        {
          title: "Всього відправлень",
          value: stats.total.toLocaleString("uk-UA"),
          description: "За весь час",
          icon: <Package size={20} className="text-pine" />,
        },
        {
          title: "Активних у дорозі",
          value: stats.in_transit.toLocaleString("uk-UA"),
          description: "Зараз в транзиті",
          icon: <TrendingUp size={20} className="text-pine" />,
        },
        {
          title: "Операторів у системі",
          value: stats.operators.toLocaleString("uk-UA"),
          description: "Активних співробітників",
          icon: <Users size={20} className="text-pine" />,
        },
        {
          title: "Відділень",
          value: stats.departments.toLocaleString("uk-UA"),
          description: "Активних у мережі",
          icon: <MapPin size={20} className="text-pine" />,
        },
      ]
    : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {isLoading
        ? Array.from({ length: 4 }).map((_, i) => (
            <article
              key={i}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm min-h-[190px] animate-pulse"
            >
              <div className="w-11 h-11 rounded-xl bg-slate-100 mb-4" />
              <div className="h-4 bg-slate-100 rounded w-2/3 mb-3" />
              <div className="h-8 bg-slate-100 rounded w-1/2" />
            </article>
          ))
        : statCards.map((stat) => (
            <article
              key={stat.title}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm min-h-[190px] flex flex-col"
            >
              <div className="w-11 h-11 rounded-xl bg-pine/10 flex items-center justify-center mb-4">
                {stat.icon}
              </div>
              <p className="text-sm text-slate-500">{stat.title}</p>
              <p className="text-4xl font-black text-slate-900 tracking-tight mt-2">
                {stat.value}
              </p>
              <p className="text-sm text-slate-500 mt-auto pt-2">
                {stat.description}
              </p>
            </article>
          ))}
    </div>
  );
};

export default StatsGrid;