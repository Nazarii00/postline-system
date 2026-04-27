import { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { BranchesHeader } from '../../components/branches/BranchesHeader';
import { BranchSidebar } from '../../components/branches/BranchSidebar';
import { BranchesMap } from '../../components/branches/BranchesMap';
import type { Branch } from '../../types/branches';
import type { Department } from '../../types/departments';
import { getBranchCoordinates } from '../../utils/branchCoordinates';

const TYPE_LABELS: Record<string, string> = {
  branch: 'Відділення',
  post_office: 'Відділення',
  sorting_center: 'Сортувальний центр',
  postomat: 'Поштомат',
  pickup_point: 'Поштомат',
};

const formatSchedule = (department: Department) => {
  if (!department.opening_time || !department.closing_time) {
    return 'Графік уточнюється';
  }

  return `Щодня, ${department.opening_time.slice(0, 5)} - ${department.closing_time.slice(0, 5)}`;
};

const isOpenNow = (department: Department) => {
  if (!department.opening_time || !department.closing_time) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [openHour, openMinute] = department.opening_time.split(':').map(Number);
  const [closeHour, closeMinute] = department.closing_time.split(':').map(Number);
  const openMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute;

  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
};

const mapDepartmentToBranch = (department: Department): Branch => {
  const type = TYPE_LABELS[department.type] ?? department.type;
  const number = `№${department.id}`;

  return {
    id: department.id,
    name: `${type} ${number}`,
    number,
    type,
    address: department.address,
    city: department.city,
    schedule: formatSchedule(department),
    phone: department.phone ?? 'Телефон уточнюється',
    maxWeight: department.type === 'sorting_center' ? 'Без обмежень' : 'до 30 кг',
    openNow: isOpenNow(department),
    ...getBranchCoordinates(department),
  };
};

const BranchesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ data: Department[] }>('/departments')
      .then((res) => {
        setBranches(res.data.filter((department) => !department.deleted_at).map(mapDepartmentToBranch));
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Не вдалося завантажити відділення');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredBranches = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return branches;

    return branches.filter((branch) =>
      branch.name.toLowerCase().includes(query) ||
      branch.city.toLowerCase().includes(query) ||
      branch.address.toLowerCase().includes(query) ||
      branch.number.toLowerCase().includes(query) ||
      branch.type.toLowerCase().includes(query)
    );
  }, [branches, searchQuery]);

  return (
    <main className="min-h-screen bg-slate-100 relative overflow-hidden flex flex-col">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-pine/5 via-transparent to-transparent pointer-events-none" />

      <section className="relative z-10 w-full px-4 md:px-8 py-8 md:py-12 flex flex-col flex-1 min-h-[800px] h-[calc(100vh-120px)] space-y-8">
        <BranchesHeader />

        <div className="flex flex-col lg:flex-row gap-6 flex-1 h-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <BranchSidebar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            branches={filteredBranches}
            selectedBranchId={selectedBranchId}
            onBranchSelect={setSelectedBranchId}
            isLoading={isLoading}
            error={error}
          />

          <BranchesMap
            branches={filteredBranches}
            selectedBranchId={selectedBranchId}
            onBranchSelect={setSelectedBranchId}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </section>
    </main>
  );
};

export default BranchesPage;
