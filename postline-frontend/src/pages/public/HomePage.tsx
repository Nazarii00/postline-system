import HeroSection from "../../components/home/HeroSection";
import ServicesSection from "../../components/home/ServicesSection";

const HomePage = () => {
  return (
    <main className="min-h-screen bg-slate-100"> {/* Задаємо фон всьому мейну */}
      
      {/* 1. HERO */}
        <div className="bg-slate-50">
            <HeroSection />
        </div>

        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>

      {/* 2. ПОСЛУГИ */}
        <div className="relative py-10">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                style={{ backgroundImage: 'radial-gradient(#1a2e23 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            </div>
            <div className="relative z-10">
                <ServicesSection />
            </div>
        </div>

        <div className="bg-pine py-12 text-center">
          <p className="text-white/80 text-sm font-medium tracking-widest uppercase">
            Більше 500 відділень по всій країні
          </p>
        </div>

        <div className="bg-slate-100 pb-24"> 

            <section className="px-6 md:px-10 max-w-7xl mx-auto pt-20">
                <div className="bg-pine rounded-3xl p-12 md:p-14 flex flex-col md:flex-row items-center justify-between overflow-hidden relative shadow-2xl">
                    
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-40 translate-x-40"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-20 -translate-x-10"></div>
                    
                    <div className="relative z-10 mb-8 md:mb-0 max-w-2xl text-center md:text-left">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
                        Шукаєте найближче відділення?
                    </h2>
                    <p className="text-lg text-slate-100 max-w-xl">
                        Скористайтеся нашою інтерактивною картою, щоб знайти найзручнішу точку відправки або отримання посилки.
                    </p>
                    </div>

                    <button className="relative z-10 bg-white text-pine px-12 py-5 rounded-2xl font-bold text-lg hover:bg-gold transition-all shadow-xl whitespace-nowrap active:scale-95">
                    Відкрити карту
                    </button>
                </div>
            </section>
        </div>

    </main>
  );
};

export default HomePage;