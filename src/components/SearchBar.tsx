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
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          🔍
        </span>
        <input
          type="text"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder="搜尋飲料...（支援模糊搜尋，如「珍奶」「拿鐵」）"
          className="w-full pl-10 pr-10 py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm 
                     border border-gray-200 dark:border-gray-700 rounded-xl
                     text-gray-800 dark:text-gray-100 placeholder:text-gray-400
                     focus:outline-none focus:ring-2 focus:ring-milk-400/50 focus:border-milk-400
                     transition-all duration-200"
          id="search-input"
        />
        {query && (
          <button
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                       w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            ✕
          </button>
        )}
      </div>
      {query && (
        <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500 pl-1 animate-fade-in">
          找到 {resultCount} 個結果
        </p>
      )}
    </div>
  );
}
