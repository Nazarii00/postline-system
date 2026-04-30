import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import type { Shipment } from '../../../types/shipment';
import type { SortConfig } from './clientDashboardUtils';

type SortIconProps = {
  columnKey: keyof Shipment;
  sortConfig: SortConfig;
};

export const SortIcon = ({ columnKey, sortConfig }: SortIconProps) => {
  if (sortConfig.key !== columnKey) {
    return <ArrowUpDown size={14} className="text-slate-300 group-hover:text-pine transition-colors" />;
  }

  return sortConfig.direction === 'asc'
    ? <ChevronUp size={16} className="text-pine" />
    : <ChevronDown size={16} className="text-pine" />;
};
