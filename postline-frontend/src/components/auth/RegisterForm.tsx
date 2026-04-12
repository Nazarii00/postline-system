

const RegisterForm = () => {
  return (
    <div className="w-full max-w-xl bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-pine mb-2">Реєстрація клієнта</h2>
        <p className="text-slate-500 text-sm">Заповніть дані для створення облікового запису</p>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Ім'я</label>
            <input type="text" placeholder="Назарій" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pine/20 focus:border-pine outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Прізвище</label>
            <input type="text" placeholder="Боднар" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pine/20 focus:border-pine outline-none transition-all" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Телефон</label>
            <input type="tel" placeholder="+380..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pine/20 focus:border-pine outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Email</label>
            <input type="email" placeholder="email@..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pine/20 focus:border-pine outline-none transition-all" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Пароль</label>
            <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pine/20 focus:border-pine outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Підтвердження пароля</label>
            <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pine/20 focus:border-pine outline-none transition-all" />
          </div>
        </div>

        <button className="w-full bg-pine text-white py-4 rounded-xl font-bold hover:bg-pine/90 transition-all shadow-lg active:scale-[0.98] mt-4">
          Зареєструватися
        </button>
      </form>

      <p className="mt-6 text-[11px] text-slate-400 text-center leading-relaxed">
        Персональні дані шифруються відповідно до вимог системи безпеки PostLine.
      </p>
    </div>
  );
};

export default RegisterForm;