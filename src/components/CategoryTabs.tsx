interface Props {
  categories: string[];
  activeCategory: string | null;
  onSelect: (cat: string | null) => void;
}

export default function CategoryTabs({ categories, activeCategory, onSelect }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
          ${!activeCategory
            ? 'bg-milk-500 text-white shadow-md shadow-milk-500/30'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
      >
        全部
      </button>
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onSelect(cat === activeCategory ? null : cat)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
            ${cat === activeCategory
              ? 'bg-milk-500 text-white shadow-md shadow-milk-500/30'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
