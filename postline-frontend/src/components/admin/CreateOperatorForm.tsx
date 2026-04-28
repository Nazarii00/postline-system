import { useState, useEffect, type FormEvent } from 'react';
import { Eye, EyeOff, UserPlus, X } from 'lucide-react';
import { api } from '../../services/api';
import type { Department, Operator, StaffRole } from '../../types/operators';
import {
  INPUT_LIMITS,
  INPUT_PATTERNS,
  sanitizeEmail,
  sanitizeName,
  sanitizeUaPhone,
} from '../../utils/formUtils';

interface CreateOperatorFormProps {
  operator?: Operator | null;
  departments?: Department[];
  onSuccess: () => void;
  onCancel: () => void;
}

const getInitialRole = (operator?: Operator | null): StaffRole =>
  operator?.role === 'courier' ? 'courier' : 'operator';

const CreateOperatorForm = ({
  operator = null,
  departments: providedDepartments,
  onSuccess,
  onCancel,
}: CreateOperatorFormProps) => {
  const isEditMode = Boolean(operator);

  const [fullName, setFullName] = useState(operator?.full_name ?? '');
  const [email, setEmail] = useState(operator?.email ?? '');
  const [phone, setPhone] = useState(operator?.phone ?? '+380');
  const [password, setPassword] = useState('');
  const [departmentId, setDepartmentId] = useState(operator?.department_id ? String(operator.department_id) : '');
  const [role, setRole] = useState<StaffRole>(getInitialRole(operator));
  const [departments, setDepartments] = useState<Department[]>(providedDepartments ?? []);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (providedDepartments) {
      setDepartments(providedDepartments);
      return;
    }

    let isMounted = true;

    api.get<{ data: Department[] }>('/departments')
      .then((res) => {
        if (isMounted) setDepartments(res.data);
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Не вдалося завантажити відділення');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [providedDepartments]);

  const isNameValid = fullName.trim().length >= INPUT_LIMITS.nameMin && new RegExp(INPUT_PATTERNS.personName).test(fullName);
  const isEmailValid = new RegExp(INPUT_PATTERNS.email).test(email);
  const isPhoneValid = new RegExp(INPUT_PATTERNS.phone).test(phone);
  const isPasswordValid = new RegExp(INPUT_PATTERNS.password).test(password);
  const isDeptValid = departmentId !== '';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isNameValid || !isPhoneValid || !isDeptValid || (!isEditMode && (!isEmailValid || !isPasswordValid))) {
      setError('Будь ласка, перевірте правильність заповнення всіх полів.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        phone,
        departmentId: Number(departmentId),
        role,
      };

      if (isEditMode && operator) {
        await api.patch(`/operators/${operator.id}`, payload);
      } else {
        await api.post('/operators', {
          ...payload,
          email,
          password,
        });
      }

      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Не вдалося зберегти працівника');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
      <button
        onClick={onCancel}
        className="absolute top-6 right-6 text-slate-400 hover:text-rose-500 transition-colors"
      >
        <X size={24} />
      </button>

      <div className="mb-8 flex items-center gap-3">
        <div className="p-3 bg-pine/10 rounded-xl text-pine">
          <UserPlus size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-pine mb-1">
            {isEditMode ? 'Редагувати працівника' : 'Новий співробітник'}
          </h2>
          <p className="text-slate-500 text-sm">
            {isEditMode ? 'Оновлення ролі, контактів та відділення' : "Реєстрація оператора або кур'єра"}
          </p>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">ПІБ</label>
          <input
            type="text"
            placeholder="Іванов Іван Іванович"
            required
            minLength={INPUT_LIMITS.nameMin}
            maxLength={INPUT_LIMITS.nameMax}
            pattern={INPUT_PATTERNS.personName}
            value={fullName}
            onChange={(e) => setFullName(sanitizeName(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pine/20 focus:border-pine outline-none transition-all placeholder:text-slate-300"
          />
          <p className={`mt-1.5 ml-1 text-xs ${fullName.length > 0 && !isNameValid ? 'text-rose-500' : 'text-slate-400'}`}>
            Мінімум 2 символи, лише літери, пробіл, дефіс або апостроф.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Email</label>
          <input
            type="email"
            placeholder="operator@postline.com"
            required={!isEditMode}
            inputMode="email"
            autoComplete="email"
            maxLength={INPUT_LIMITS.emailMax}
            pattern={INPUT_PATTERNS.email}
            value={email}
            disabled={isEditMode}
            onChange={(e) => setEmail(sanitizeEmail(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pine/20 focus:border-pine outline-none transition-all placeholder:text-slate-300 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
          />
          <p className={`mt-1.5 ml-1 text-xs ${!isEditMode && email.length > 0 && !isEmailValid ? 'text-rose-500' : 'text-slate-400'}`}>
            {isEditMode ? 'Email не змінюємо, щоб не ламати логін працівника.' : 'Формат: name@example.com'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Телефон</label>
          <input
            type="tel"
            placeholder="+380XXXXXXXXX"
            required
            inputMode="numeric"
            autoComplete="tel"
            pattern={INPUT_PATTERNS.phone}
            maxLength={13}
            value={phone}
            onChange={(e) => setPhone(sanitizeUaPhone(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pine/20 focus:border-pine outline-none transition-all placeholder:text-slate-300"
          />
          <p className={`mt-1.5 ml-1 text-xs ${phone.length > 4 && !isPhoneValid ? 'text-rose-500' : 'text-slate-400'}`}>
            Формат: +380 та 9 цифр
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Роль</label>
          <div className="flex gap-3">
            {(['operator', 'courier'] as const).map((staffRole) => (
              <button
                key={staffRole}
                type="button"
                onClick={() => setRole(staffRole)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border ${
                  role === staffRole
                    ? 'bg-pine text-white border-pine'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-pine/30'
                }`}
              >
                {staffRole === 'operator' ? 'Оператор' : "Кур'єр"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Відділення</label>
          <select
            required
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pine/20 focus:border-pine outline-none transition-all bg-white ${
              departmentId === '' ? 'text-slate-400' : 'text-slate-900'
            }`}
          >
            <option value="" disabled>Оберіть відділення...</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.city} — {department.address}
              </option>
            ))}
          </select>
        </div>

        {!isEditMode && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Тимчасовий пароль</label>
            <div className="relative">
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                placeholder="••••••••"
                required
                minLength={INPUT_LIMITS.passwordMin}
                maxLength={INPUT_LIMITS.passwordMax}
                pattern={INPUT_PATTERNS.password}
                value={password}
                onChange={(e) => setPassword(e.target.value.replace(/\s/g, ''))}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pine/20 focus:border-pine outline-none transition-all placeholder:text-slate-300"
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-pine transition-colors"
              >
                {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className={`mt-1.5 ml-1 text-xs ${password.length > 0 && !isPasswordValid ? 'text-rose-500' : 'text-slate-400'}`}>
              8-64 символи, велика і мала літера, цифра та спецсимвол.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-pine text-white py-4 rounded-xl font-bold hover:bg-pine/90 transition-all shadow-lg active:scale-[0.98] mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Збереження...' : isEditMode ? 'Зберегти зміни' : 'Зареєструвати'}
        </button>
      </form>
    </div>
  );
};

export default CreateOperatorForm;
