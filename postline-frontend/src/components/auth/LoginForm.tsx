import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import type { User } from "../../types/user";
import { INPUT_LIMITS, INPUT_PATTERNS, sanitizeEmail } from "../../utils/formUtils";

type LoginResponse = {
  token: string;
  user: User;
};

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isEmailValid = new RegExp(INPUT_PATTERNS.email).test(email);
  const isPasswordLongEnough = password.length >= INPUT_LIMITS.passwordMin;
  const canSubmit = isEmailValid && isPasswordLongEnough && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await api.post<LoginResponse>("/auth/login", { email, password });
      setAuth(data.user, data.token);

      const role = data.user.role;
      const requestedPath = typeof location.state?.from === "string" ? location.state.from : "";
      if (requestedPath) {
        navigate(requestedPath, { replace: true });
      } else if (role === "admin") navigate("/admin");
      else if (role === "operator") navigate("/operator");
      else if (role === "courier") navigate("/courier");
      else navigate("/client");

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Помилка входу");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-pine mb-2">Вітаємо в PostLine</h2>
        <p className="text-slate-500 text-sm">Увійдіть до свого особистого кабінету</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Email</label>
          <input
            type="email"
            placeholder="example@email.com"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={INPUT_LIMITS.emailMax}
            pattern={INPUT_PATTERNS.email}
            value={email}
            onChange={(e) => setEmail(sanitizeEmail(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pine/20 focus:border-pine outline-none transition-all placeholder:text-slate-300"
          />
          <p className={`mt-1.5 ml-1 text-xs ${email.length > 0 && !isEmailValid ? "text-rose-500" : "text-slate-400"}`}>
            Формат: name@example.com
          </p>
        </div>

        <div>
          <div className="flex justify-between mb-1.5 ml-1">
            <label className="text-sm font-medium text-slate-700">Пароль</label>
            <span className="text-xs text-slate-400">Відновлення через адміністратора</span>
          </div>
          <div className="relative">
            <input
              type={isPasswordVisible ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              minLength={INPUT_LIMITS.passwordMin}
              maxLength={INPUT_LIMITS.passwordMax}
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\s/g, ""))}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pine/20 focus:border-pine outline-none transition-all placeholder:text-slate-300"
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
          <p className={`mt-1.5 ml-1 text-xs ${password.length > 0 && !isPasswordLongEnough ? "text-rose-500" : "text-slate-400"}`}>
            Мінімум 8 символів, без пробілів.
          </p>
        </div>

        {/* Використали isLoading для блокування кнопки та зміни тексту */}
        <button 
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-pine text-white py-4 rounded-xl font-bold hover:bg-pine/90 transition-all shadow-lg active:scale-[0.98] mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {isLoading ? "Завантаження..." : "Увійти"}
        </button>
      </form>

      <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-xs text-blue-700 leading-relaxed">
          Оператори реєструються виключно через адміністратора системи. Клієнти реєструються самостійно через вкладку «Реєстрація».
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
