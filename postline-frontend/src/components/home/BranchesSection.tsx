import { Link } from 'react-router-dom';

const branchesData = [
  { id: 1, name: "Відділення №1", address: "вул. Шевченка, 15", schedule: "Пн–Сб, 9:00 – 18:00" },
  { id: 2, name: "Відділення №2", address: "просп. Незалежності, 34", schedule: "Пн–Нд, 8:00 – 20:00" },
  { id: 3, name: "Відділення №3", address: "вул. Франка, 8", schedule: "Пн–Пт, 9:00 – 17:00" },
  { id: 4, name: "Поштомат №12", address: "ТЦ «Арена», 1 поверх", schedule: "Цілодобово" },
];

const BranchesSection = () => {
  return (
    <section className="py-10 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-lg font-bold text-pine">Відділення та поштомати</h2>
          <Link
            to="/branches"
            className="text-sm bg-white border border-slate-200 text-slate-700 px-5 py-2 rounded-lg hover:border-pine hover:text-pine transition-all shadow-sm font-medium"
          >
            Всі відділення на карті
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {branchesData.map((branch) => (
            <Link key={branch.id} to="/branches" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-pine/40 transition-colors cursor-pointer group">
              <h3 className="font-semibold text-pine mb-3 group-hover:text-pine-light transition-colors">
                {branch.name}
              </h3>
              <p className="text-sm text-slate-600 mb-1">{branch.address}</p>
              <p className="text-xs text-slate-400">{branch.schedule}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BranchesSection;
