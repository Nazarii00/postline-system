import { useEffect, useState } from "react";
import { api } from "../../services/api";
import StatsGrid from "../../components/admin/overview/StatsGrid";
import ActivityFeed, { type ActivityItem } from "../../components/admin/overview/ActivityFeed";
import QuickActions from "../../components/admin/overview/QuickActions";
import NetworkStatus, { type Department } from "../../components/admin/overview/NetworkStatus";

type Stats = {
  total: number;
  in_transit: number;
  operators: number;
  departments: number;
};

const OverviewPage = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ data: { id: number; status: string }[] }>("/shipments"),
      api.get<{ data: { id: number; role: string }[] }>("/operators"),
      api.get<{ data: Department[] }>("/departments"),
      api.get<{ data: ActivityItem[] }>("/shipments/activity"),
    ])
      .then(([shipmentsRes, operatorsRes, deptsRes, activityRes]) => {
        const shipments = shipmentsRes.data;
        setStats({
          total: shipments.length,
          in_transit: shipments.filter((s) => s.status === "in_transit").length,
          operators: operatorsRes.data.length,
          departments: deptsRes.data.filter((d) => !d.deleted_at).length,
        });
        setDepartments(deptsRes.data.filter((d) => !d.deleted_at).slice(0, 4));
        setActivity(activityRes.data.slice(0, 5));
      })
      .catch(() => {
        Promise.all([
          api.get<{ data: { id: number; status: string }[] }>("/shipments"),
          api.get<{ data: { id: number; role: string }[] }>("/operators"),
          api.get<{ data: Department[] }>("/departments"),
        ])
          .then(([shipmentsRes, operatorsRes, deptsRes]) => {
            const shipments = shipmentsRes.data;
            setStats({
              total: shipments.length,
              in_transit: shipments.filter((s) => s.status === "in_transit").length,
              operators: operatorsRes.data.length,
              departments: deptsRes.data.filter((d) => !d.deleted_at).length,
            });
            setDepartments(
              deptsRes.data.filter((d) => !d.deleted_at).slice(0, 4)
            );
          })
          .catch(() => {});
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="max-w-7xl mx-auto w-full px-6 md:px-10 py-10 space-y-8">
        <div className="space-y-3 min-h-[104px] flex flex-col justify-end">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Огляд системи
          </h1>
          <p className="text-lg text-slate-500">
            Ключові показники, активність і стан мережі PostLine.
          </p>
        </div>

        <StatsGrid stats={stats} isLoading={isLoading} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <ActivityFeed activity={activity} isLoading={isLoading} />

          <div className="space-y-5">
            <QuickActions />
            <NetworkStatus departments={departments} isLoading={isLoading} />
          </div>
        </div>
      </section>
    </main>
  );
};

export default OverviewPage;
