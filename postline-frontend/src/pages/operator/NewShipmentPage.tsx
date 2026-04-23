import { useState } from 'react';
import { User, Phone, MapPin, Package, Scale, Shield, CheckCircle, Printer, RefreshCcw, ArrowRight } from 'lucide-react';

// Типізація форми
interface FormData {
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  receiverCity: string;
  receiverBranch: string;
  type: string;
  weight: string;
  declaredValue: string;
  length: string;
  width: string;
  height: string;
  description: string;
}

const initialFormState: FormData = {
  senderName: '', senderPhone: '+380',
  receiverName: '', receiverPhone: '+380', receiverCity: '', receiverBranch: '',
  type: 'Посилка', weight: '', declaredValue: '',
  length: '', width: '', height: '', description: ''
};

const NewShipmentPage = () => {
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [isCourier, setIsCourier] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedTracking, setGeneratedTracking] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target;

    if (name === 'senderPhone' || name === 'receiverPhone') {
      value = value.replace(/[^\d+]/g, '');
      if (value.indexOf('+') > 0) {
        value = value.replace(/\+/g, '');
        value = '+' + value;
      }
      if (value.length > 13) value = value.substring(0, 13);
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    // Очищаємо помилки (і фронтові, і бекендові мапінги) при зміні
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      if (name === 'length') delete newErrors['lengthCm'];
      if (name === 'width') delete newErrors['widthCm'];
      if (name === 'height') delete newErrors['heightCm'];
      if (name === 'weight') delete newErrors['weightKg'];
      if (name === 'type') delete newErrors['shipmentType'];
      return newErrors;
    });
    
    if (apiError) setApiError(null);
  };

  const preventInvalidNumberInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const weightNum = Number(formData.weight) || 0;
  const declaredValueNum = Number(formData.declaredValue) || 0;
  
  const basePrice = 80;
  const weightSurcharge = weightNum > 2 ? Math.ceil(weightNum - 2) * 10 : 0;
  const courierPrice = isCourier ? 20 : 0;
  const insurance = declaredValueNum > 500 ? Math.round(declaredValueNum * 0.005) : 0;
  const totalPrice = basePrice + weightSurcharge + courierPrice + insurance;


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const requiredFields: (keyof FormData)[] = [
      'senderName', 'senderPhone', 'receiverName', 'receiverPhone', 
      'receiverCity', 'receiverBranch', 'weight', 'length', 'width', 'height'
    ];

    requiredFields.forEach(field => {
      if (!formData[field] || Number(formData[field]) === 0) {
        newErrors[field] = "Обов'язкове поле";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setApiError("Будь ласка, заповніть всі обов'язкові поля.");
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      // 1. Мапимо українські типи у ті, які чекає бекенд
      const typeMapping: Record<string, string> = {
        "Посилка": "parcel",
        "Документи": "letter",
        "Вантаж": "package"
      };

      // 2. Збираємо Payload СУВОРО за правилами express-validator
      const payload = {
        senderId: 1, // Хардкод, поки немає реальної авторизації
        receiverId: 2,
        originDeptId: 1,
        destDeptId: Number(formData.receiverBranch) || 1,
        tariffId: 1,

        shipmentType: typeMapping[formData.type] || "parcel",
        sizeCategory: "M", // За замовчуванням
        
        weightKg: Number(formData.weight),
        lengthCm: Number(formData.length),
        widthCm: Number(formData.width),
        heightCm: Number(formData.height),
        
        // Бекенд вимагає ці поля, тому формуємо їх з того, що маємо
        senderAddress: formData.senderName ? "Адреса відправника за замовчуванням" : "", 
        receiverAddress: `${formData.receiverCity}, Відділення №${formData.receiverBranch}`,
        
        declaredValue: Number(formData.declaredValue) || 0,
        description: formData.description || "Відправлення",
        isCourier: isCourier
      };

      const token = localStorage.getItem('token'); 

      const response = await fetch('http://localhost:3000/api/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.errors && typeof responseData.errors === 'object') {
          setErrors(responseData.errors);
          setApiError(responseData.message || "У формі є помилки. Перевірте виділені поля.");
          return; 
        }
        throw new Error(responseData.message || 'Помилка при створенні відправлення');
      }
      
      setGeneratedTracking(responseData.trackingNumber || responseData.data?.tracking_number || 'TRACKING_NOT_FOUND'); 
      
    } catch (error: any) {
      console.error('API Error:', error);
      setApiError(error.message || 'Сталася помилка при з\'єднанні з сервером');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setIsCourier(false);
    setGeneratedTracking(null);
    setErrors({});
    setApiError(null);
  };

  // Розумна перевірка наявності помилки (враховує назви з бекенду)
  const checkHasError = (field: keyof FormData) => {
    const backendField = field === 'length' ? 'lengthCm' : 
                         field === 'width' ? 'widthCm' : 
                         field === 'height' ? 'heightCm' : 
                         field === 'weight' ? 'weightKg' : 
                         field === 'type' ? 'shipmentType' : field;
    return !!(errors[field] || errors[backendField]);
  };

  const getInputClass = (field: keyof FormData) => `w-full px-4 py-3.5 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-pine/20 focus:bg-white transition-all text-sm font-medium ${
    checkHasError(field) ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30' : 'border-slate-200 focus:border-pine'
  }`;

  const labelClass = "block text-xs uppercase tracking-wider text-slate-500 font-black mb-2";

  // Розумний вивід тексту помилки
  const ErrorMsg = ({ field }: { field: keyof FormData }) => {
    const backendField = field === 'length' ? 'lengthCm' : 
                         field === 'width' ? 'widthCm' : 
                         field === 'height' ? 'heightCm' : 
                         field === 'weight' ? 'weightKg' : 
                         field === 'type' ? 'shipmentType' : field;
    
    const errorText = errors[field] || errors[backendField];

    if (!errorText) return null;

    return (
      <p className="text-rose-500 text-[10px] font-bold mt-1 leading-tight italic">
        {errorText}
      </p>
    );
  };

  if (generatedTracking) {
    return (
      <div className="max-w-2xl mx-auto w-full mt-10 animate-in zoom-in-95 duration-500">
        <div className="bg-white/80 backdrop-blur rounded-3xl border border-slate-200 shadow-sm p-10 text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Відправлення зареєстровано</h2>
          <p className="text-slate-500 text-base mb-8">Дані успішно внесено в базу. Ваш трекінг-номер:</p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 mb-10 inline-block">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-black mb-2">Трекінг-номер</p>
            <p className="text-4xl font-black text-pine tracking-tight">{generatedTracking}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-2xl transition-all text-sm active:scale-95">
              <Printer size={18} /> Друк ТТН
            </button>
            <button 
              onClick={resetForm}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-pine hover:bg-pine/90 text-white font-bold rounded-2xl shadow-sm transition-all active:scale-95 text-sm"
            >
              <RefreshCcw size={18} /> Нова реєстрація
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
          Створення відправлення
        </h1>
        <p className="text-slate-500 text-sm md:text-base mt-2">
          Внесіть дані відправника, одержувача та параметри посилки для генерації ТТН.
        </p>
      </div>

      {apiError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl font-bold animate-in slide-in-from-top-2">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        <div className="bg-white/80 backdrop-blur p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 hover:border-slate-300 transition-all space-y-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Відправник */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-pine/5 text-pine rounded-2xl">
                  <User size={20} />
                </div>
                <h2 className="text-lg font-black text-slate-800 tracking-tight">Відправник</h2>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Ім'я та прізвище <span className="text-rose-500">*</span></label>
                  <input type="text" name="senderName" value={formData.senderName} onChange={handleChange} placeholder="ПІБ відправника" className={getInputClass('senderName')} />
                  <ErrorMsg field="senderName" />
                </div>
                <div>
                  <label className={labelClass}>Телефон <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <Phone size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${checkHasError('senderPhone') ? 'text-rose-500' : 'text-slate-400'}`} />
                    <input type="tel" name="senderPhone" value={formData.senderPhone} onChange={handleChange} placeholder="+380..." className={`${getInputClass('senderPhone')} pl-12`} />
                  </div>
                  <ErrorMsg field="senderPhone" />
                </div>
              </div>
            </section>

            {/* Одержувач */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-pine/5 text-pine rounded-2xl">
                  <MapPin size={20} />
                </div>
                <h2 className="text-lg font-black text-slate-800 tracking-tight">Одержувач</h2>
              </div>
              
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Ім'я та прізвище <span className="text-rose-500">*</span></label>
                    <input type="text" name="receiverName" value={formData.receiverName} onChange={handleChange} placeholder="ПІБ одержувача" className={getInputClass('receiverName')} />
                    <ErrorMsg field="receiverName" />
                  </div>
                  <div>
                    <label className={labelClass}>Телефон <span className="text-rose-500">*</span></label>
                    <input type="tel" name="receiverPhone" value={formData.receiverPhone} onChange={handleChange} placeholder="+380..." className={getInputClass('receiverPhone')} />
                    <ErrorMsg field="receiverPhone" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Місто <span className="text-rose-500">*</span></label>
                    <input type="text" name="receiverCity" value={formData.receiverCity} onChange={handleChange} placeholder="Напр: Київ" className={getInputClass('receiverCity')} />
                    <ErrorMsg field="receiverCity" />
                  </div>
                  <div>
                    <label className={labelClass}>Відділення <span className="text-rose-500">*</span></label>
                    <select name="receiverBranch" value={formData.receiverBranch} onChange={handleChange} className={getInputClass('receiverBranch')}>
                      <option value="">Оберіть...</option>
                      <option value="1">Відділення №1</option>
                      <option value="2">Відділення №2</option>
                    </select>
                    <ErrorMsg field="receiverBranch" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="w-full h-px bg-slate-200"></div>

          {/* Параметри */}
          <section className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-pine/5 text-pine rounded-2xl">
                <Package size={20} />
              </div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">Параметри посилки</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className={labelClass}>Тип <span className="text-rose-500">*</span></label>
                  <select name="type" value={formData.type} onChange={handleChange} className={getInputClass('type')}>
                    <option value="Посилка">Посилка</option>
                    <option value="Документи">Документи</option>
                    <option value="Вантаж">Вантаж</option>
                  </select>
                  <ErrorMsg field="type" />
                </div>
                <div>
                  <label className={labelClass}>
                    <span className="flex items-center gap-1.5"><Scale size={14} className="text-pine"/> Вага (кг) <span className="text-rose-500">*</span></span>
                  </label>
                  <input type="number" step="0.1" min="0.1" name="weight" value={formData.weight} onChange={handleChange} onKeyDown={preventInvalidNumberInput} placeholder="0.0" className={getInputClass('weight')} />
                  <ErrorMsg field="weight" />
                </div>
                <div>
                  <label className={labelClass}>
                    <span className="flex items-center gap-1.5"><Shield size={14} className="text-pine"/> Оголошена цінність</span>
                  </label>
                  <input type="number" min="0" name="declaredValue" value={formData.declaredValue} onChange={handleChange} onKeyDown={preventInvalidNumberInput} placeholder="0" className={getInputClass('declaredValue')} />
                  <ErrorMsg field="declaredValue" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2">
                  <label className={labelClass}>Габарити (см) <span className="text-rose-500">*</span></label>
                  <div className={`grid grid-cols-3 gap-4 p-4 rounded-2xl border transition-all ${
                    checkHasError('length') || checkHasError('width') || checkHasError('height') ? 'bg-rose-50/50 border-rose-300 shadow-sm' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">Довжина</p>
                      <input type="number" min="1" name="length" value={formData.length} onChange={handleChange} onKeyDown={preventInvalidNumberInput} placeholder="0" className={`w-full bg-transparent border-b ${checkHasError('length') ? 'border-rose-400 text-rose-600' : 'border-slate-300'} focus:border-pine outline-none text-base py-1 font-bold transition-colors`} />
                      <ErrorMsg field="length" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">Ширина</p>
                      <input type="number" min="1" name="width" value={formData.width} onChange={handleChange} onKeyDown={preventInvalidNumberInput} placeholder="0" className={`w-full bg-transparent border-b ${checkHasError('width') ? 'border-rose-400 text-rose-600' : 'border-slate-300'} focus:border-pine outline-none text-base py-1 font-bold transition-colors`} />
                      <ErrorMsg field="width" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">Висота</p>
                      <input type="number" min="1" name="height" value={formData.height} onChange={handleChange} onKeyDown={preventInvalidNumberInput} placeholder="0" className={`w-full bg-transparent border-b ${checkHasError('height') ? 'border-rose-400 text-rose-600' : 'border-slate-300'} focus:border-pine outline-none text-base py-1 font-bold transition-colors`} />
                      <ErrorMsg field="height" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-start">
                  <label className="flex items-center mt-7 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer group hover:border-pine/30 transition-all h-[76px]">
                    <input 
                      type="checkbox" checked={isCourier} onChange={(e) => setIsCourier(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-pine focus:ring-pine transition-all cursor-pointer accent-pine flex-shrink-0" 
                    />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-pine transition-colors leading-tight">
                      Кур'єр до дверей<br/>
                      <span className="text-xs text-slate-500 font-medium group-hover:text-pine/70">+20 грн до тарифу</span>
                    </span>
                  </label>
                </div>
              </div>

            </div>
          </section>
        </div>

        {/* Блок розрахунку */}
        <div className="bg-pine rounded-3xl p-6 md:p-8 text-white shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
          
          <div className="w-full lg:w-auto flex-1 flex flex-wrap gap-x-10 gap-y-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/60 font-bold mb-1.5">Базовий тариф</p>
              <p className="text-lg font-black">{basePrice} <span className="text-sm font-medium text-white/70">грн</span></p>
            </div>
            {weightSurcharge > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-white/60 font-bold mb-1.5">За вагу</p>
                <p className="text-lg font-black">+{weightSurcharge} <span className="text-sm font-medium text-white/70">грн</span></p>
              </div>
            )}
            {isCourier && (
              <div>
                <p className="text-xs uppercase tracking-widest text-emerald-400/80 font-bold mb-1.5">Кур'єр</p>
                <p className="text-lg font-black text-emerald-400">+20 <span className="text-sm font-medium text-emerald-400/70">грн</span></p>
              </div>
            )}
            {insurance > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-white/60 font-bold mb-1.5">Страховка</p>
                <p className="text-lg font-black">+{insurance} <span className="text-sm font-medium text-white/70">грн</span></p>
              </div>
            )}
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-6 lg:border-l lg:border-white/10 lg:pl-10">
            <div className="text-center sm:text-right w-full sm:w-auto">
              <p className="text-xs uppercase tracking-widest text-white/60 font-bold mb-1">Загальна сума</p>
              <p className="text-4xl font-black tracking-tight">{totalPrice} <span className="text-xl font-bold text-white/70">грн</span></p>
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-8 py-4 bg-white text-pine font-black rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap ${
                isSubmitting ? 'opacity-80 cursor-wait' : 'hover:bg-slate-50'
              }`}
            >
              {isSubmitting ? (
                <RefreshCcw size={20} className="animate-spin text-pine" />
              ) : (
                <ArrowRight size={20} className="text-pine" />
              )}
              {isSubmitting ? 'ОБРОБКА...' : 'СТВОРИТИ ТТН'}
            </button>
          </div>

        </div>

      </form>
    </div>
  );
};

export default NewShipmentPage;