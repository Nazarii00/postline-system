import { useState, useEffect, useCallback } from 'react';
import { UserPlus } from "lucide-react";
import { api } from '../../services/api';
import CreateOperatorForm from '../../components/admin/CreateOperatorForm';
import OperatorsTable from '../../components/admin/operators/OperatorsTable';
import type { Operator, Department } from '../../types/operators';

const OperatorsPage = () => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchOperators = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<{ data: Operator[] }>('/operators');
      setOperators(res.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Не вдалося завантажити список операторів');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOperators();
    api.get<{ data: Department[] }>('/departments')
      .then((res) => setDepartments(res.data || []))
      .catch(() => {}); // Ігноруємо помилку відділень, щоб не блокувати операторів
  }, [fetchOperators]);

  const handleToggleStatus = async (op: Operator) => {
    if (!window.confirm(`${op.deleted_at ? 'Активувати' : 'Деактивувати'} ${op.full_name}?`)) return;

    try {
      await api.delete(`/operators/${op.id}`);
      setOperators((prev) =>
        prev.map((o) =>
          o.id === op.id
            ? { ...o, deleted_at: o.deleted_at ? null : new Date().toISOString() }
            : o
        )
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Не вдалося змінити статус');
    }
  };

  const handleEdit = (op: Operator) => {
    // Тут в майбутньому можна додати логіку відкриття модалки редагування
    console.log("Редагувати оператора:", op);
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="max-w-7xl mx-auto w-full px-6 md:px-10 py-10 space-y-8">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Управління операторами
            </h1>
            <p className="text-lg text-slate-500 mt-2">
              Керуйте доступами працівників та призначенням по відділеннях.
            </p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center justify-center gap-2 px-7 py-3.5 bg-pine text-white rounded-2xl font-bold hover:bg-pine/90 transition-colors whitespace-nowrap shadow-sm"
          >
            <UserPlus size={20} /> Новий оператор
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-medium">
            {error}
          </div>
        )}

        <OperatorsTable 
          operators={operators}
          departments={departments}
          isLoading={isLoading}
          onToggleStatus={handleToggleStatus}
          onEdit={handleEdit}
        />
        
      </section>

      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <CreateOperatorForm
            onCancel={() => setIsFormOpen(false)}
            onSuccess={() => {
              setIsFormOpen(false);
              fetchOperators();
            }}
          />
        </div>
      )}
    </main>
  );
};

export default OperatorsPage;