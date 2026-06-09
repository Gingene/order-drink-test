import type { SearchableItem } from '../types';

interface Props {
  item: SearchableItem;
  onSelect: (item: SearchableItem) => void;
}

export default function MenuItem({ item, onSelect }: Props) {
  const sizes = Object.entries(item.prices);
  const minPrice = Math.min(...Object.values(item.prices));

  return (
    <button
      onClick={() => onSelect(item)}
      className="w-full p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-gray-700
                 hover:shadow-lg hover:border-milk-300 dark:hover:border-milk-600 hover:scale-[1.01]
                 transition-all duration-200 text-left group"
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-milk-600 dark:group-hover:text-milk-400 transition-colors">
            {item.name}
          </h4>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {sizes.map(([size, price]) => (
              <span
                key={size}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-milk-50 dark:bg-milk-900/30 
                           text-milk-700 dark:text-milk-300 text-xs rounded-md"
              >
                {size} ${price}
              </span>
            ))}
          </div>
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.slice(0, 4).map(tag => (
                <span key={tag} className="text-[11px] text-gray-400 dark:text-gray-500">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="shrink-0 text-right">
          <span className="text-lg font-bold text-milk-600 dark:text-milk-400">${minPrice}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500 block">起</span>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
        點擊加入訂單 →
      </div>
    </button>
  );
}
