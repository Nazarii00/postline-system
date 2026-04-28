import { type ReactNode } from 'react';
import { Phone } from 'lucide-react';
import { type ShipmentFormData, type Department } from '../../types/shipment';
import { ErrorMsg } from '../../components/ui/ErrorMsg';
import { getFieldClass, INPUT_LIMITS, INPUT_PATTERNS, labelClass } from '../../utils/formUtils';

interface Props {
  title: string;
  icon: ReactNode;
  prefix: 'sender' | 'receiver';
  formData: ShipmentFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  errors: Record<string, string>;
  cities: string[];
  departments: Department[];
  isLocationLocked?: boolean;
}

export const ContactSection = ({
  title,
  icon,
  prefix,
  formData,
  onChange,
  errors,
  cities,
  departments,
  isLocationLocked = false,
}: Props) => {
  const phoneKey     = `${prefix}Phone`     as keyof ShipmentFormData;
  const fullNameKey  = `${prefix}FullName`  as keyof ShipmentFormData;
  const cityKey      = `${prefix}City`      as keyof ShipmentFormData;
  const branchKey    = `${prefix}Branch`    as keyof ShipmentFormData;

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-pine/5 text-pine rounded-2xl">{icon}</div>
        <h2 className="text-lg font-black text-slate-800">{title}</h2>
      </div>

      <div className="space-y-5">
        <div>
          <label className={labelClass}>Телефон <span className="text-rose-500">*</span></label>
          <div className="relative">
            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="tel"
              name={phoneKey}
              value={formData[phoneKey]}
              onChange={onChange}
              placeholder="+380..."
              required
              inputMode="numeric"
              pattern={INPUT_PATTERNS.phone}
              maxLength={13}
              className={getFieldClass(phoneKey, errors, 'pl-12')}
            />
          </div>
          <ErrorMsg field={phoneKey} errors={errors} />
        </div>

        <div>
          <label className={labelClass}>ПІБ <span className="text-rose-500">*</span></label>
          <input
            type="text"
            name={fullNameKey}
            value={formData[fullNameKey]}
            onChange={onChange}
            placeholder="Прізвище Ім'я По батькові"
            required
            minLength={INPUT_LIMITS.nameMin}
            maxLength={INPUT_LIMITS.nameMax}
            pattern={INPUT_PATTERNS.personName}
            className={getFieldClass(fullNameKey, errors)}
          />
          <ErrorMsg field={fullNameKey} errors={errors} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Місто <span className="text-rose-500">*</span></label>
            <select
              name={cityKey}
              value={formData[cityKey]}
              onChange={onChange}
              className={getFieldClass(cityKey, errors)}
              disabled={isLocationLocked}
              required
            >
              <option value="">Оберіть місто...</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <ErrorMsg field={cityKey} errors={errors} />
          </div>

          <div>
            <label className={labelClass}>Відділення <span className="text-rose-500">*</span></label>
            <select
              name={branchKey}
              value={formData[branchKey]}
              onChange={onChange}
              className={getFieldClass(branchKey, errors)}
              disabled={isLocationLocked || departments.length === 0}
              required
            >
              <option value="">Оберіть...</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id.toString()}>
                  {d.address}
                </option>
              ))}
            </select>
            <ErrorMsg field={branchKey} errors={errors} />
          </div>
        </div>

        {isLocationLocked && (
          <p className="text-xs text-slate-500 font-medium">
            Відділення відправлення закріплене за вашим акаунтом оператора.
          </p>
        )}
      </div>
    </section>
  );
};
