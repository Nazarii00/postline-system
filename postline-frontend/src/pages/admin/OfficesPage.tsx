import { useEffect, useState, useMemo, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../../services/api';
import type { Department } from '../../types/departments';
import OfficeCard from '../../components/admin/offices/OfficeCard';
import CreateOfficeModal from '../../components/admin/offices/CreateOfficeModal';
import OfficesFilter from '../../components/admin/offices/OfficesFilter';

const OfficesPage = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchDepartments = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.get<{ data: Department[] }>('/departments');
      setDepartments(res.data);
    } catch {
      setError('Не вдалося завантажити відділення');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDepartments();
  }, [fetchDepartments]);

  const displayed = useMemo(() => {
    if (!searchTerm) return departments;
    const lower = searchTerm.toLowerCase();
    return departments.filter(
      (department) =>
        department.city.toLowerCase().includes(lower) ||
        department.address.toLowerCase().includes(lower)
    );
  }, [departments, searchTerm]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Деактивувати відділення?')) return;

    try {
      await api.delete(`/departments/${id}`);
      setDepartments((prev) => prev.filter((department) => department.id !== id));
    } catch {
      setError('Помилка при видаленні відділення');
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

        <OfficesFilter value={searchTerm} onChange={setSearchTerm} />

        {isLoading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-sm text-slate-500 text-center">
            Завантаження відділень...
          </div>
        ) : displayed.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-sm text-slate-500 text-center">
            Відділень не знайдено.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {displayed.map((department) => (
              <OfficeCard key={department.id} department={department} onDelete={handleDelete} />
            ))}
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
    </main>
  );
};

export default OfficesPage;
