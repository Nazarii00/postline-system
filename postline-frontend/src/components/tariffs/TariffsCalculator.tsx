import { useState } from 'react';
import { Calculator, MapPin, Scale } from 'lucide-react';
import type { BackendTariffRecord } from '../../types/tariffs';
import { INPUT_LIMITS, preventInvalidNumberInput } from '../../utils/formUtils';

interface Props {
  tariffs: BackendTariffRecord[];
  selectedTariffType: string;
  selectedTariffTitle?: string;
}

const normalizeCityName = (city: string) => city.trim().toLocaleLowerCase('uk-UA');

const getUniqueCities = (tariffs: BackendTariffRecord[]) => {
  const citiesByKey = new Map<string, string>();

  tariffs.forEach((tariff) => {
    [tariff.city_from, tariff.city_to].forEach((city) => {
      const displayCity = city.trim();
      const key = normalizeCityName(displayCity);
      if (key && !citiesByKey.has(key)) citiesByKey.set(key, displayCity);
    });
  });

  return [...citiesByKey.values()].sort((left, right) => left.localeCompare(right, 'uk-UA'));
};

export const TariffsCalculator = ({ tariffs, selectedTariffType, selectedTariffTitle }: Props) => {
  const [cityFrom, setCityFrom] = useState('');
  const [cityTo, setCityTo] = useState('');
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState<{ min: number; max: number; tariffType: string; tariffTitle?: string } | null>(null);
  const [error, setError] = useState<{ message: string; tariffType: string } | null>(null);

  const cities = getUniqueCities(tariffs);

  const handleCalculate = () => {
    setError(null);
    setResult(null);

    const numericWeight = Number(weight);
    if (!cityFrom || !cityTo || !weight) {
      setError({ message: 'Заповніть всі поля', tariffType: selectedTariffType });
      return;
    }
    if (numericWeight < INPUT_LIMITS.weightMin || numericWeight > INPUT_LIMITS.weightMax) {
      setError({ message: `Вага має бути від ${INPUT_LIMITS.weightMin} до ${INPUT_LIMITS.weightMax} кг`, tariffType: selectedTariffType });
      return;
    }

    const matched = tariffs.filter(
      (tariff) =>
        normalizeCityName(tariff.city_from) === normalizeCityName(cityFrom) &&
        normalizeCityName(tariff.city_to) === normalizeCityName(cityTo) &&
        tariff.shipment_type === selectedTariffType
    );

    if (matched.length === 0) {
      setError({
        message: 'Тариф для цього маршруту та типу відправлення не знайдено',
        tariffType: selectedTariffType,
      });
      return;
    }

    const prices = matched.map(
      (tariff) => parseFloat(tariff.base_price) + parseFloat(tariff.price_per_kg) * numericWeight
    );

    setResult({
      min: Math.min(...prices),
      max: Math.max(...prices),
      tariffType: selectedTariffType,
      tariffTitle: selectedTariffTitle,
    });
  };

  const visibleError = error?.tariffType === selectedTariffType ? error.message : '';
  const visibleResult = result?.tariffType === selectedTariffType ? result : null;

  return (
    <div id="calculator" className="w-full bg-white/80 backdrop-blur p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col pt-8 scroll-mt-24">
      <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-5">
        <div className="p-3 bg-pine/10 text-pine rounded-xl"><Calculator size={22} /></div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">Швидкий розрахунок</h3>
          <p className="text-sm text-slate-500 mt-1">
            Обраний тариф: <span className="font-bold text-pine">{selectedTariffTitle ?? 'не вибрано'}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
            <MapPin size={14} /> Звідки
          </label>
          <select
            required
            value={cityFrom}
            onChange={(e) => setCityFrom(e.target.value)}
            className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:border-pine outline-none transition-all font-medium text-slate-800"
          >
            <option value="">Оберіть місто...</option>
            {cities.map((city) => <option key={city} value={city}>{city}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
            <MapPin size={14} /> Куди
          </label>
          <select
            required
            value={cityTo}
            onChange={(e) => setCityTo(e.target.value)}
            className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:border-pine outline-none transition-all font-medium text-slate-800"
          >
            <option value="">Оберіть місто...</option>
            {cities.filter((city) => normalizeCityName(city) !== normalizeCityName(cityFrom)).map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
            <Scale size={14} /> Вага (кг)
          </label>
          <input
            type="number"
            required
            min={INPUT_LIMITS.weightMin}
            max={INPUT_LIMITS.weightMax}
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onKeyDown={preventInvalidNumberInput}
            placeholder="0.0"
            className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:border-pine outline-none transition-all font-medium text-slate-800"
          />
        </div>

        <div className="flex items-end h-full">
          <button
            type="button"
            onClick={handleCalculate}
            className="w-full py-3 h-[46px] bg-pine text-white text-base font-bold rounded-2xl hover:bg-pine/90 active:scale-95 transition-all shadow-lg"
          >
            Розрахувати
          </button>
        </div>
      </div>

      {visibleError && <p className="mt-4 text-sm text-rose-500 font-medium">{visibleError}</p>}

      {visibleResult && (
        <div className="mt-6 p-4 bg-pine/5 border border-pine/20 rounded-2xl">
          <p className="text-sm text-slate-500 font-medium mb-1">
            Орієнтовна вартість доставки за тарифом {visibleResult.tariffTitle ?? 'обраним тарифом'}:
          </p>
          {visibleResult.min === visibleResult.max ? (
            <p className="text-2xl font-black text-pine">{visibleResult.min.toFixed(2)} грн</p>
          ) : (
            <p className="text-2xl font-black text-pine">
              {visibleResult.min.toFixed(2)} — {visibleResult.max.toFixed(2)} грн
            </p>
          )}
          <p className="text-xs text-slate-400 mt-1">Залежно від розміру відправлення в межах вибраного тарифу</p>
        </div>
      )}
    </div>
  );
};
