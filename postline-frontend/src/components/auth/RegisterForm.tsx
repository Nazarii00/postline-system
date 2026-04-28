import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import type { User } from "../../types/user";
import {
  INPUT_LIMITS,
  INPUT_PATTERNS,
  sanitizeEmail,
  sanitizeName,
  sanitizeUaPhone,
} from "../../utils/formUtils";

const RegisterForm = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("+380");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const emailPattern = new RegExp(INPUT_PATTERNS.email);
  const phonePattern = new RegExp(INPUT_PATTERNS.phone);
  const passwordPolicyPattern = new RegExp(INPUT_PATTERNS.password);

  const isEmailValid = emailPattern.test(email);
  const isPhoneValid = phonePattern.test(phone);
  const isPasswordValid = passwordPolicyPattern.test(password);
  const isConfirmMatches = confirmPassword.length > 0 && confirmPassword === password;
  const isNameValid = firstName.trim().length >= 2 && lastName.trim().length >= 2;
  const canSubmit = isNameValid && isPhoneValid && isEmailValid && isPasswordValid && isConfirmMatches && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!canSubmit) {
      setSubmitError("Перевірте правильність заповнення полів.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        fullName: `${firstName.trim()} ${lastName.trim()}`.replace(/\s+/g, " "),
        phone,
        email,
        password,
        role: "client",
      };

      const response = await api.post<{ user: User; token: string }>("/auth/register", payload);
      setAuth(response.user, response.token);
      navigate("/client", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не вдалося зареєструватися.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-pine mb-2">Реєстрація клієнта</h2>
        <p className="text-slate-500 text-sm">Заповніть дані для створення облікового запису</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Ім'я</label>
            <input
              type="text"
              placeholder="Назарій"
              autoComplete="given-name"
              required
              minLength={INPUT_LIMITS.nameMin}
              maxLength={INPUT_LIMITS.shortNameMax}
              pattern={INPUT_PATTERNS.personName}
              value={firstName}
              onChange={(e) => setFirstName(sanitizeName(e.target.value, INPUT_LIMITS.shortNameMax))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pine/20 focus:border-pine outline-none transition-all"
            />
            <p className={`mt-1.5 ml-1 text-xs ${firstName.length > 0 && firstName.length < 2 ? "text-rose-500" : "text-slate-400"}`}>
              Лише літери, пробіл, дефіс або апостроф.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Прізвище</label>
            <input
              type="text"
              placeholder="Боднар"
              autoComplete="family-name"
              required
              minLength={INPUT_LIMITS.nameMin}
              maxLength={INPUT_LIMITS.shortNameMax}
              pattern={INPUT_PATTERNS.personName}
              value={lastName}
              onChange={(e) => setLastName(sanitizeName(e.target.value, INPUT_LIMITS.shortNameMax))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pine/20 focus:border-pine outline-none transition-all"
            />
            <p className={`mt-1.5 ml-1 text-xs ${lastName.length > 0 && lastName.length < 2 ? "text-rose-500" : "text-slate-400"}`}>
              Лише літери, пробіл, дефіс або апостроф.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Телефон</label>
            <input
              type="tel"
              placeholder="+380XXXXXXXXX"
              inputMode="numeric"
              autoComplete="tel"
              required
              pattern={INPUT_PATTERNS.phone}
              maxLength={13}
              value={phone}
              onChange={(e) => setPhone(sanitizeUaPhone(e.target.value))}
              onFocus={() => {
                if (!phone) setPhone("+380");
              }}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pine/20 focus:border-pine outline-none transition-all"
            />
            <p className={`mt-1.5 ml-1 text-xs ${phone.length > 4 && !isPhoneValid ? "text-rose-500" : "text-slate-400"}`}>
              Формат: +380XXXXXXXXX
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Email</label>
            <input
              type="email"
              placeholder="email@..."
              inputMode="email"
              autoComplete="email"
              required
              maxLength={INPUT_LIMITS.emailMax}
              pattern={INPUT_PATTERNS.email}
              value={email}
              onChange={(e) => setEmail(sanitizeEmail(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pine/20 focus:border-pine outline-none transition-all"
            />
            <p className={`mt-1.5 ml-1 text-xs ${email.length > 0 && !isEmailValid ? "text-rose-500" : "text-slate-400"}`}>
              Формат: name@example.com
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Пароль</label>
            <div className="relative">
              <input
                type={isPasswordVisible ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                minLength={INPUT_LIMITS.passwordMin}
                maxLength={INPUT_LIMITS.passwordMax}
                pattern={INPUT_PATTERNS.password}
                value={password}
                onChange={(e) => setPassword(e.target.value.replace(/\s/g, ""))}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pine/20 focus:border-pine outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-pine transition-colors"
                aria-label={isPasswordVisible ? "Приховати пароль" : "Показати пароль"}
              >
                {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className={`mt-1.5 ml-1 text-xs ${password.length > 0 && !isPasswordValid ? "text-rose-500" : "text-slate-400"}`}>
              8-64 символів, велика і мала літера, цифра та спецсимвол.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Підтвердження пароля</label>
            <div className="relative">
              <input
                type={isConfirmPasswordVisible ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                minLength={INPUT_LIMITS.passwordMin}
                maxLength={INPUT_LIMITS.passwordMax}
                pattern={INPUT_PATTERNS.password}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value.replace(/\s/g, ""))}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pine/20 focus:border-pine outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setIsConfirmPasswordVisible((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-pine transition-colors"
                aria-label={isConfirmPasswordVisible ? "Приховати пароль" : "Показати пароль"}
              >
                {isConfirmPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className={`mt-1.5 ml-1 text-xs ${confirmPassword.length > 0 && !isConfirmMatches ? "text-rose-500" : "text-slate-400"}`}>
              Паролі мають співпадати.
            </p>
          </div>
        </div>

        {submitError && (
          <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg mt-4 ${
            canSubmit
              ? "bg-pine text-white hover:bg-pine/90 active:scale-[0.98]"
              : "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none"
          }`}
        >
          {isSubmitting ? "Реєстрація..." : "Зареєструватися"}
        </button>
      </form>

      <p className="mt-6 text-[11px] text-slate-400 text-center leading-relaxed">
        Персональні дані шифруються відповідно до вимог системи безпеки PostLine.
      </p>
    </div>
  );
};

export default RegisterForm;
