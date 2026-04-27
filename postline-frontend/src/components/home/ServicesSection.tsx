import { Link } from 'react-router-dom';

const servicesData = [
  {
    title: 'Відправлення',
    desc: 'Посилки, листи та бандеролі будь-яких категорій',
    path: '/operator/new-shipment',
    icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>,
  },
  {
    title: 'Відстеження',
    desc: 'Статус відправлення у реальному часі',
    path: '/tracking',
    icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    title: "Кур'єрська доставка",
    desc: 'Доставка прямо до дверей одержувача',
    path: '/operator/new-shipment?courier=1',
    icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>,
  },
  {
    title: 'Тарифний калькулятор',
    desc: 'Розрахуйте вартість доставки заздалегідь',
    path: '/tariffs#calculator',
    icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
];

const ServicesSection = () => (
  <section className="px-6 md:px-10">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-lg font-bold text-pine mb-6">Наші послуги</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {servicesData.map((service) => (
          <Link
            key={service.title}
            to={service.path}
            className="bg-white rounded-2xl p-8 h-full shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md hover:border-pine/40 transition-all cursor-pointer"
          >
            <div className="text-pine mb-4">
              {service.icon}
            </div>
            <h3 className="font-semibold text-pine mb-2">{service.title}</h3>
            <p className="text-sm text-slate-500">{service.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;
