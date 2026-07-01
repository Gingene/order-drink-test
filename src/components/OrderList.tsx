import { useState } from "react";
import type { OrderItem, StoreMenu } from "../types";

interface Props {
  items: OrderItem[];
  menu?: StoreMenu;
  onEdit: (item: OrderItem) => void;
  onRemove: (id: string) => void;
  onRemovePersonItems?: (personName: string) => void;
}

export default function OrderList({
  items,
  menu,
  onEdit,
  onRemove,
  onRemovePersonItems,
}: Props) {
  const [confirmDeletePerson, setConfirmDeletePerson] = useState<string | null>(
    null,
  );

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
  items.forEach((item) => {
    const existing = grouped.get(item.personName) || [];
    existing.push(item);
    grouped.set(item.personName, existing);
  });

  return (
    <div className="space-y-4">
      {Array.from(grouped.entries()).map(([name, orders]) => {
        const personTotal = orders.reduce((sum, o) => sum + o.subtotal, 0);
        return (
          <div key={name} className="animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <span>👤</span> {name}
                <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">
                  ({orders.reduce((sum, o) => sum + o.quantity, 0)} 杯)
                </span>
              </h4>
              {onRemovePersonItems &&
                (confirmDeletePerson === name ? (
                  <div className="flex items-center gap-1.5 animate-scale-in">
                    <button
                      onClick={() => setConfirmDeletePerson(null)}
                      className="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 
                                 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => {
                        onRemovePersonItems(name);
                        setConfirmDeletePerson(null);
                      }}
                      className="text-xs px-2 py-1 rounded-lg bg-red-500 text-white 
                                 hover:bg-red-600 transition-colors"
                    >
                      確定刪除
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeletePerson(name)}
                    className="text-xs px-2 py-1 rounded-lg text-gray-400 hover:text-red-500 
                               hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                    title={`刪除 ${name} 的所有訂單`}
                  >
                    🗑️ 全部刪除
                  </button>
                ))}
            </div>
            <div className="space-y-2">
              {orders.map((order) => {
                const menuItem = menu?.categories
                  .flatMap((c) => c.items)
                  .find((mi) => mi.id === order.menuItemId);
                const hasMultipleSizes = menuItem ? Object.keys(menuItem.prices).length > 1 : true;
                return (
                  <div
                    key={order.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onEdit(order)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onEdit(order);
                      }
                    }}
                    className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm 
                               rounded-xl border border-gray-100 dark:border-gray-700 group animate-scale-in
                               cursor-pointer hover:border-milk-300 dark:hover:border-milk-700
                               focus:outline-none focus:ring-2 focus:ring-milk-400/40"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800 dark:text-gray-100">
                          {order.itemName}
                        </span>
                        {hasMultipleSizes && (
                          <span className="text-xs px-1.5 py-0.5 bg-milk-100 dark:bg-milk-900/30 text-milk-700 dark:text-milk-300 rounded-md">
                            {order.size}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {[
                          order.sweet !== "固定" && order.sweet,
                          order.ice !== "固定" && order.ice,
                          order.toppings.length > 0 &&
                            `+${order.toppings.map((t) => t.name).join("+")}`,
                          order.quantity > 1 && `×${order.quantity}`,
                          order.note,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold text-milk-600 dark:text-milk-400">
                      ${order.subtotal}
                    </span>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        onRemove(order.id);
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 
                                 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30
                                 transition-all"
                      title="移除"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
            {/* Per-person subtotal */}
            <div className="mt-2 px-3 flex justify-end">
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                📎 小計{" "}
                <span className="text-milk-600 dark:text-milk-400">
                  ${personTotal}
                </span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
