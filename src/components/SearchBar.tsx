interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  onClear: () => void;
  resultCount: number;
}

export default function SearchBar({ query, onQueryChange, onClear, resultCount }: Props) {
  return (
    <div className="relative">
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-base">
          🔍
        </span>
        <input
          type="text"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder="搜尋飲品...（支援模糊搜尋如「珍奶」）"
          className="w-full pl-10 pr-10 py-3 bg-gray-50/70 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700/80 rounded-2xl
                     text-gray-800 dark:text-zinc-100 placeholder:text-gray-400/80
                     focus:outline-none focus:ring-2 focus:ring-milk-400/35 focus:border-milk-400 focus:bg-white dark:focus:bg-zinc-800
                     transition-all duration-200 text-sm"
          id="search-input"
        />
        {query && (
          <button
            onClick={onClear}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200
                       w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all text-xs font-semibold"
          >
            ✕
          </button>
        )}
      </div>
      {query && (
        <div className="mt-2 text-[11px] text-gray-400 dark:text-zinc-500 pl-1.5 flex items-center gap-1.5 animate-fade-in">
          <span>搜尋結果：</span>
          <span className="px-2 py-0.5 rounded-full bg-milk-100 dark:bg-milk-950/35 text-milk-700 dark:text-milk-400 font-semibold">
            {resultCount} 個品項
          </span>
        </div>
      )}
    </div>
  );
}
