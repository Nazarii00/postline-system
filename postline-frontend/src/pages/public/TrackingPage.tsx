import { useState } from 'react';
import { User, MapPin, Scale, CreditCard } from 'lucide-react';
import { api } from '../../services/api';
import { type ParcelData } from '../../types/tracking';
import { TrackingSearch } from '../../components/tracking/TrackingSearch';
import { TrackingError } from '../../components/tracking/TrackingError';
import { TrackingHeader } from '../../components/tracking/TrackingHeader';
import { TrackingDetailCard } from '../../components/tracking/TrackingDetailCard';
import { TrackingTimeline } from '../../components/tracking/TrackingTimeline';

const TrackingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [parcelData, setParcelData] = useState<ParcelData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setParcelData(null);

    try {
      const data = await api.get<ParcelData>(`/tracking/${searchQuery.trim()}`);
      setParcelData(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Сталася невідома помилка');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 relative overflow-hidden flex flex-col">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-pine/5 via-transparent to-transparent pointer-events-none" />

      <section className="relative z-10 px-6 md:px-10 max-w-7xl mx-auto w-full py-12 md:py-16 space-y-10">
        <TrackingSearch
          searchQuery={searchQuery}
          isLoading={isLoading}
          onSearchChange={setSearchQuery}
          onSubmit={handleSearch}
        />

        {error && hasSearched && <TrackingError message={error} />}

        {hasSearched && parcelData && !isLoading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TrackingHeader data={parcelData} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <TrackingDetailCard
                title="Відправник"
                icon={<User size={18} />}
                items={[
                  { label: 'ПІБ', value: parcelData.sender.name },
                  { label: 'Місто', value: parcelData.sender.city },
                  { label: 'Відділення', value: parcelData.sender.branch },
                ]}
              />
              <TrackingDetailCard
                title="Одержувач"
                icon={<MapPin size={18} />}
                items={[
                  { label: 'ПІБ', value: parcelData.receiver.name },
                  { label: 'Місто', value: parcelData.receiver.city },
                  { label: 'Відділення / адреса', value: parcelData.receiver.branch },
                ]}
              />
              <TrackingDetailCard
                title="Параметри"
                icon={<Scale size={18} />}
                items={[
                  { label: 'Тип', value: parcelData.type, isHighlight: true },
                  { label: 'Вага', value: parcelData.details.weight, isHighlight: true },
                  { label: 'Габарити', value: parcelData.details.dimensions, isHighlight: true },
                  { label: 'Оголош. вартість', value: parcelData.details.declaredValue, isHighlight: true },
                ]}
              />
              <TrackingDetailCard
                title="Фінанси"
                icon={<CreditCard size={18} />}
                items={[
                  { label: 'До сплати', value: parcelData.financials.cost, isHighlight: true },
                  { label: 'Платник', value: 'Одержувач', isHighlight: true },
                  { label: 'Тип доставки', value: parcelData.financials.deliveryType, isHighlight: true },
                ]}
              />
            </div>

            <TrackingTimeline history={parcelData.history} rawStatus={parcelData.rawStatus} />
          </div>
        )}
      </section>
    </main>
  );
};

export default TrackingPage;
