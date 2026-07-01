import type { SearchableItem } from '../types';
import type { PopularItem } from '../hooks/usePopularItems';

interface Props {
  items: PopularItem[];
  onSelect: (item: SearchableItem) => void;
}

export default function PopularDrinks({ items, onSelect }: Props) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-2.5">
        🔥 熱門飲料
      </h3>
      <div className="flex gap-2.5 overflow-x-auto pt-2 pb-2 -mx-4 px-4 snap-x scrollbar-none">
        {items.map(({ item, count }, idx) => {
          const minPrice =
            Object.keys(item.prices).length > 0
              ? Math.min(...Object.values(item.prices))
              : 0;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="snap-start shrink-0 w-36 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
                         rounded-xl border border-gray-100 dark:border-gray-700
                         hover:shadow-lg hover:border-milk-300 dark:hover:border-milk-600
                         hover:scale-[1.02] transition-all duration-200 text-left group relative
                         animate-slide-up"
              style={{
                animationDelay: `${Math.min(idx * 40, 240)}ms`,
                animationFillMode: 'both',
              }}
            >
              <span
                className="absolute -top-1.5 -right-1.5 px-2 py-0.5 bg-milk-500 text-white text-[11px] font-semibold
                           rounded-full shadow-md whitespace-nowrap"
              >
                × {count} 杯
              </span>
              <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-100
                            group-hover:text-milk-600 dark:group-hover:text-milk-400 transition-colors line-clamp-2 pr-6">
                {item.name}
              </h4>
              {item.categoryName && (
                <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 block">
                  {item.categoryName}
                </span>
              )}
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-lg font-bold text-milk-600 dark:text-milk-400">
                  ${minPrice}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">起</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
