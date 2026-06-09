import type { OrderItem } from '../types';

interface Props {
  items: OrderItem[];
  onRemove: (id: string) => void;
}

export default function OrderList({ items, onRemove }: Props) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 dark:text-zinc-500 bg-gray-50/50 dark:bg-zinc-800/10 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800">
        <div className="text-4xl mb-3">🛒</div>
        <p className="font-semibold text-sm">團購車內還沒有飲品</p>
        <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">快去選單挑選好喝的飲料吧！</p>
      </div>
    );
  }

  // Group items by person name
  const grouped = new Map<string, OrderItem[]>();
  items.forEach(item => {
    const existing = grouped.get(item.personName) || [];
    existing.push(item);
    grouped.set(item.personName, existing);
  });

  return (
    <div className="space-y-5">
      {Array.from(grouped.entries()).map(([name, orders]) => (
        <div key={name} className="animate-fade-in space-y-2.5">
          {/* Person Header Badge */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-1.5">
            <h4 className="text-xs font-bold text-gray-400 dark:text-zinc-500 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-milk-100 dark:bg-milk-900/35 text-milk-700 dark:text-milk-400 flex items-center justify-center text-[10px]">
                👤
              </span>
              <span className="text-gray-750 dark:text-zinc-200 font-extrabold text-sm">{name}</span>
            </h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400">
              共 {orders.length} 杯
            </span>
          </div>

          <div className="space-y-2">
            {orders.map(order => {
              const toppingStr = order.toppings.length > 0 
                ? ` + ${order.toppings.map(t => t.name).join(' + ')}` 
                : '';
              
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-3 p-3 bg-gray-50/50 dark:bg-zinc-800/50 backdrop-blur-sm 
                             rounded-xl border border-gray-200/40 dark:border-zinc-800/80 group transition-all duration-300 hover:border-milk-300 dark:hover:border-milk-850"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-gray-800 dark:text-zinc-200">
                        {order.itemName}
                      </span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.25 bg-milk-50 dark:bg-milk-950/20 text-milk-600 dark:text-milk-500 rounded border border-milk-200/10">
                        {order.size}
                      </span>
                      {order.quantity > 1 && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.25 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded">
                          × {order.quantity}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">
                      {order.sweet} · {order.ice}
                      {toppingStr}
                      {order.note && ` (備註: ${order.note})`}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-black text-sm text-milk-600 dark:text-milk-400">
                      ${order.subtotal}
                    </span>
                    <button
                      onClick={() => onRemove(order.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
                      title="移除此飲品"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
