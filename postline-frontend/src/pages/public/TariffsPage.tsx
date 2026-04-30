import { useEffect, useState, type JSX } from 'react';
import { Package, FileText, Truck } from 'lucide-react';
import { TariffsHeader } from '../../components/tariffs/TariffsHeader';
import { TariffCard } from '../../components/tariffs/TariffCard';
import { TariffsCalculator } from '../../components/tariffs/TariffsCalculator';
import { api } from '../../services/api';
import type { BackendTariffRecord, TariffPlan } from '../../types/tariffs';

const TYPE_CONFIG: Record<string, { title: string; icon: JSX.Element; description: string }> = {
  letter: { title: 'Документи', icon: <FileText size={24} />, description: 'Швидка доставка паперів та листів' },
  parcel: { title: 'Посилки', icon: <Package size={24} />, description: 'Ідеальний вибір для покупок та подарунків' },
  package: { title: 'Вантажі', icon: <Truck size={24} />, description: 'Для габаритних та комерційних відправлень' },
};

const normalizeCityName = (city: string) => city.trim().toLocaleLowerCase('uk-UA');
const formatPrice = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(2);

const getUniqueRouteFeatures = (tariffs: BackendTariffRecord[]) => {
  const routes = new Map<string, {
    cityFrom: string;
    cityTo: string;
    minBasePrice: number;
    minPricePerKg: number;
  }>();

  tariffs.forEach((tariff) => {
    const cityFrom = tariff.city_from.trim();
    const cityTo = tariff.city_to.trim();
    const key = `${normalizeCityName(cityFrom)}->${normalizeCityName(cityTo)}`;
    const basePrice = parseFloat(tariff.base_price);
    const pricePerKg = parseFloat(tariff.price_per_kg);
    const existing = routes.get(key);

    if (!existing) {
      routes.set(key, {
        cityFrom,
        cityTo,
        minBasePrice: basePrice,
        minPricePerKg: pricePerKg,
      });
      return;
    }

    existing.minBasePrice = Math.min(existing.minBasePrice, basePrice);
    existing.minPricePerKg = Math.min(existing.minPricePerKg, pricePerKg);
  });

  return [...routes.values()]
    .sort((left, right) =>
      left.cityFrom.localeCompare(right.cityFrom, 'uk-UA')
      || left.cityTo.localeCompare(right.cityTo, 'uk-UA')
    )
    .slice(0, 4)
    .map((route) =>
      `${route.cityFrom} → ${route.cityTo} · від ${formatPrice(route.minBasePrice)} грн + ${formatPrice(route.minPricePerKg)} грн/кг`
    );
};

const TariffsPage = () => {
  const [tariffs, setTariffs] = useState<BackendTariffRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTariffType, setSelectedTariffType] = useState('parcel');

  useEffect(() => {
    api.get<{ data: BackendTariffRecord[] }>('/tariffs')
      .then((res) => setTariffs(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const plans: TariffPlan[] = Object.entries(TYPE_CONFIG).map(([type, config]) => {
    const typeTariffs = tariffs.filter((tariff) => tariff.shipment_type === type);
    const minPrice = typeTariffs.length
      ? Math.min(...typeTariffs.map((tariff) => parseFloat(tariff.base_price)))
      : null;

    return {
      type,
      ...config,
      price: minPrice ? `від ${minPrice} грн` : 'Уточнюйте',
      features: getUniqueRouteFeatures(typeTariffs),
    };
  });

  return (
    <main className="min-h-screen bg-slate-100 relative overflow-hidden flex flex-col">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-pine/5 via-transparent to-transparent pointer-events-none" />

      <section className="relative z-10 px-6 md:px-10 max-w-7xl mx-auto w-full py-12 md:py-16 space-y-10">
        <TariffsHeader />

        {isLoading ? (
          <div className="py-12 text-center text-slate-400 font-medium">Завантаження тарифів...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan) => (
              <TariffCard
                key={plan.type}
                plan={plan}
                isSelected={plan.type === selectedTariffType}
                onSelect={setSelectedTariffType}
              />
            ))}
          </div>
        )}

        <TariffsCalculator
          tariffs={tariffs}
          selectedTariffType={selectedTariffType}
          selectedTariffTitle={plans.find((plan) => plan.type === selectedTariffType)?.title}
        />
      </section>
    </main>
  );
};

export default TariffsPage;
