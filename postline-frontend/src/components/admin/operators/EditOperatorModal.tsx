import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../../../services/api';
import type { Operator, Department } from '../../../types/operators';
import {
  INPUT_LIMITS,
  INPUT_PATTERNS,
  sanitizeName,
  sanitizeUaPhone,
} from '../../../utils/formUtils';

interface Props {
  operator: Operator;
  departments: Department[];
  onClose: () => void;
  onSuccess: () => void;
}

const EditOperatorModal = ({ operator, departments, onClose, onSuccess }: Props) => {
  const [fullName, setFullName] = useState(operator.full_name);
  const [phone, setPhone] = useState(operator.phone ?? '');
  const [departmentId, setDepartmentId] = useState(
    operator.department_id ? String(operator.department_id) : ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFullName(operator.full_name);
    setPhone(operator.phone ?? '');
    setDepartmentId(operator.department_id ? String(operator.department_id) : '');
  }, [operator]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (fullName.trim().length < INPUT_LIMITS.nameMin || !new RegExp(INPUT_PATTERNS.personName).test(fullName)) {
      setError("Ім'я має містити мінімум 2 символи");
      return;
    }
    if (phone && !new RegExp(INPUT_PATTERNS.phone).test(phone)) {
      setError('Телефон має бути у форматі +380XXXXXXXXX');
      return;
    }

    setIsLoading(true);
    try {
      await api.patch(`/operators/${operator.id}`, {
        fullName: fullName.trim(),
        phone: phone || undefined,
        departmentId: departmentId ? Number(departmentId) : undefined,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Помилка при збереженні');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-slate-800">Редагувати оператора</h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-500 font-black mb-2">
              ПІБ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(sanitizeName(e.target.value))}
              required
              minLength={INPUT_LIMITS.nameMin}
              maxLength={INPUT_LIMITS.nameMax}
              pattern={INPUT_PATTERNS.personName}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-500 font-black mb-2">
              Телефон
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(sanitizeUaPhone(e.target.value, true))}
              placeholder="+380XXXXXXXXX"
              inputMode="numeric"
              pattern={INPUT_PATTERNS.phone}
              maxLength={13}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-500 font-black mb-2">
              Відділення
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine text-sm font-medium"
            >
              <option value="">Не призначено</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.city} — {d.address}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-pine text-white rounded-2xl font-bold text-sm hover:bg-pine/90 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Збереження...' : 'Зберегти'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOperatorModal;
