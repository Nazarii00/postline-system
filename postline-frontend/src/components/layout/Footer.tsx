import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-pine text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">PostLine</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Ваш надійний партнер у сфері логістики. Доставляємо посилки та емоції по всій країні.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-6">Послуги</h3>
            <ul className="space-y-3 text-slate-300 text-sm">
              <li><Link to="/tracking" className="hover:text-white transition-colors">Відстеження</Link></li>
              <li><Link to="/operator/new-shipment?courier=1" className="hover:text-white transition-colors">Кур'єрська доставка</Link></li>
              <li><span className="text-slate-500">Міжнародні відправлення</span></li>
              <li><Link to="/tariffs" className="hover:text-white transition-colors">Для бізнесу</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-6">Клієнтам</h3>
            <ul className="space-y-3 text-slate-300 text-sm">
              <li><Link to="/tariffs" className="hover:text-white transition-colors">Тарифи</Link></li>
              <li><Link to="/branches" className="hover:text-white transition-colors">Знайти відділення</Link></li>
              <li><span className="text-slate-500">FAQ</span></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-6">Зв'язок</h3>
            <ul className="space-y-4 text-slate-300 text-sm">
              <li className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                <span>0 800 300 000</span>
              </li>
              <li className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                <span>support@postline.ua</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-2 border-t border-white/10 text-center md:text-left">
          <p className="text-xs text-slate-400">
            © 2026 PostLine Logistics. Всі права захищені.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
