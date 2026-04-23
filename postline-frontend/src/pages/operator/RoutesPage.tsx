/* AI STYLE AUDIT
- Зменшити кількість сильних декоративних ефектів (sticky panel, dashed timeline, численні анімації): еталон HomePage візуально спокійніший.
- Привести заголовок/опис до стандарту HomePage: менше технічного noise, більше чистої типографічної ієрархії.
- Кнопки станів (`amber`, `black`, `rose`) залишати лише як семантичні винятки; базовий action має бути в `pine`.
- Уніфікувати радіуси: `rounded-[32px]` та `rounded-[28px]` привести до еталонних `rounded-3xl/2xl` для консистентності системи.
- Перевірити mobile UX drag-and-drop списку: у еталоні блоки адаптуються м'якше, без перевантаження інтерактивом.
*/
import { useState, useRef } from 'react';
import { 
  Route, 
  GripVertical, 
  MapPin, 
  Truck, 
  CheckCircle, 
  AlertCircle, 
  RefreshCcw, 
  
} from 'lucide-react';

// --- ТИПИ ---
type RouteStatus = 'planning' | 'active' | 'results' | 'finished';

interface ShipmentNode {
  id: string;
  address: string;
  customer: string;
  coords?: { lat: number; lng: number }; // Req15
  deliveryResult?: 'delivered' | 'failed' | null; // Req18
  failReason?: string;
  nextAction?: 'retry' | 'pickup';
}

const initialShipments: ShipmentNode[] = [
  { id: 'PL-501', address: 'вул. Хрещатик, 22', customer: 'Іваненко І.І.' },
  { id: 'PL-502', address: 'вул. Велика Васильківська, 100', customer: 'Петренко О.М.' },
  { id: 'PL-503', address: 'проспект Перемоги, 45', customer: 'Сидоренко В.В.' },
  { id: 'PL-504', address: 'Подільський узвіз, 8', customer: 'Коваленко А.А.' },
];

const RoutesPage = () => {
  const [status, setStatus] = useState<RouteStatus>('planning');
  const [route, setRoute] = useState<ShipmentNode[]>(initialShipments);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Рефи для Drag and Drop (Req17)
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // --- ЛОГІКА Req15 & Req16: Оптимізація ---
  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      const optimizedRoute = [...route].map((item, index) => ({
        ...item,
        coords: { lat: 50.45 + index * 0.01, lng: 30.52 + index * 0.01 }
      })).sort((a, b) => a.id.localeCompare(b.id));
      
      setRoute(optimizedRoute);
      setIsOptimizing(false);
    }, 1200);
  };

  // --- ЛОГІКА Req17: Drag and Drop ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragItem.current = index;
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.4';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const _route = [...route];
      const draggedItemContent = _route.splice(dragItem.current, 1)[0];
      _route.splice(dragOverItem.current, 0, draggedItemContent);
      setRoute(_route);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // --- ЛОГІКА Req18: Типобезпечне оновлення (БЕЗ ANY) ---
  const updateResult = <K extends keyof ShipmentNode>(
    index: number, 
    field: K, 
    value: ShipmentNode[K]
  ) => {
    setRoute(prev => {
      const newRoute = [...prev];
      const updatedNode = { ...newRoute[index], [field]: value };

      // Очищення полів при успішній доставці
      if (field === 'deliveryResult' && value === 'delivered') {
        delete updatedNode.failReason;
        delete updatedNode.nextAction;
      }

      newRoute[index] = updatedNode;
      return newRoute;
    });
  };

  const allResultsFilled = route.every(r => 
    r.deliveryResult === 'delivered' || 
    (r.deliveryResult === 'failed' && r.failReason && r.nextAction)
  );

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 animate-in fade-in duration-700 pb-12 px-4">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Route className="text-pine" size={36} /> Планування
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            Управління логістикою та кур'єрськими листами
          </p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-2xl border border-slate-200">
           <div className={`w-2 h-2 rounded-full animate-pulse ${status === 'active' ? 'bg-amber-500' : 'bg-pine'}`} />
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{status}</span>
        </div>
      </div>

      {/* CONTROL PANEL */}
      <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[32px] shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 sticky top-6 z-30 ring-1 ring-black/5">
        <div className="space-y-1">
          <h2 className="text-lg font-black text-slate-800 leading-none">
            {status === 'planning' && 'Формування черги'}
            {status === 'active' && 'Маршрут виконується'}
            {status === 'results' && 'Обробка результатів'}
            {status === 'finished' && 'Звіт сформовано'}
          </h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
            {status === 'planning' && 'Впорядкуйте зупинки кур\'єра'}
            {status === 'active' && 'Список заблоковано для редагування'}
            {status === 'results' && 'Вкажіть статус для кожної ТТН'}
            {status === 'finished' && 'Всі дані внесені в систему'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {status === 'planning' && (
            <>
              <button 
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="flex-1 md:flex-none px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-2xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest disabled:opacity-50"
              >
                {isOptimizing ? <RefreshCcw className="animate-spin" size={16} /> : <MapPin size={16} />}
                Оптимізувати
              </button>
              <button 
                onClick={() => setStatus('active')}
                className="flex-1 md:flex-none px-6 py-3.5 bg-pine hover:bg-pine/90 text-white font-black rounded-2xl transition-all shadow-lg shadow-pine/20 flex items-center justify-center gap-2 text-xs uppercase tracking-widest active:scale-95"
              >
                <CheckCircle size={16} /> Підтвердити
              </button>
            </>
          )}

          {status === 'active' && (
            <button 
              onClick={() => setStatus('results')}
              className="w-full md:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-xs uppercase tracking-widest active:scale-95"
            >
              <Truck size={18} /> Прийняти звіт кур'єра
            </button>
          )}

          {status === 'results' && (
            <button 
              onClick={() => setStatus('finished')}
              disabled={!allResultsFilled}
              className={`w-full md:w-auto px-8 py-3.5 font-black rounded-2xl transition-all text-xs uppercase tracking-widest ${
                allResultsFilled 
                  ? 'bg-slate-900 text-white hover:bg-black active:scale-95 shadow-xl' 
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200'
              }`}
            >
              Закрити маніфест
            </button>
          )}
        </div>
      </div>

      {/* ROUTE LIST */}
      <div className="relative pl-4 md:pl-10">
        {/* Connecting Line */}
        <div className="absolute top-10 bottom-10 left-[34px] md:left-[58px] w-[2px] bg-gradient-to-b from-pine/20 via-slate-200 to-transparent z-0 border-l border-dashed border-slate-300"></div>

        <div className="space-y-6">
          {route.map((item, index) => (
            <div 
              key={item.id}
              draggable={status === 'planning'}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={() => (dragOverItem.current = index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`relative z-10 flex items-start gap-6 group transition-all ${
                status === 'planning' ? 'cursor-grab active:cursor-grabbing' : ''
              }`}
            >
              {/* Timeline Indicator */}
              <div className="mt-4 flex-shrink-0 relative">
                <div className={`w-10 h-10 rounded-2xl border-4 border-white flex items-center justify-center shadow-md transition-all duration-500 ${
                  status === 'planning' ? 'bg-white text-slate-300 group-hover:text-pine group-hover:scale-110' : 
                  item.deliveryResult === 'delivered' ? 'bg-emerald-500 text-white rotate-[360deg]' :
                  item.deliveryResult === 'failed' ? 'bg-rose-500 text-white' :
                  'bg-pine text-white'
                }`}>
                  {status === 'planning' ? <GripVertical size={18} /> : <span className="text-sm font-black">{index + 1}</span>}
                </div>
              </div>

              {/* Card */}
              <div className={`flex-1 bg-white p-6 rounded-[28px] border transition-all duration-300 ${
                item.deliveryResult === 'delivered' ? 'border-emerald-200 bg-emerald-50/20 shadow-emerald-100/50 shadow-inner' :
                item.deliveryResult === 'failed' ? 'border-rose-200 bg-rose-50/20' :
                'border-slate-200 hover:border-pine/30 hover:shadow-xl hover:shadow-slate-200/50'
              }`}>
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black tracking-widest uppercase border border-slate-200/50">
                        {item.id}
                      </span>
                      {item.coords && (
                        <div className="flex items-center gap-1.5 text-pine animate-in fade-in zoom-in">
                          <div className="w-1.5 h-1.5 bg-pine rounded-full animate-ping" />
                          <span className="text-[10px] font-black uppercase tracking-tighter">Geo Linked</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight">{item.address}</h3>
                    <div className="flex items-center gap-2 text-slate-400">
                       <div className="w-5 h-5 bg-slate-50 rounded-md flex items-center justify-center border border-slate-100">
                         <CheckCircle size={12} className="text-slate-300" />
                       </div>
                       <p className="text-sm font-bold tracking-tight">
                         Одержувач: <span className="text-slate-600">{item.customer}</span>
                       </p>
                    </div>
                  </div>

                  {/* ACTION SECTION (Req18) */}
                  {status === 'results' && (
                    <div className="w-full lg:w-72 space-y-3 animate-in slide-in-from-right-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => updateResult(index, 'deliveryResult', 'delivered')}
                          className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                            item.deliveryResult === 'delivered' ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Вручено
                        </button>
                        <button 
                          onClick={() => updateResult(index, 'deliveryResult', 'failed')}
                          className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                            item.deliveryResult === 'failed' ? 'bg-rose-500 border-rose-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Відмова
                        </button>
                      </div>

                      {item.deliveryResult === 'failed' && (
                        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                          <select 
                            value={item.failReason || ''}
                            onChange={(e) => updateResult(index, 'failReason', e.target.value)}
                            className="w-full px-4 py-3 bg-rose-50/50 border border-rose-100 focus:border-rose-300 focus:ring-0 outline-none rounded-xl text-xs font-bold text-rose-900 appearance-none"
                          >
                            <option value="" disabled>Оберіть причину...</option>
                            <option value="Немає на місці">Клієнта немає на місці</option>
                            <option value="Відмова від отримання">Відмова від отримання</option>
                            <option value="Помилка в адресі">Помилка в адресі</option>
                          </select>

                          <div className="flex gap-2">
                            <button 
                              onClick={() => updateResult(index, 'nextAction', 'retry')}
                              className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase border transition-all ${
                                item.nextAction === 'retry' ? 'bg-slate-800 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                              }`}
                            >
                              Повтор завтра
                            </button>
                            <button 
                              onClick={() => updateResult(index, 'nextAction', 'pickup')}
                              className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase border transition-all ${
                                item.nextAction === 'pickup' ? 'bg-slate-800 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                              }`}
                            >
                              Самовивіз
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* FINAL STATUS VIEW */}
                  {status === 'finished' && item.deliveryResult && (
                    <div className="flex flex-col justify-center items-end text-right">
                       {item.deliveryResult === 'delivered' ? (
                         <div className="flex flex-col items-end gap-1">
                            <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-black tracking-widest flex items-center gap-2">
                              <CheckCircle size={14} /> УСПІШНО ДОСТАВЛЕНО
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">14:45 • Підпис отримано</span>
                         </div>
                       ) : (
                         <div className="space-y-1.5">
                            <span className="px-4 py-2 bg-rose-100 text-rose-700 rounded-xl text-[10px] font-black tracking-widest flex items-center gap-2">
                              <AlertCircle size={14} /> НЕ ВДАЛОСЯ ВРУЧИТИ
                            </span>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                              {item.failReason} <span className="text-slate-300 mx-1">|</span> {item.nextAction === 'retry' ? 'ПОВТОРНА СПРОБА' : 'ПОВЕРНЕННЯ'}
                            </p>
                         </div>
                       )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoutesPage;