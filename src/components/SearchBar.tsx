import { useState, useEffect, useRef } from 'react';

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  onClear: () => void;
  resultCount: number;
  tags: string[];
  selectedTag: string | null;
  onTagChange: (tag: string | null) => void;
}

export default function SearchBar({
  query,
  onQueryChange,
  onClear,
  resultCount,
  tags,
  selectedTag,
  onTagChange,
}: Props) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter tags containing the query (or show all except selectedTag if empty)
  const matchingTags = query.trim()
    ? tags.filter(tag => tag.toLowerCase().includes(query.toLowerCase()))
    : tags.filter(tag => tag !== selectedTag);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 w-full px-3.5 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm 
                      border border-gray-200 dark:border-gray-700 rounded-xl
                      focus-within:ring-2 focus-within:ring-milk-400/50 focus-within:border-milk-400
                      transition-all duration-200 min-h-[48px]">
        <span className="text-gray-400 shrink-0 select-none ml-0.5">🔍</span>

        {selectedTag && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-milk-100 dark:bg-milk-900/30 
                           text-milk-700 dark:text-milk-300 rounded-lg text-xs font-semibold select-none
                           animate-scale-in shrink-0">
            🏷️ {selectedTag}
            <button
              onClick={() => onTagChange(null)}
              className="hover:text-red-500 transition-colors ml-0.5"
            >
              ✕
            </button>
          </span>
        )}

        <input
          type="text"
          value={query}
          onChange={e => {
            onQueryChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder={selectedTag ? '' : '搜尋飲料...（點擊可選擇標籤）'}
          className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-gray-800 dark:text-gray-100 
                     placeholder:text-gray-400 p-0 focus:ring-0 focus:outline-none focus:border-none focus:bg-transparent"
          id="search-input"
        />

        {query && (
          <button
            onClick={onClear}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                       w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shrink-0"
          >
            ✕
          </button>
        )}
      </div>

      {showSuggestions && matchingTags.length > 0 && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 
                        rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto animate-slide-down">
          <div className="p-2 border-b border-gray-50 dark:border-gray-800/50 text-[11px] font-semibold text-gray-400 dark:text-gray-500 px-3.5 select-none">
            🏷️ 點擊以下標籤篩選飲料
          </div>
          <div className="p-1">
            {matchingTags.map(tag => (
              <button
                key={tag}
                onClick={() => {
                  onTagChange(tag);
                  onQueryChange('');
                  setShowSuggestions(false);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 
                           hover:bg-milk-50 dark:hover:bg-milk-900/10 hover:text-milk-600 dark:hover:text-milk-400
                           rounded-xl transition-all text-left font-medium"
              >
                <span>🏷️ {tag}</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal">點擊篩選</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {(query || selectedTag) && (
        <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500 pl-1 animate-fade-in">
          找到 {resultCount} 個結果
        </p>
      )}
    </div>
  );
}
