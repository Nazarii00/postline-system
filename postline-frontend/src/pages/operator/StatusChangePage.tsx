/* AI STYLE AUDIT
- Сканер-панель з `text-lg font-black tracking-widest uppercase` виглядає занадто "агресивно"; еталон має м'якший типографічний тон.
- Уніфікувати кольорові акценти у статусах: `pine` як базовий, `emerald/rose/amber` лише як семантичні винятки.
- Привести зовнішні відступи та ширини блоків до HomePage-патерну секцій (`px-6 md:px-10`, більш передбачуваний `max-w`).
- Зменшити кількість різних розмірів шрифтів (`text-[10px]`, `text-xs`, `text-sm`) для більш чистого hierarchy.
- Карта "історія" має наслідувати стиль еталонних карток: менше дрібних декоративних відмінностей, стабільні border/shadow.
*/
import { useState } from 'react';
import { ScanLine, AlertCircle, CheckCircle2, History, ArrowRight, Package, ArrowRightCircle } from 'lucide-react';

// Мокові дані для імітації БД
const OPERATOR_BRANCH = '1';

// Req8: Сувора послідовність статусів
const STATUS_FLOW = [
  'Створено',
  'Прийнято',
  'В дорозі',
  'Готове до видачі',
  'Видано'
];

type Shipment = {
  id: string;
  status: string;
  branch: string;
};

const mockDatabase: Record<string, Shipment> = {
  'PL-100': { id: 'PL-100', status: 'Створено', branch: '1' },
  'PL-200': { id: 'PL-200', status: 'Прийнято', branch: '2' }, // Чуже
  'PL-300': { id: 'PL-300', status: 'Готове до видачі', branch: '1' },
  'PL-400': { id: 'PL-400', status: 'Видано', branch: '1' },
};

type HistoryItem = {
  id: string;
  newStatus: string;
  time: string;
};

const StatusChangePage = () => {
  const [trackingInput, setTrackingInput] = useState('');
  const [scannedShipment, setScannedShipment] = useState<Shipment | null>(null);
  const [newStatus, setNewStatus] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([
    { id: 'PL-098', newStatus: 'Готове до видачі', time: '14:22' },
    { id: 'PL-099', newStatus: 'Прийнято', time: '14:15' }
  ]);

  const labelClass = "block text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1.5";
  const getBadgeClass = (status: string) => {
    if (status === 'Видано') return 'bg-emerald-100 text-emerald-700';
    if (status === 'Готове до видачі') return 'bg-blue-100 text-blue-700';
    if (status === 'В дорозі') return 'bg-amber-100 text-amber-700';
    return 'bg-slate-100 text-slate-700';
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setSuccess(null);
    setNewStatus('');
    
    const formattedInput = trackingInput.trim().toUpperCase();
    if (!formattedInput) return;

    const shipment = mockDatabase[formattedInput];

    if (!shipment) {
      setScannedShipment(null);
      setError('Відправлення з таким трекінг-номером не знайдено.');
      return;
    }

    if (shipment.branch !== OPERATOR_BRANCH) {
      setScannedShipment(null);
      setError(`Відмовлено. Відправлення належить Відділенню №${shipment.branch}, ви не можете змінити його статус.`);
      return;
    }

    setScannedShipment(shipment);
    setTrackingInput(''); // Очищуємо поле після успішного пошуку для зручності
  };

  const getAvailableNextStatuses = (currentStatus: string) => {
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === STATUS_FLOW.length - 1) return [];
    return STATUS_FLOW.slice(currentIndex + 1);
  };

  const handleApplyStatus = () => {
    if (!scannedShipment || !newStatus) return;

    mockDatabase[scannedShipment.id].status = newStatus;
    const timeString = new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
    
    setHistory(prev => [{ id: scannedShipment.id, newStatus, time: timeString }, ...prev]);
    setSuccess(`Статус ${scannedShipment.id} успішно змінено на "${newStatus}". Сповіщення надіслано.`);
    setScannedShipment(null);
  };

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
          Управління статусами
        </h1>
        <p className="text-slate-500 text-sm md:text-base mt-2">
          Швидке оновлення стану відправлень за допомогою сканера або ручного вводу.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Головна робоча зона (Ліворуч, 8 колонок) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Блок 1: Компактна панель сканера */}
          <div className="bg-white/80 backdrop-blur p-4 rounded-3xl shadow-sm border border-slate-200 hover:border-pine/30 transition-all">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl ml-1">
                <ScanLine size={24} />
              </div>
              <input 
                type="text" 
                autoFocus
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="ВІДСКАНУЙТЕ АБО ВВЕДІТЬ ТТН (PL-...)" 
                className="flex-1 bg-transparent border-none focus:ring-0 outline-none px-4 py-3 text-lg font-black tracking-widest uppercase text-slate-800 placeholder:text-slate-300 placeholder:font-bold"
              />
              <button 
                type="submit"
                className="px-6 py-4 bg-slate-100 hover:bg-pine hover:text-white text-slate-600 font-bold rounded-2xl transition-all active:scale-95 text-sm"
              >
                Знайти
              </button>
            </form>
          </div>

          {/* Сповіщення (з'являються між блоками, не ламаючи структуру) */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
              <AlertCircle size={20} className="text-rose-500 shrink-0" />
              <p className="text-sm font-bold text-rose-700">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
              <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
              <p className="text-sm font-bold text-emerald-800">{success}</p>
            </div>
          )}

          {/* Блок 2: Картка активного відправлення (З'являється тільки при знахідці) */}
          {scannedShipment && (
            <div className="bg-white/90 backdrop-blur p-6 md:p-8 rounded-3xl shadow-sm border border-pine/20 animate-in slide-in-from-bottom-4 fade-in duration-300">
              
              {/* Шапка картки */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pine/10 text-pine rounded-2xl flex items-center justify-center">
                    <Package size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Знайдено відправлення</p>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">{scannedShipment.id}</h2>
                  </div>
                </div>
              </div>

              {/* Візуальний потік зміни статусу */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-4 md:gap-6 mb-8 relative">
                
                {/* Поточний стан */}
                <div className="flex-1 w-full bg-white p-5 rounded-2xl border border-slate-200 opacity-70">
                  <span className={labelClass}>Поточний статус</span>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${scannedShipment.status === 'Видано' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    <span className="font-bold text-slate-600">{scannedShipment.status}</span>
                  </div>
                </div>

                {/* Стрілка переходу */}
                <div className="hidden md:flex text-slate-300 flex-shrink-0">
                  <ArrowRightCircle size={32} />
                </div>
                <div className="md:hidden flex text-slate-300 flex-shrink-0 rotate-90 my-[-10px]">
                  <ArrowRightCircle size={24} />
                </div>

                {/* Новий стан */}
                <div className="flex-1 w-full bg-white p-5 rounded-2xl border-2 border-pine/20 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-pine"></div>
                  <span className={labelClass}>Встановити новий</span>
                  
                  {getAvailableNextStatuses(scannedShipment.status).length > 0 ? (
                    <select 
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full mt-2 bg-transparent border-none focus:ring-0 outline-none text-base font-black text-pine cursor-pointer appearance-none p-0"
                    >
                      <option value="" disabled>Оберіть наступний крок...</option>
                      {getAvailableNextStatuses(scannedShipment.status).map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="mt-2 text-base font-black text-emerald-600">
                      Фінальний статус
                    </div>
                  )}
                </div>
              </div>

              {/* Кнопка дії */}
              <div className="flex justify-end">
                {getAvailableNextStatuses(scannedShipment.status).length > 0 ? (
                  <button 
                    onClick={handleApplyStatus}
                    disabled={!newStatus}
                    className={`px-8 py-4 font-black rounded-2xl transition-all flex items-center justify-center gap-3 text-sm tracking-wide ${
                      newStatus 
                        ? 'bg-pine text-white shadow-md hover:bg-pine/90 hover:shadow-lg active:scale-95' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    ПІДТВЕРДИТИ ЗМІНУ <ArrowRight size={18} />
                  </button>
                ) : (
                  <button 
                    onClick={() => setScannedShipment(null)}
                    className="px-8 py-4 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold rounded-2xl transition-all active:scale-95 text-sm"
                  >
                    Закрити картку
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Бічна колонка: Історія (Праворуч, 4 колонки) */}
        <div className="lg:col-span-4">
          <div className="bg-white/80 backdrop-blur p-6 rounded-3xl shadow-sm border border-slate-200 sticky top-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-pine/5 text-pine rounded-xl">
                <History size={20} />
              </div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Історія</h3>
            </div>
            
            <div className="space-y-4">
              {history.length > 0 ? (
                history.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="group p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-pine/20 transition-all cursor-default">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-black text-slate-800 text-sm group-hover:text-pine transition-colors">{item.id}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{item.time}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">Статус:</span>
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${getBadgeClass(item.newStatus)}`}>
                        {item.newStatus}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
                  <p className="text-sm font-bold text-slate-400">Історія порожня</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StatusChangePage;