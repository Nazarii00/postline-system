import { useState, useEffect } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { api } from "../../services/api"; // Перевірте шлях
import type { Tariff, BackendTariff, ApiResponse } from "../../types/tariffs";
import TariffsTable from "../../components/operator/tariffs/TariffsTable";
import TariffModal from "../../components/operator/tariffs/TariffModal";
import DeleteTariffModal from "../../components/operator/tariffs/DeleteTariffModal";

const ControlTariffsPage = () => {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);

  const fetchTariffs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get<ApiResponse>('/tariffs'); 
      const rawTariffs = response.data || [];

      const formattedTariffs: Tariff[] = rawTariffs.map((t: BackendTariff) => ({
        id: t.id,
        from: t.cityFrom || t.city_from || "Невідомо", 
        to: t.cityTo || t.city_to || "Невідомо",
        type: t.shipmentType || t.shipment_type || "-",
        size: t.sizeCategory || t.size_category || "-",
        basePrice: t.basePrice || t.base_price || 0,
        perKg: t.pricePerKg || t.price_per_kg || 0,
        courierBaseFee: t.courierBaseFee ?? t.courier_base_fee ?? 0,
        courierPerKg: t.courierFeePerKg ?? t.courier_fee_per_kg ?? 0,
      }));

      setTariffs(formattedTariffs);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Не вдалося завантажити тарифи");
      setTariffs([]); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTariffs();
  }, []);

  const handleAddClick = () => {
    setSelectedTariff(null);
    setIsTariffModalOpen(true);
  };

  const handleEditClick = (tariff: Tariff) => {
    setSelectedTariff(tariff);
    setIsTariffModalOpen(true);
  };

  const handleDeleteClick = (tariff: Tariff) => {
    setSelectedTariff(tariff);
    setIsDeleteModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="px-6 md:px-10 max-w-7xl mx-auto w-full py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Керування тарифами
            </h1>
            <p className="text-slate-500 text-base mt-2">
              Налаштування вартості доставки та додаткових послуг
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handleAddClick}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-pine text-white rounded-2xl font-semibold hover:bg-pine/90 transition-colors shadow-md text-sm whitespace-nowrap"
            >
              <Plus size={18} />
              <span>Додати тариф</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <TariffsTable 
          tariffs={tariffs} 
          isLoading={isLoading} 
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </section>

      {isTariffModalOpen && (
        <TariffModal 
          isOpen={isTariffModalOpen}
          onClose={() => setIsTariffModalOpen(false)}
          tariff={selectedTariff}
          onSuccess={fetchTariffs} 
        />
      )}

      {isDeleteModalOpen && selectedTariff && (
        <DeleteTariffModal 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          tariff={selectedTariff}
          onSuccess={fetchTariffs}
        />
      )}
    </main>
  );
};

export default ControlTariffsPage;
