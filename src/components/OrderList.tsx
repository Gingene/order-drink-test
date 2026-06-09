import type { OrderItem } from '../types';

interface Props {
  items: OrderItem[];
  onRemove: (id: string) => void;
}

export default function OrderList({ items, onRemove }: Props) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 dark:text-gray-500">
        <div className="text-4xl mb-2">📋</div>
        <p className="text-sm">還沒有訂單，點選飲品開始點餐！</p>
      </div>
    );
  }

  // Group by person
  const grouped = new Map<string, OrderItem[]>();
  items.forEach(item => {
    const existing = grouped.get(item.personName) || [];
    existing.push(item);
    grouped.set(item.personName, existing);
  });

  return (
    <div className="space-y-4">
      {Array.from(grouped.entries()).map(([name, orders]) => (
        <div key={name} className="animate-fade-in">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
            <span>👤</span> {name}
            <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">
              ({orders.length} 杯)
            </span>
          </h4>
          <div className="space-y-2">
            {orders.map(order => (
              <div
                key={order.id}
                className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm 
                           rounded-xl border border-gray-100 dark:border-gray-700 group animate-scale-in"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800 dark:text-gray-100">{order.itemName}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-milk-100 dark:bg-milk-900/30 text-milk-700 dark:text-milk-300 rounded-md">
                      {order.size}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {order.sweet} · {order.ice}
                    {order.toppings.length > 0 && ` · +${order.toppings.map(t => t.name).join('+')}`}
                    {order.quantity > 1 && ` · ×${order.quantity}`}
                    {order.note && ` · ${order.note}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold text-milk-600 dark:text-milk-400">${order.subtotal}</span>
                  <button
                    onClick={() => onRemove(order.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 
                               hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30
                               opacity-0 group-hover:opacity-100 transition-all"
                    title="移除"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
