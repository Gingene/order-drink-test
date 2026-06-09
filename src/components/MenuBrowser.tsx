import { useState } from 'react';
import type { StoreMenu, SearchableItem, OrderTopping } from '../types';
import { useSearch } from '../hooks/useSearch';
import SearchBar from './SearchBar';
import CategoryTabs from './CategoryTabs';
import MenuItem from './MenuItem';
import OrderForm from './OrderForm';
import OrderList from './OrderList';
import OrderSummary from './OrderSummary';

interface Props {
  menu: StoreMenu;
  activeGroup: {
    items: { id: string; personName: string; menuItemId: string; itemName: string; size: string; price: number; sweet: string; ice: string; toppings: OrderTopping[]; quantity: number; note?: string; subtotal: number }[];
    totalAmount: number;
    totalCups: number;
  } | null;
  onAddItem: (item: {
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
  onRemoveItem: (id: string) => void;
  onBack: () => void;
  onCloseGroup: () => void;
  onStartGroup: () => void;
}

export default function MenuBrowser({
  menu, activeGroup, onAddItem, onRemoveItem, onBack, onCloseGroup, onStartGroup,
}: Props) {
  const { query, setQuery, activeCategory, setActiveCategory, results, categories, clearSearch } = useSearch(menu);
  const [selectedItem, setSelectedItem] = useState<SearchableItem | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [lastPersonName, setLastPersonName] = useState('');

  const handleAddOrder = (order: {
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
  }) => {
    if (!activeGroup) {
      onStartGroup();
    }
    setLastPersonName(order.personName);
    onAddItem(order);
    setSelectedItem(null);
  };

  const orderCount = activeGroup?.totalCups ?? 0;

  return (
    <div className="min-h-dvh pb-28">
      {/* Top Bar Header (Sleek Glassmorphism) */}
      <div className="sticky top-0 z-30 glass-panel-heavy border-b border-gray-200/80 dark:border-zinc-800/80 shadow-md shadow-gray-100/10 dark:shadow-black/20">
        <div className="max-w-lg mx-auto px-4 py-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={onBack}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-zinc-800 
                           text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700 active:scale-95 transition-all shrink-0 cursor-pointer"
                title="返回店家選擇"
              >
                ←
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">🧋</span>
                  <h2 className="text-lg font-extrabold text-gray-800 dark:text-zinc-100 truncate">
                    {menu.storeName}
                  </h2>
                </div>
                {activeGroup && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <span className="pulse-dot"></span>
                    團購揪團中 · 已點 {orderCount} 杯
                  </p>
                )}
              </div>
            </div>
            
            {/* Quick reset/close group link if group active */}
            {activeGroup && (
              <button
                onClick={onCloseGroup}
                className="text-xs font-semibold text-red-500 hover:text-red-600 dark:hover:text-red-400 py-1 px-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
              >
                結束此團
              </button>
            )}
          </div>

          <SearchBar
            query={query}
            onQueryChange={setQuery}
            onClear={clearSearch}
            resultCount={results.length}
          />

          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>
      </div>

      {/* Menu Items Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="space-y-3">
          {results.length === 0 ? (
            <div className="text-center py-16 bg-white/40 dark:bg-zinc-800/10 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800/80 animate-fade-in">
              <div className="text-4xl mb-3 animate-bounce">🔍</div>
              <p className="font-semibold text-gray-600 dark:text-zinc-300">找不到符合的飲品</p>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">換個關鍵字，例如「烏龍」或「厚奶」吧！</p>
            </div>
          ) : (
            results.map((item, idx) => (
              <div
                key={item.id}
                className="animate-slide-up"
                style={{ animationDelay: `${Math.min(idx * 40, 240)}ms`, animationFillMode: 'both' }}
              >
                <MenuItem item={item} onSelect={setSelectedItem} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Bottom Bar (Modern Pill Overlay Action Bar) */}
      <div className="fixed bottom-0 inset-x-0 z-20 pointer-events-none">
        <div className="max-w-lg mx-auto px-4 pb-5">
          <div className="flex gap-3 glass-panel p-2.5 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/60 pointer-events-auto border border-white/50 dark:border-zinc-800/80">
            {/* View Order Cart */}
            <button
              onClick={() => setShowOrders(!showOrders)}
              className="flex-1 py-3 px-4 bg-gray-50 dark:bg-zinc-800/80 hover:bg-gray-100 dark:hover:bg-zinc-700/80
                         rounded-xl font-bold text-xs text-gray-700 dark:text-zinc-200 
                         transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 relative cursor-pointer"
            >
              📋 團購訂單 ({orderCount} 杯)
              {orderCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full 
                                 flex items-center justify-center animate-bounce-in shadow-md shadow-red-500/20">
                  {orderCount}
                </span>
              )}
            </button>

            {/* Check Out Summary */}
            {orderCount > 0 && (
              <button
                onClick={() => setShowSummary(true)}
                className="py-3 px-5 bg-gradient-to-r from-milk-500 to-milk-600 
                           hover:from-milk-600 hover:to-milk-700
                           text-white font-bold text-xs rounded-xl shadow-md shadow-milk-500/20
                           hover:shadow-lg hover:shadow-milk-500/30 transition-all active:scale-[0.98] animate-scale-in flex items-center gap-1 cursor-pointer"
              >
                <span>${activeGroup?.totalAmount ?? 0}</span>
                <span>結帳彙整 →</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Order List Bottom Sheet Modal */}
      {showOrders && (
        <div className="fixed inset-0 z-40 flex items-end justify-center" onClick={() => setShowOrders(false)}>
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm animate-fade-in" />
          <div
            className="relative w-full max-w-lg max-h-[75dvh] overflow-y-auto bg-white dark:bg-zinc-900 
                       rounded-t-[28px] p-6 pb-24 shadow-2xl animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Grab handle indicator for sheet drawer */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-gray-200 dark:bg-zinc-800"></div>

            <div className="flex items-center justify-between mb-5 mt-2">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">📋</span>
                <h3 className="text-lg font-extrabold text-gray-800 dark:text-zinc-100">目前點餐明細</h3>
              </div>
              <button
                onClick={() => setShowOrders(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <OrderList items={activeGroup?.items ?? []} onRemove={onRemoveItem} />
            
            {activeGroup && activeGroup.items.length > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900 sticky bottom-0">
                <span className="text-xs font-semibold text-gray-400 dark:text-zinc-500">共 {activeGroup.totalCups} 杯飲品</span>
                <span className="text-xl font-extrabold text-milk-600 dark:text-milk-400">${activeGroup.totalAmount}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Order Detail Settings Form Modal */}
      {selectedItem && (
        <OrderForm
          item={selectedItem}
          menu={menu}
          lastPersonName={lastPersonName}
          onSubmit={handleAddOrder}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* Bill Split Receipt Summary Modal */}
      {showSummary && activeGroup && (
        <OrderSummary
          storeName={menu.storeName}
          items={activeGroup.items}
          totalAmount={activeGroup.totalAmount}
          totalCups={activeGroup.totalCups}
          onClose={() => setShowSummary(false)}
          onCloseGroup={() => {
            onCloseGroup();
            setShowSummary(false);
          }}
        />
      )}
    </div>
  );
}
