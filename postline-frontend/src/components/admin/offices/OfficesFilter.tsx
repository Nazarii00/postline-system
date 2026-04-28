import { Search } from 'lucide-react';
import { INPUT_LIMITS, sanitizePlainText } from '../../../utils/formUtils';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const OfficesFilter = ({ value, onChange }: Props) => (
  <div className="relative">
    <Search size={20} className="absolute left-4 top-3.5 text-slate-400" />
    <input
      type="text"
      placeholder="Пошук відділення за містом або адресою..."
      value={value}
      onChange={(e) => onChange(sanitizePlainText(e.target.value, INPUT_LIMITS.addressMax))}
      maxLength={INPUT_LIMITS.addressMax}
      className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-pine outline-none shadow-sm transition-all text-sm"
    />
  </div>
);

export default OfficesFilter;
