const HeroSection = () => {
  const quickActions = ["Відправити посилку", "Замовити кур'єра", "Тарифи для бізнесу"];

  return (
    <section className="pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-pine mb-4">
          Надсилайте. Отримуйте. Слідкуйте.
        </h1>
        <p className="text-slate-500 mb-10 text-lg">
          Безпечна та надійна доставка по всій країні
        </p>

        {/* Поле відстеження */}
        <div className="flex justify-center max-w-2xl mx-auto mb-8 shadow-sm">
          <input
            type="text"
            placeholder="Введіть номер відправлення"
            className="w-full border border-slate-300 rounded-l-lg px-6 py-4 focus:outline-none focus:border-pine focus:ring-1 focus:ring-pine text-slate-700"
          />
          <button className="bg-pine text-white px-8 py-4 rounded-r-lg font-medium hover:bg-pine-light transition-colors">
            Відстежити
          </button>
        </div>

        {/* Кнопки швидких дій */}
        <div className="flex flex-wrap justify-center gap-4">
          {quickActions.map((action, index) => (
            <button 
              key={index}
              className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:border-pine hover:text-pine transition-all shadow-sm"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;