import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const quickActions = [
  { label: 'Відправити посилку', path: '/operator/new-shipment' },
  { label: "Замовити кур'єра", path: '/operator/new-shipment?courier=1' },
  { label: 'Тарифний калькулятор', path: '/tariffs#calculator' },
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleTrackingSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = trackingNumber.trim().toUpperCase();
    navigate(normalized ? `/tracking?number=${encodeURIComponent(normalized)}` : '/tracking');
  };

  return (
    <section className="pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-pine mb-4">
          Надсилайте. Отримуйте. Слідкуйте.
        </h1>
        <p className="text-slate-500 mb-10 text-lg">
          Безпечна та надійна доставка по всій країні
        </p>

        <form onSubmit={handleTrackingSubmit} className="flex justify-center max-w-2xl mx-auto mb-8 shadow-sm">
          <input
            type="text"
            value={trackingNumber}
            onChange={(event) => setTrackingNumber(event.target.value)}
            placeholder="Введіть номер відправлення"
            className="w-full border border-slate-300 rounded-l-lg px-6 py-4 focus:outline-none focus:border-pine focus:ring-1 focus:ring-pine text-slate-700"
          />
          <button
            type="submit"
            className="bg-pine text-white px-8 py-4 rounded-r-lg font-medium hover:bg-pine-light transition-colors"
          >
            Відстежити
          </button>
        </form>

        <div className="flex flex-wrap justify-center gap-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => navigate(action.path)}
              className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:border-pine hover:text-pine transition-all shadow-sm"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
