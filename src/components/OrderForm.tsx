import { useState, useEffect, useRef } from 'react';
import type { SearchableItem, StoreMenu, OrderTopping } from '../types';

interface Props {
  item: SearchableItem;
  menu: StoreMenu;
  lastPersonName: string;
  onSubmit: (order: {
    personName: string;
    menuItemId: string;
    itemName: string;
    size: string;
    price: number;
    sweet: string;
    ice: string;
    toppings: OrderTopping[];
    quantity: number;
    note?: string;
  }) => void;
  onClose: () => void;
}

export default function OrderForm({ item, menu, lastPersonName, onSubmit, onClose }: Props) {
  const sizes = Object.entries(item.prices);
  const sweetOptions = item.sweetOptions ?? menu.defaultSweetOptions;
  const iceOptions = item.iceOptions ?? menu.defaultIceOptions;
  const toppings = item.toppings ?? menu.defaultToppings ?? [];

  const [personName, setPersonName] = useState(lastPersonName);
  const [size, setSize] = useState(sizes[0]?.[0] ?? 'M');
  const [sweet, setSweet] = useState(sweetOptions[0] ?? '正常');
  const [ice, setIce] = useState(iceOptions[0] ?? '正常冰');
  const [selectedToppings, setSelectedToppings] = useState<OrderTopping[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!personName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTopping = (topping: { name: string; price: number }) => {
    setSelectedToppings(prev => {
      const exists = prev.find(t => t.name === topping.name);
      if (exists) return prev.filter(t => t.name !== topping.name);
      return [...prev, { name: topping.name, price: topping.price }];
    });
  };

  const basePrice = item.prices[size] ?? 0;
  const toppingsTotal = selectedToppings.reduce((s, t) => s + t.price, 0);
  const subtotal = (basePrice + toppingsTotal) * quantity;

  const handleSubmit = () => {
    if (!personName.trim()) {
      nameInputRef.current?.focus();
      return;
    }
    onSubmit({
      personName: personName.trim(),
      menuItemId: item.id,
      itemName: item.name,
      size,
      price: basePrice,
      sweet,
      ice,
      toppings: selectedToppings,
      quantity,
      note: note.trim() || undefined,
    });
  };

  // Helper to color-code sweetness level selections
  const getSweetnessStyle = (option: string, isSelected: boolean) => {
    if (!isSelected) {
      return 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700/80';
    }
    // High sugar (10度, 正常, 全糖, 8度)
    if (option.includes('正常') || option.includes('全糖') || option.includes('10') || option.includes('8') || option.includes('七分')) {
      return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md shadow-amber-600/20';
    }
    // Zero sugar (無糖, 0)
    if (option.includes('無') || option.includes('0') || option.includes('零')) {
      return 'bg-gradient-to-r from-zinc-500 to-zinc-600 text-white shadow-md shadow-zinc-500/20';
    }
    // Medium sugar (半糖, 5度, 3度, 1度, 微糖)
    return 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md shadow-amber-400/20';
  };

  // Helper to color-code ice temperature selections
  const getIceStyle = (option: string, isSelected: boolean) => {
    if (!isSelected) {
      return 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700/80';
    }
    // Hot/Warm (熱, 溫)
    if (option.includes('熱') || option.includes('溫') || option.includes('暖')) {
      return 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/25';
    }
    // Zero ice (去冰)
    if (option.includes('去冰') || option.includes('完全去冰')) {
      return 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-500/25';
    }
    // Normal/More Ice (正常冰, 少冰, 微冰)
    if (option.includes('正常') || option.includes('多冰')) {
      return 'bg-gradient-to-r from-blue-600 to-indigo-650 text-white shadow-md shadow-blue-600/25';
    }
    return 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-md shadow-sky-400/25';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm animate-fade-in" />

      {/* Sheet Modal */}
      <div
        className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto bg-white dark:bg-zinc-900 
                   rounded-t-[30px] sm:rounded-[28px] p-6 pb-28 shadow-2xl animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Grab Handle for Mobile Sheet Drawer View */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-gray-200 dark:bg-zinc-800 sm:hidden"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5 mt-2.5 sm:mt-0">
          <div className="space-y-1">
            <span className="text-xs font-bold text-milk-600 dark:text-milk-400 px-2 py-0.5 rounded bg-milk-50 dark:bg-milk-950/20 border border-milk-200/20">
              {item.categoryName}
            </span>
            <h3 className="text-xl font-black text-gray-800 dark:text-zinc-100 flex items-center gap-1.5 pt-1">
              <span>🥤</span> {item.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 
                       text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5">
          {/* Person Name Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              👤 點餐人姓名 <span className="text-red-500 font-normal">*必填</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">👤</span>
              <input
                ref={nameInputRef}
                type="text"
                value={personName}
                onChange={e => setPersonName(e.target.value)}
                placeholder="請輸入取餐姓名，以區分飲料"
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm
                           text-gray-800 dark:text-zinc-100 placeholder:text-gray-400
                           focus:outline-none focus:ring-2 focus:ring-milk-400/40 focus:border-milk-400 focus:bg-white dark:focus:bg-zinc-800 transition-all duration-200"
              />
            </div>
          </div>

          {/* Sizes Customization */}
          {sizes.length > 1 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                📏 規格容量
              </label>
              <div className="flex gap-2">
                {sizes.map(([s, price]) => {
                  const isSelected = s === size;
                  return (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`flex-1 py-3 px-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer active:scale-98 flex flex-col items-center gap-0.5 border
                        ${isSelected
                          ? 'bg-gradient-to-r from-milk-500 to-milk-600 text-white shadow-md shadow-milk-500/20 border-transparent'
                          : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-800 border-gray-200 dark:border-zinc-800'
                        }`}
                    >
                      <span>{s} 杯</span>
                      <span className={`text-[10px] font-normal ${isSelected ? 'text-white/95' : 'text-gray-400'}`}>
                        ${price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sweetness Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              🍬 甜度客製化
            </label>
            <div className="grid grid-cols-3 gap-2">
              {sweetOptions.map(opt => {
                const isSelected = opt === sweet;
                return (
                  <button
                    key={opt}
                    onClick={() => setSweet(opt)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-98 border border-transparent
                      ${getSweetnessStyle(opt, isSelected)}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ice / Temperature Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              🧊 冰塊溫度
            </label>
            <div className="grid grid-cols-3 gap-2">
              {iceOptions.map(opt => {
                const isSelected = opt === ice;
                return (
                  <button
                    key={opt}
                    onClick={() => setIce(opt)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-98 border border-transparent
                      ${getIceStyle(opt, isSelected)}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toppings Grid Checkbox */}
          {toppings.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                ✨ 自由加料
              </label>
              <div className="grid grid-cols-2 gap-2">
                {toppings.map(tp => {
                  const isSelected = selectedToppings.some(t => t.name === tp.name);
                  return (
                    <button
                      key={tp.name}
                      onClick={() => toggleTopping(tp)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold text-left transition-all duration-200 cursor-pointer active:scale-98 border flex items-center justify-between
                        ${isSelected
                          ? 'bg-gradient-to-r from-tea-500 to-tea-600 text-white shadow-sm border-transparent'
                          : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-800 border-gray-200 dark:border-zinc-800'
                        }`}
                    >
                      <span className="truncate">{tp.name}</span>
                      <span className={`text-[10px] font-bold ${isSelected ? 'text-white' : 'text-milk-600 dark:text-milk-400'}`}>
                        +{tp.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stepper Quantity & Special Note */}
          <div className="flex gap-4 items-start pt-1.5">
            {/* Quantity select */}
            <div className="space-y-2 shrink-0">
              <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                🔢 數量
              </label>
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 p-1 rounded-xl border border-gray-200 dark:border-zinc-800">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center font-bold text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors shadow-sm cursor-pointer"
                  title="減少"
                >
                  −
                </button>
                <span className="text-sm font-extrabold text-gray-800 dark:text-zinc-200 w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center font-bold text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors shadow-sm cursor-pointer"
                  title="增加"
                >
                  +
                </button>
              </div>
            </div>

            {/* Note text field */}
            <div className="space-y-2 flex-1">
              <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                📝 特殊備註
              </label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="例如：不要塑膠袋、要提袋..."
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm
                           text-gray-800 dark:text-zinc-100 placeholder:text-gray-400
                           focus:outline-none focus:ring-2 focus:ring-milk-400/40 focus:border-milk-400 focus:bg-white dark:focus:bg-zinc-800 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Sticky Action Footer Button */}
        <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-zinc-900 dark:via-zinc-900/95 dark:to-transparent rounded-b-3xl">
          <button
            onClick={handleSubmit}
            className={`w-full py-3.5 rounded-xl font-extrabold text-sm text-white shadow-lg transition-all duration-200 active:scale-98 cursor-pointer flex justify-center items-center gap-1.5
              ${personName.trim() 
                ? 'bg-gradient-to-r from-milk-500 to-milk-600 hover:from-milk-600 hover:to-milk-700 shadow-milk-500/25 hover:shadow-milk-500/45' 
                : 'bg-zinc-400 dark:bg-zinc-700 text-zinc-200 cursor-not-allowed shadow-none'
              }`}
          >
            <span>加入團購訂單</span>
            <span>·</span>
            <span className="underline decoration-wavy">${subtotal}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
