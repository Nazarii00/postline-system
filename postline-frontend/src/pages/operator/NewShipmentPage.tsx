import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, MapPin } from 'lucide-react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { type ShipmentFormData, type Department, type Tariff } from '../../types/shipment';

import { SuccessView } from '../../components/shipment/SuccessView';
import { ContactSection } from '../../components/shipment/ContactSection';
import { ParcelSection } from '../../components/shipment/ParcelSection';
import { CheckoutFooter } from '../../components/shipment/CheckoutFooter';

const initialFormState: ShipmentFormData = {
  senderPhone: '+380', senderFullName: '', senderCity: '', senderBranch: '',
  receiverPhone: '+380', receiverFullName: '', receiverCity: '', receiverBranch: '', receiverAddress: '',
  type: 'parcel', weight: '', declaredValue: '', length: '', width: '', height: '', description: '',
};

const NewShipmentPage = () => {
  const user = useAuthStore((state) => state.user);
  const [searchParams] = useSearchParams();
  const shouldStartWithCourier = searchParams.get('courier') === '1';
  const isOperatorOriginLocked = user?.role === 'operator';

  const [formData, setFormData] = useState<ShipmentFormData>(initialFormState);
  const [isCourier, setIsCourier] = useState(shouldStartWithCourier);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedTracking, setGeneratedTracking] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [originDepartments, setOriginDepartments] = useState<Department[]>([]);
  const [destDepartments, setDestDepartments] = useState<Department[]>([]);
  const [tariff, setTariff] = useState<Tariff | null>(null);

  const l = Number(formData.length) || 0;
  const w = Number(formData.width) || 0;
  const h = Number(formData.height) || 0;
  const maxDim = Math.max(l, w, h);

  let calculatedSize = 'S';
  if (maxDim > 80) calculatedSize = 'XL';
  else if (maxDim > 50) calculatedSize = 'L';
  else if (maxDim > 30) calculatedSize = 'M';

  useEffect(() => {
    if (shouldStartWithCourier) {
      setIsCourier(true);
    }
  }, [shouldStartWithCourier]);

  // Завантаження відділень і автозаповнення для оператора.
  useEffect(() => {
    api.get<{ data: Department[] }>('/departments').then((res) => {
      setDepartments(res.data);

      const operatorDepartmentId = user?.departmentId ? Number(user.departmentId) : null;

      if (operatorDepartmentId) {
        const opDept = res.data.find((d) => d.id === operatorDepartmentId);
        if (opDept) {
          setFormData((prev) => ({
            ...prev,
            senderCity: opDept.city,
            senderBranch: opDept.id.toString(),
          }));
          setOriginDepartments(res.data.filter((d) => d.city === opDept.city));
        } else {
          setApiError('До вашого акаунта привʼязане відділення, якого вже немає в активному списку. Зверніться до адміністратора.');
        }
      } else {
        setApiError('До вашого акаунта не привʼязане відділення. Зверніться до адміністратора.');
      }
    }).catch((err: unknown) => {
      setApiError(err instanceof Error ? err.message : 'Не вдалося завантажити відділення');
    });
  }, [user?.departmentId]);

  // Фільтрація відділень призначення при зміні міста одержувача.
  useEffect(() => {
    if (formData.receiverCity) {
      setDestDepartments(
        departments.filter((d) => d.city.toLowerCase() === formData.receiverCity.toLowerCase())
      );
      setFormData((prev) => ({ ...prev, receiverBranch: '' }));
    } else {
      setDestDepartments([]);
    }
  }, [formData.receiverCity, departments]);

  // Пошук тарифу.
  useEffect(() => {
    if (!formData.senderCity || !formData.receiverCity || !formData.type || maxDim === 0) {
      setTariff(null);
      return;
    }
    api.get<{ data: Tariff[] }>(
      `/tariffs?cityFrom=${formData.senderCity}&cityTo=${formData.receiverCity}`
    ).then((res) => {
      const found = res.data.find(
        (t) => t.shipment_type === formData.type && t.size_category === calculatedSize
      );
      setTariff(found || null);
    }).catch(() => setTariff(null));
  }, [formData.senderCity, formData.receiverCity, formData.type, calculatedSize, maxDim]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name } = e.target;
    let { value } = e.target;

    if (isOperatorOriginLocked && (name === 'senderCity' || name === 'senderBranch')) {
      return;
    }

    if (name === 'receiverPhone' || name === 'senderPhone') {
      value = value.replace(/[^\d+]/g, '');
      if (value.indexOf('+') > 0) value = '+' + value.replace(/\+/g, '');
      if (value.length > 13) value = value.substring(0, 13);
    }

    if (name === 'senderCity') {
      setFormData((prev) => ({ ...prev, senderCity: value, senderBranch: '' }));
      setOriginDepartments(
        departments.filter((d) => d.city.toLowerCase() === value.toLowerCase())
      );
    } else if (name === 'receiverCity') {
      setFormData((prev) => ({ ...prev, receiverCity: value, receiverBranch: '' }));
      setDestDepartments(
        departments.filter((d) => d.city.toLowerCase() === value.toLowerCase())
      );
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setErrors((prev) => {
      const errs = { ...prev };
      delete errs[name];
      return errs;
    });
    if (apiError) setApiError(null);
  };

  const weightNum = Number(formData.weight) || 0;
  const declaredValueNum = Number(formData.declaredValue) || 0;
  const basePrice = tariff ? parseFloat(tariff.base_price) : 0;
  const weightSurcharge = tariff ? weightNum * parseFloat(tariff.price_per_kg) : 0;
  const courierPrice = isCourier ? 20 : 0;
  const insurance = declaredValueNum > 500 ? Math.round(declaredValueNum * 0.005) : 0;
  const totalPrice = Math.round((basePrice + weightSurcharge + courierPrice + insurance) * 100) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const requiredFields = [
      'senderPhone', 'senderFullName', 'senderCity', 'senderBranch',
      'receiverPhone', 'receiverFullName', 'receiverCity', 'receiverBranch',
      'weight', 'length', 'width', 'height',
    ];

    requiredFields.forEach((field) => {
      if (!formData[field as keyof ShipmentFormData]) {
        newErrors[field] = "Обов'язкове поле";
      }
    });

    if (isCourier && !formData.receiverAddress.trim()) {
      newErrors.receiverAddress = "Обов'язкове поле для кур'єрської доставки";
    }

    if (formData.senderPhone && formData.senderPhone.length < 13) {
      newErrors.senderPhone = 'Некоректний формат';
    }
    if (formData.receiverPhone && formData.receiverPhone.length < 13) {
      newErrors.receiverPhone = 'Некоректний формат';
    }
    if (!tariff && formData.senderCity && formData.receiverCity && maxDim > 0) {
      newErrors.tariff = 'Тариф для цього маршруту не знайдено';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setApiError("Будь ласка, перевірте правильність заповнення всіх полів.");
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      const payload = {
        senderPhone: formData.senderPhone,
        senderName: formData.senderFullName,
        originDeptId: Number(formData.senderBranch),
        receiverPhone: formData.receiverPhone,
        receiverName: formData.receiverFullName,
        destDeptId: Number(formData.receiverBranch),
        tariffId: tariff!.id,
        shipmentType: formData.type,
        sizeCategory: calculatedSize,
        weightKg: Number(formData.weight),
        lengthCm: Number(formData.length),
        widthCm: Number(formData.width),
        heightCm: Number(formData.height),
        declaredValue: declaredValueNum || null,
        description: formData.description || null,
        receiverAddress: isCourier ? formData.receiverAddress.trim() : null,
        isCourier,
      };

      const response = await api.post<{ data: { tracking_number: string } }>('/shipments', payload);
      setGeneratedTracking(response.data.tracking_number);
    } catch (error: unknown) {
      setApiError(error instanceof Error ? error.message : 'Сталася невідома помилка');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    const defaultCity = departments.find((d) => d.id === user?.departmentId)?.city || '';
    const defaultBranch = user?.departmentId ? String(user.departmentId) : '';
    setFormData({ ...initialFormState, senderCity: defaultCity, senderBranch: defaultBranch });
    if (defaultCity) {
      setOriginDepartments(departments.filter((d) => d.city === defaultCity));
    }
    setIsCourier(false);
    setGeneratedTracking(null);
    setErrors({});
    setApiError(null);
    setTariff(null);
  };

  if (generatedTracking) {
    return <SuccessView tracking={generatedTracking} onReset={resetForm} />;
  }

  const uniqueCities = [...new Set(departments.map((d) => d.city))].sort();
  const senderCities = isOperatorOriginLocked && formData.senderCity
    ? [formData.senderCity]
    : uniqueCities;

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
          Створення відправлення
        </h1>
        <p className="text-slate-500 text-sm md:text-base mt-2">
          Внесіть дані відправника, одержувача та параметри посилки для генерації ТТН.
        </p>
      </div>

      {apiError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl font-bold">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white/80 backdrop-blur p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            <ContactSection
              title="Відправник"
              icon={<User size={20} />}
              prefix="sender"
              formData={formData}
              onChange={handleChange}
              errors={errors}
              cities={senderCities}
              departments={originDepartments}
              isLocationLocked={isOperatorOriginLocked}
            />
            <ContactSection
              title="Одержувач"
              icon={<MapPin size={20} />}
              prefix="receiver"
              formData={formData}
              onChange={handleChange}
              errors={errors}
              cities={uniqueCities}
              departments={destDepartments}
            />
          </div>

          <div className="w-full h-px bg-slate-200" />

          <ParcelSection
            formData={formData}
            onChange={handleChange}
            errors={errors}
            calculatedSize={calculatedSize}
            maxDim={maxDim}
            isCourier={isCourier}
            setIsCourier={setIsCourier}
            tariff={tariff}
          />
        </div>

        <CheckoutFooter
          basePrice={basePrice}
          weightSurcharge={weightSurcharge}
          isCourier={isCourier}
          insurance={insurance}
          totalPrice={totalPrice}
          isSubmitting={isSubmitting}
        />
      </form>
    </div>
  );
};

export default NewShipmentPage;
