import { useEffect, useState, useMemo, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../../services/api';
import { Pagination } from '../../components/ui/Pagination';
import type { Department } from '../../types/departments';
import OfficeCard from '../../components/admin/offices/OfficeCard';
import CreateOfficeModal from '../../components/admin/offices/CreateOfficeModal';
import OfficeDetailsModal from '../../components/admin/offices/OfficeDetailsModal';
import OfficesFilter from '../../components/admin/offices/OfficesFilter';
import { usePagination } from '../../hooks/usePagination';

const OFFICES_PER_PAGE = 9;

const filterDepartments = (departments: Department[], searchTerm: string) => {
  if (!searchTerm) return departments;

  const lower = searchTerm.toLowerCase();
  return departments.filter(
    (department) =>
      department.city.toLowerCase().includes(lower) ||
      department.address.toLowerCase().includes(lower)
  );
};

const OfficesPage = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [detailsDepartment, setDetailsDepartment] = useState<Department | null>(null);
  const displayed = useMemo(
    () => filterDepartments(departments, searchTerm),
    [departments, searchTerm]
  );
  const {
    activePage,
    endIndex,
    pageNumbers,
    paginatedItems: paginatedDepartments,
    setCurrentPage,
    startIndex,
    totalItems,
    totalPages,
  } = usePagination(displayed, OFFICES_PER_PAGE);

  const fetchDepartments = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.get<{ data: Department[] }>('/departments');
      setDepartments(res.data);
      setCurrentPage(1);
    } catch {
      setError('Не вдалося завантажити відділення');
    } finally {
      setIsLoading(false);
    }
  }, [setCurrentPage]);

  useEffect(() => {
    void fetchDepartments();
  }, [fetchDepartments]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Деактивувати відділення?')) return;

    try {
      await api.delete(`/departments/${id}`);
      const nextDepartments = departments.filter((department) => department.id !== id);
      const nextDisplayed = filterDepartments(nextDepartments, searchTerm);
      const nextTotalPages = Math.ceil(nextDisplayed.length / OFFICES_PER_PAGE);

      setDepartments(nextDepartments);
      setCurrentPage(Math.min(activePage, Math.max(1, nextTotalPages)));
    } catch {
      setError('Помилка при деактивації відділення');
    }
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="max-w-7xl mx-auto w-full px-6 md:px-10 py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Мережа відділень
            </h1>
            <p className="text-slate-500 text-lg mt-3">
              Керування фізичними точками прийому та видачі
            </p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center justify-center gap-2 px-7 py-3.5 bg-pine text-white rounded-2xl font-bold hover:bg-pine/90 transition-colors whitespace-nowrap"
          >
            <Plus size={20} /> Додати відділення
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-medium">
            {error}
          </div>
        )}

        <OfficesFilter value={searchTerm} onChange={handleSearchChange} />

        {isLoading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-sm text-slate-500 text-center">
            Завантаження відділень...
          </div>
        ) : displayed.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-sm text-slate-500 text-center">
            Відділень не знайдено.
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {paginatedDepartments.map((department) => (
                <OfficeCard
                  key={department.id}
                  department={department}
                  onDetails={setDetailsDepartment}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            <Pagination
              activePage={activePage}
              endIndex={endIndex}
              itemLabel="відділень"
              onPageChange={setCurrentPage}
              pageNumbers={pageNumbers}
              startIndex={startIndex}
              totalItems={totalItems}
              totalPages={totalPages}
            />
          </div>
        )}
      </section>

      {isFormOpen && (
        <CreateOfficeModal
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false);
            void fetchDepartments();
          }}
        />
      )}

      {detailsDepartment && (
        <OfficeDetailsModal
          department={detailsDepartment}
          onClose={() => setDetailsDepartment(null)}
        />
      )}
    </main>
  );
};

export default OfficesPage;
