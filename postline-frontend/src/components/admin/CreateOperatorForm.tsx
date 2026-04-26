import { useState, useEffect } from 'react';
import { Eye, EyeOff, UserPlus, X } from 'lucide-react';
import { api } from '../../services/api';
import type { Department, StaffRole } from '../../types/operators';

const sanitizeEmail = (value: string) => {
  const cleaned = value.toLowerCase().replace(/[^a-z0-9@._+-]/g, '');
  const [localPart = '', ...domainParts] = cleaned.split('@');
  const domainPart = domainParts.join('');
  return domainParts.length ? `${localPart}@${domainPart}` : localPart;
};

const sanitizePhone = (value: string) => {
  const cleaned = value.replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+')) return `+${cleaned.replace(/\+/g, '')}`;
  return `+${cleaned.slice(1).replace(/\+/g, '')}`;
};

interface CreateOperatorFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CreateOperatorForm = ({ onSuccess, onCancel }: CreateOperatorFormProps) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+380');
  const [password, setPassword] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [role, setRole] = useState<StaffRole>('operator');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.get<{ data: Department[] }>('/departments')
      .then((res) => setDepartments(res.data))
      .catch(() => {});
  }, []);

  const isNameValid = fullName.trim().length >= 5;
  const isEmailValid = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
  const isPhoneValid = /^\+380\d{9}$/.test(phone);
  const isPasswordValid = password.length >= 8;
  const isDeptValid = departmentId !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isNameValid || !isEmailValid || !isPhoneValid || !isPasswordValid || !isDeptValid) {
      setError('Будь ласка, перевірте правильність заповнення всіх полів.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/operators', {
        fullName: fullName.trim(),
        email,
        phone,
        password,
        departmentId: Number(departmentId),
        role,
      });
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Помилка при створенні оператора');
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
          <h2 className="text-2xl font-bold text-pine mb-1">Новий співробітник</h2>
          <p className="text-slate-500 text-sm">Реєстрація оператора або кур'єра</p>
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
            maxLength={100}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pine/20 focus:border-pine outline-none transition-all placeholder:text-slate-300"
          />
          <p className={`mt-1.5 ml-1 text-xs ${fullName.length > 0 && !isNameValid ? 'text-rose-500' : 'text-slate-400'}`}>
            Мінімум 5 символів
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Email</label>
          <input
            type="email"
            placeholder="operator@postline.com"
            maxLength={100}
            value={email}
            onChange={(e) => setEmail(sanitizeEmail(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pine/20 focus:border-pine outline-none transition-all placeholder:text-slate-300"
          />
          <p className={`mt-1.5 ml-1 text-xs ${email.length > 0 && !isEmailValid ? 'text-rose-500' : 'text-slate-400'}`}>
            Формат: name@example.com
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Телефон</label>
          <input
            type="text"
            placeholder="+380XXXXXXXXX"
            maxLength={13}
            value={phone}
            onChange={(e) => setPhone(sanitizePhone(e.target.value))}
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

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Тимчасовий пароль</label>
          <div className="relative">
            <input
              type={isPasswordVisible ? 'text' : 'password'}
              placeholder="••••••••"
              minLength={8}
              maxLength={64}
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
            Мінімум 8 символів, без пробілів.
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-pine text-white py-4 rounded-xl font-bold hover:bg-pine/90 transition-all shadow-lg active:scale-[0.98] mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Створення...' : 'Зареєструвати'}
        </button>
      </form>
    </div>
  );
};

export default CreateOperatorForm;
