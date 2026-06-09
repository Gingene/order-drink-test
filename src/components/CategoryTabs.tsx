interface Props {
  categories: string[];
  activeCategory: string | null;
  onSelect: (cat: string | null) => void;
}

export default function CategoryTabs({ categories, activeCategory, onSelect }: Props) {
  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
      {/* "All" button */}
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-250 cursor-pointer active:scale-95
          ${!activeCategory
            ? 'bg-gradient-to-r from-milk-500 to-milk-600 text-white shadow-md shadow-milk-500/25 border-t border-white/10'
            : 'bg-white/90 dark:bg-zinc-800/80 text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 border border-gray-100 dark:border-zinc-700/50'
          }`}
      >
        全部飲品
      </button>

      {/* Categories loop */}
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onSelect(cat === activeCategory ? null : cat)}
          className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-250 cursor-pointer active:scale-95
            ${cat === activeCategory
              ? 'bg-gradient-to-r from-milk-500 to-milk-600 text-white shadow-md shadow-milk-500/25 border-t border-white/10'
              : 'bg-white/90 dark:bg-zinc-800/80 text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 border border-gray-100 dark:border-zinc-700/50'
            }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
