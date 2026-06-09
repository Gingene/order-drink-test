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
    // Auto focus person name if empty
    if (!personName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto bg-white dark:bg-gray-900 
                   rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{item.name}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 
                       text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Person Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">👤 點餐人</label>
          <input
            ref={nameInputRef}
            type="text"
            value={personName}
            onChange={e => setPersonName(e.target.value)}
            placeholder="輸入姓名"
            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                       rounded-xl text-gray-800 dark:text-gray-100 placeholder:text-gray-400
                       focus:outline-none focus:ring-2 focus:ring-milk-400/50 focus:border-milk-400 transition-all"
          />
        </div>

        {/* Size */}
        {sizes.length > 1 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">📏 大小杯</label>
            <div className="flex gap-2">
              {sizes.map(([s, price]) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${s === size
                      ? 'bg-milk-500 text-white shadow-md shadow-milk-500/30'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  {s} · ${price}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sweet */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">🍬 甜度</label>
          <div className="flex flex-wrap gap-2">
            {sweetOptions.map(opt => (
              <button
                key={opt}
                onClick={() => setSweet(opt)}
                className={`px-3 py-2 rounded-xl text-sm transition-all duration-200
                  ${opt === sweet
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Ice */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">🧊 冰塊</label>
          <div className="flex flex-wrap gap-2">
            {iceOptions.map(opt => (
              <button
                key={opt}
                onClick={() => setIce(opt)}
                className={`px-3 py-2 rounded-xl text-sm transition-all duration-200
                  ${opt === ice
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Toppings */}
        {toppings.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">✨ 加料</label>
            <div className="flex flex-wrap gap-2">
              {toppings.map(tp => {
                const isSelected = selectedToppings.some(t => t.name === tp.name);
                return (
                  <button
                    key={tp.name}
                    onClick={() => toggleTopping(tp)}
                    className={`px-3 py-2 rounded-xl text-sm transition-all duration-200
                      ${isSelected
                        ? 'bg-tea-500 text-white shadow-md shadow-tea-500/30'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                  >
                    {tp.name} +${tp.price}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">🔢 數量</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-lg font-bold 
                         text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              −
            </button>
            <span className="text-xl font-bold text-gray-800 dark:text-gray-100 w-10 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-lg font-bold 
                         text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Note */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">📝 備註</label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="如：不要塑膠袋、需要提袋..."
            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                       rounded-xl text-gray-800 dark:text-gray-100 placeholder:text-gray-400
                       focus:outline-none focus:ring-2 focus:ring-milk-400/50 focus:border-milk-400 transition-all text-sm"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full py-3.5 bg-gradient-to-r from-milk-500 to-milk-600 hover:from-milk-600 hover:to-milk-700
                     text-white font-semibold rounded-xl shadow-lg shadow-milk-500/30 
                     hover:shadow-xl hover:shadow-milk-500/40
                     active:scale-[0.98] transition-all duration-200"
        >
          加入訂單 · ${subtotal}
        </button>
      </div>
    </div>
  );
}
