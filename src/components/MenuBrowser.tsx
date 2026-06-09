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
    // Auto-start group if not started
    if (!activeGroup) {
      onStartGroup();
    }
    setLastPersonName(order.personName);
    onAddItem(order);
    setSelectedItem(null);
  };

  const orderCount = activeGroup?.totalCups ?? 0;

  return (
    <div className="min-h-dvh pb-24">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={onBack}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 
                         text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shrink-0"
            >
              ←
            </button>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 truncate">{menu.storeName}</h2>
          </div>

          <SearchBar
            query={query}
            onQueryChange={setQuery}
            onClear={clearSearch}
            resultCount={results.length}
          />

          <div className="mt-3">
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onSelect={setActiveCategory}
            />
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="space-y-2.5">
          {results.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500 animate-fade-in">
              <div className="text-4xl mb-3">🔍</div>
              <p>找不到符合的飲料</p>
              <p className="text-sm mt-1">試試其他關鍵字？</p>
            </div>
          ) : (
            results.map((item, idx) => (
              <div
                key={item.id}
                className="animate-slide-up"
                style={{ animationDelay: `${Math.min(idx * 30, 300)}ms`, animationFillMode: 'both' }}
              >
                <MenuItem item={item} onSelect={setSelectedItem} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Bar - Order Counter */}
      <div className="fixed bottom-0 inset-x-0 z-20">
        <div className="max-w-lg mx-auto px-4 pb-4">
          <div className="flex gap-2">
            {/* Order List Toggle */}
            <button
              onClick={() => setShowOrders(!showOrders)}
              className="flex-1 py-3.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-gray-200 dark:border-gray-700
                         rounded-xl shadow-lg font-medium text-gray-700 dark:text-gray-200 
                         hover:bg-gray-50 dark:hover:bg-gray-700 transition-all relative"
            >
              📋 訂單 ({orderCount} 杯)
              {orderCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full 
                                 flex items-center justify-center animate-bounce-in">
                  {orderCount}
                </span>
              )}
            </button>

            {/* Summary Button */}
            {orderCount > 0 && (
              <button
                onClick={() => setShowSummary(true)}
                className="py-3.5 px-6 bg-gradient-to-r from-milk-500 to-milk-600 
                           hover:from-milk-600 hover:to-milk-700
                           text-white font-semibold rounded-xl shadow-lg shadow-milk-500/30
                           hover:shadow-xl transition-all active:scale-[0.98] animate-scale-in"
              >
                ${activeGroup?.totalAmount ?? 0} 結帳 →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Order List Panel */}
      {showOrders && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" onClick={() => setShowOrders(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
          <div
            className="relative w-full max-w-lg max-h-[70dvh] overflow-y-auto bg-white dark:bg-gray-900 
                       rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">📋 目前訂單</h3>
              <button onClick={() => setShowOrders(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">✕</button>
            </div>
            <OrderList items={activeGroup?.items ?? []} onRemove={onRemoveItem} />
            {activeGroup && activeGroup.items.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">共 {activeGroup.totalCups} 杯</span>
                <span className="text-xl font-bold text-milk-600 dark:text-milk-400">${activeGroup.totalAmount}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Form Modal */}
      {selectedItem && (
        <OrderForm
          item={selectedItem}
          menu={menu}
          lastPersonName={lastPersonName}
          onSubmit={handleAddOrder}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* Order Summary Modal */}
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
