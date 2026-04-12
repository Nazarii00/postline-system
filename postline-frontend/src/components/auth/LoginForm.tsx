const LoginForm = () => {
  return (
    <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-pine mb-2">Вітаємо в PostLine</h2>
        <p className="text-slate-500 text-sm">Увійдіть до свого особистого кабінету</p>
      </div>

      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Email</label>
          <input 
            type="email" 
            placeholder="example@email.com"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pine/20 focus:border-pine outline-none transition-all placeholder:text-slate-300"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1.5 ml-1">
            <label className="text-sm font-medium text-slate-700">Пароль</label>
            <button type="button" className="text-xs text-slate-400 hover:text-pine underline">Забули пароль?</button>
          </div>
          <input 
            type="password" 
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pine/20 focus:border-pine outline-none transition-all placeholder:text-slate-300"
          />
        </div>

        <button className="w-full bg-pine text-white py-4 rounded-xl font-bold hover:bg-pine/90 transition-all shadow-lg active:scale-[0.98] mt-2">
          Увійти
        </button>
      </form>

      {/* Інфо-плашка */}
      <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-xs text-blue-700 leading-relaxed">
          Оператори реєструються виключно через адміністратора системи. Клієнти реєструються самостійно через вкладку «Реєстрація».
        </p>
      </div>
    </div>
  );
};

export default LoginForm;