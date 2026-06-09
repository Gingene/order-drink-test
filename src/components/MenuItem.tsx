import type { SearchableItem } from '../types';

interface Props {
  item: SearchableItem;
  onSelect: (item: SearchableItem) => void;
}

export default function MenuItem({ item, onSelect }: Props) {
  const sizes = Object.entries(item.prices);
  const minPrice = Math.min(...Object.values(item.prices));
  const isAvailable = item.available !== false; // defaults to true if undefined

  const handleClick = () => {
    if (isAvailable) {
      onSelect(item);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isAvailable}
      className={`w-full p-4 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-2xl border text-left group transition-all duration-300 relative overflow-hidden
        ${isAvailable 
          ? 'border-gray-100 dark:border-zinc-800/80 premium-shadow premium-shadow-hover hover:border-milk-300 dark:hover:border-milk-800 cursor-pointer active:scale-[0.99]' 
          : 'border-gray-200 dark:border-zinc-800 opacity-60 cursor-not-allowed'
        }`}
    >
      {/* Sold Out Watermark / Overlay */}
      {!isAvailable && (
        <div className="absolute inset-0 bg-gray-50/10 dark:bg-black/10 flex items-center justify-center pointer-events-none">
          <span className="px-3.5 py-1.5 border-2 border-red-500/80 text-red-500 dark:text-red-400 font-extrabold text-sm rounded-lg rotate-12 bg-white/95 dark:bg-zinc-900/95 shadow-md">
            已售完 SOLD OUT
          </span>
        </div>
      )}

      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Header row */}
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={`font-bold text-base transition-colors truncate
              ${isAvailable 
                ? 'text-gray-800 dark:text-zinc-100 group-hover:text-milk-600 dark:group-hover:text-milk-400' 
                : 'text-gray-400 dark:text-zinc-500'
              }`}
            >
              {item.name}
            </h4>
            
            {/* Hot badge */}
            {item.hot && isAvailable && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                ♨️ 可做熱飲
              </span>
            )}
          </div>

          {/* Description if present */}
          {item.description && (
            <p className="text-xs text-gray-400 dark:text-zinc-400 leading-relaxed line-clamp-2">
              {item.description}
            </p>
          )}

          {/* Size capsule pill list */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {sizes.map(([size, price]) => (
              <span
                key={size}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-50 dark:bg-zinc-800/80 
                           text-gray-500 dark:text-zinc-400 text-[11px] font-semibold rounded-lg border border-gray-100 dark:border-zinc-700/50"
              >
                <span className="text-gray-400 dark:text-zinc-500 font-normal">{size}</span> 
                <span className="text-gray-700 dark:text-zinc-300 font-bold">${price}</span>
              </span>
            ))}
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1.5">
              {item.tags.slice(0, 4).map(tag => {
                const isSpecial = tag === '推薦' || tag === '招牌' || tag === '經典';
                return (
                  <span 
                    key={tag} 
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md
                      ${isSpecial 
                        ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/20' 
                        : 'bg-gray-100 dark:bg-zinc-800/50 text-gray-400 dark:text-zinc-400'
                      }`}
                  >
                    #{tag}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Right price column */}
        <div className="shrink-0 text-right space-y-0.5 self-center">
          <div className="flex items-baseline justify-end gap-0.5">
            <span className="text-[10px] text-gray-400 dark:text-zinc-400 font-medium mr-0.5">NT$</span>
            <span className="text-xl font-extrabold text-milk-600 dark:text-milk-400">{minPrice}</span>
          </div>
          <span className="text-[10px] text-gray-400 dark:text-zinc-500 block">起</span>
        </div>
      </div>
      
      {/* Click Tip Overlay */}
      {isAvailable && (
        <div className="mt-2.5 pt-2 border-t border-dashed border-gray-100 dark:border-zinc-800/50 flex items-center justify-between text-[11px] text-gray-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span>點選以客製化冰塊甜度</span>
          <span className="group-hover:translate-x-0.5 transition-transform">加入點餐 →</span>
        </div>
      )}
    </button>
  );
}
