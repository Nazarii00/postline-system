import { Search, MapPin } from 'lucide-react';
import { type Branch } from '../../types/branches';
import { BranchCard } from './BranchCard';

interface Props {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  branches: Branch[];
  selectedBranchId?: number | null;
  onBranchSelect?: (id: number) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const BranchSidebar = ({
  searchQuery,
  onSearchChange,
  branches,
  selectedBranchId,
  onBranchSelect,
  isLoading,
  error,
}: Props) => (
  <div className="w-full lg:w-[420px] shrink-0 flex flex-col bg-white/80 backdrop-blur rounded-3xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all overflow-hidden">
    <div className="p-6 border-b border-slate-100 bg-white/50">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Введіть місто, адресу, назву або номер..."
          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine focus:ring-2 focus:ring-pine/20 transition-all text-base font-medium"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>

    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/30">
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 font-semibold">Завантаження відділень...</div>
      ) : error ? (
        <div className="py-20 text-center px-6 text-rose-500 font-semibold">{error}</div>
      ) : branches.length > 0 ? (
        branches.map((branch) => (
          <BranchCard
            key={branch.id}
            branch={branch}
            isSelected={branch.id === selectedBranchId}
            onSelect={onBranchSelect}
          />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <MapPin size={48} className="text-slate-200 mb-4" />
          <p className="text-slate-500 font-semibold">За вашим запитом відділень не знайдено.</p>
          <p className="text-sm text-slate-400 mt-1">Спробуйте змінити умови пошуку.</p>
        </div>
      )}
    </div>
  </div>
);
