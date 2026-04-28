import { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../../../services/api';
import {
  INPUT_LIMITS,
  INPUT_PATTERNS,
  sanitizeAddress,
  sanitizeCity,
  sanitizeUaPhone,
} from '../../../utils/formUtils';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

type FieldErrors = {
  city?: string;
  address?: string;
  phone?: string;
  openingTime?: string;
  closingTime?: string;
};

const CreateOfficeModal = ({ onClose, onSuccess }: Props) => {
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState('post_office');
  const [phone, setPhone] = useState('');
  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('18:00');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): FieldErrors => {
    const nextErrors: FieldErrors = {};

    if (!city.trim() || city.trim().length < INPUT_LIMITS.cityMin || !new RegExp(INPUT_PATTERNS.city).test(city)) {
      nextErrors.city = 'Мінімум 2 символи';
    }
    if (!address.trim() || address.trim().length < INPUT_LIMITS.addressMin) {
      nextErrors.address = 'Мінімум 5 символів';
    }
    if (phone && !new RegExp(INPUT_PATTERNS.phone).test(phone)) {
      nextErrors.phone = 'Формат: +380XXXXXXXXX';
    }
    if (openingTime && closingTime && openingTime >= closingTime) {
      nextErrors.closingTime = 'Час закриття має бути пізніше відкриття';
    }

    return nextErrors;
  };

  const handlePhoneChange = (value: string) => {
    setPhone(sanitizeUaPhone(value, true));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
  };

  const handleCityChange = (value: string) => {
    setCity(sanitizeCity(value));
    if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/departments', {
        city: city.trim(),
        address: address.trim(),
        type,
        phone: phone || undefined,
        openingTime: openingTime || undefined,
        closingTime: closingTime || undefined,
      });
      onSuccess();
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Помилка при створенні відділення');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field?: string) =>
    `w-full px-4 py-3 bg-slate-50 border rounded-2xl focus:outline-none focus:border-pine text-sm font-medium transition-all ${
      field ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-200'
    }`;

  const labelClass = 'block text-xs uppercase tracking-wider text-slate-500 font-black mb-2';

  const ErrorMsg = ({ msg }: { msg?: string }) =>
    msg ? <p className="mt-1.5 text-xs text-rose-500 font-medium">{msg}</p> : null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-slate-800">Нове відділення</h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {apiError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-medium">
              {apiError}
            </div>
          )}

          <div>
            <label className={labelClass}>
              Місто <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => handleCityChange(e.target.value)}
              placeholder="Київ"
              required
              minLength={INPUT_LIMITS.cityMin}
              maxLength={INPUT_LIMITS.cityMax}
              pattern={INPUT_PATTERNS.city}
              className={inputClass(errors.city)}
            />
            <ErrorMsg msg={errors.city} />
          </div>

          <div>
            <label className={labelClass}>
              Адреса <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(sanitizeAddress(e.target.value));
                if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
              }}
              placeholder="вул. Шевченка, 15"
              required
              minLength={INPUT_LIMITS.addressMin}
              maxLength={INPUT_LIMITS.addressMax}
              className={inputClass(errors.address)}
            />
            <ErrorMsg msg={errors.address} />
          </div>

          <div>
            <label className={labelClass}>Тип відділення</label>
            <select
              required
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={inputClass()}
            >
              <option value="post_office">Відділення</option>
              <option value="sorting_center">Сортувальний центр</option>
              <option value="pickup_point">Пункт видачі</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Телефон</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+380441234567"
              inputMode="numeric"
              pattern={INPUT_PATTERNS.phone}
              maxLength={13}
              className={inputClass(errors.phone)}
            />
            <p className={`mt-1.5 text-xs ${errors.phone ? 'text-rose-500' : 'text-slate-400'} font-medium`}>
              {errors.phone ?? "Формат: +380XXXXXXXXX (необов'язково)"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Відкриття</label>
              <input
                type="time"
                value={openingTime}
                required
                onChange={(e) => {
                  setOpeningTime(e.target.value);
                  if (errors.closingTime) setErrors((prev) => ({ ...prev, closingTime: undefined }));
                }}
                className={inputClass()}
              />
            </div>
            <div>
              <label className={labelClass}>Закриття</label>
              <input
                type="time"
                value={closingTime}
                required
                onChange={(e) => {
                  setClosingTime(e.target.value);
                  if (errors.closingTime) setErrors((prev) => ({ ...prev, closingTime: undefined }));
                }}
                className={inputClass(errors.closingTime)}
              />
              <ErrorMsg msg={errors.closingTime} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-pine text-white rounded-2xl font-bold text-sm hover:bg-pine/90 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Збереження...' : 'Створити'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOfficeModal;
