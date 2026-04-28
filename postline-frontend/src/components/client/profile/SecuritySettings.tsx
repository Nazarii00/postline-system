import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, Shield, X } from 'lucide-react';
import { api } from '../../../services/api';
import { INPUT_LIMITS } from '../../../utils/formUtils';

type PasswordFieldProps = {
  label: string;
  value: string;
  isVisible: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
};

const PasswordField = ({ label, value, isVisible, onToggle, onChange }: PasswordFieldProps) => (
  <div>
    <label className="block text-xs uppercase tracking-wider text-slate-500 font-black mb-2">
      {label}
    </label>
    <div className="relative">
      <input
        type={isVisible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\s/g, ''))}
        required
        minLength={INPUT_LIMITS.passwordMin}
        maxLength={INPUT_LIMITS.passwordMax}
        className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine text-sm font-medium"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-pine transition-colors"
      >
        {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);

export const SecuritySettings = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [visibleField, setVisibleField] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const passwordChecks = [
    { label: '8-64 символи', isValid: newPassword.length >= 8 && newPassword.length <= 64 },
    { label: 'Велика літера', isValid: /[A-Z]/.test(newPassword) },
    { label: 'Мала літера', isValid: /[a-z]/.test(newPassword) },
    { label: 'Цифра', isValid: /\d/.test(newPassword) },
    { label: 'Спецсимвол', isValid: /[!@#$%^&*(),.?":{}|<>_\-\\[\]/+=~`]/.test(newPassword) },
  ];

  const isPasswordStrong = passwordChecks.every((check) => check.isValid);
  const canSubmit =
    currentPassword.length > 0 &&
    isPasswordStrong &&
    newPassword === confirmPassword &&
    newPassword !== currentPassword;

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setVisibleField(null);
    setError('');
  };

  const closeModal = () => {
    resetForm();
    setIsModalOpen(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!canSubmit) {
      setError('Перевірте поточний пароль, складність нового пароля та підтвердження.');
      return;
    }

    setIsSaving(true);
    try {
      await api.patch('/auth/me/password', {
        currentPassword,
        newPassword,
      });

      closeModal();
      setSuccess('Пароль успішно оновлено');
      window.setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося змінити пароль');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="bg-white/90 backdrop-blur p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center shrink-0">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Безпека акаунту</h3>
              <p className="text-sm text-slate-500 mt-1">Пароль можна змінити після підтвердження поточного.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-2xl hover:bg-slate-50 transition-colors active:scale-95 shadow-sm"
          >
            Змінити пароль
          </button>
        </div>

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-sm font-medium">
            {success}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">Зміна пароля</h3>
                <p className="text-sm text-slate-500 mt-1">Новий пароль має відповідати правилам безпеки.</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <PasswordField
                label="Поточний пароль"
                value={currentPassword}
                isVisible={visibleField === 'current'}
                onToggle={() => setVisibleField((field) => field === 'current' ? null : 'current')}
                onChange={setCurrentPassword}
              />

              <PasswordField
                label="Новий пароль"
                value={newPassword}
                isVisible={visibleField === 'new'}
                onToggle={() => setVisibleField((field) => field === 'new' ? null : 'new')}
                onChange={setNewPassword}
              />

              <div className="grid grid-cols-2 gap-2">
                {passwordChecks.map((check) => (
                  <span
                    key={check.label}
                    className={`px-3 py-2 rounded-xl text-[11px] font-bold ${
                      check.isValid ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'
                    }`}
                  >
                    {check.label}
                  </span>
                ))}
              </div>

              <PasswordField
                label="Підтвердження нового пароля"
                value={confirmPassword}
                isVisible={visibleField === 'confirm'}
                onToggle={() => setVisibleField((field) => field === 'confirm' ? null : 'confirm')}
                onChange={setConfirmPassword}
              />

              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs font-medium text-rose-500">Паролі не збігаються.</p>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors disabled:opacity-60"
              >
                Скасувати
              </button>
              <button
                type="submit"
                disabled={!canSubmit || isSaving}
                className="flex-1 py-3 bg-pine text-white rounded-2xl font-bold text-sm hover:bg-pine/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Збереження...' : 'Оновити'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
