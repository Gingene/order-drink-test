import { useState } from 'react';
import type { StoreInfo, GroupOrder } from '../types';

interface Props {
  stores: StoreInfo[];
  loading: boolean;
  activeGroup: GroupOrder | null;
  history: GroupOrder[];
  onSelectStore: (store: StoreInfo) => void;
  onResumeGroup: (group: GroupOrder) => void;
  onNavigateAdmin: () => void;
}

export default function StoreSelector({
  stores, loading, activeGroup, history, onSelectStore, onResumeGroup, onNavigateAdmin,
}: Props) {
  const [showHistory, setShowHistory] = useState(false);
  const [storeQuery, setStoreQuery] = useState('');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-gradient-to-br from-milk-50 to-tea-50 dark:from-zinc-950 dark:to-zinc-900">
        <div className="text-center animate-fade-in">
          <div className="relative inline-flex mb-6">
            <div className="w-16 h-16 rounded-full bg-milk-200 dark:bg-milk-800 animate-ping absolute opacity-40"></div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-milk-400 to-milk-600 flex items-center justify-center text-3xl shadow-lg relative">
              🧋
            </div>
          </div>
          <p className="text-lg font-medium text-milk-800 dark:text-milk-200 animate-pulse">載入店家中...</p>
        </div>
      </div>
    );
  }

  // Filter stores
  const filteredStores = stores.filter(s =>
    s.name.toLowerCase().includes(storeQuery.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(storeQuery.toLowerCase()))
  );

  // Helper for mock store metrics
  const getStoreMetrics = (storeId: string) => {
    if (storeId === 'black-tea-group') {
      return { rating: '4.8', time: '10-20 分', tags: ['特大杯 XL', '免費加料', '買五送一'], emoji: '🥤' };
    }
    if (storeId === 'oldmon') {
      return { rating: '4.9', time: '15-25 分', tags: ['手作職人', '特級蔗糖', '熱門推薦'], emoji: '🍵' };
    }
    return { rating: '4.7', time: '15-30 分', tags: ['手搖茶飲', '在地推薦'], emoji: '🍹' };
  };

  return (
    <div className="min-h-dvh px-4 py-10 max-w-lg mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-10 animate-slide-up flex flex-col items-center">
        {/* Customized SVG Premium Logo */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-milk-500 to-milk-600 flex items-center justify-center shadow-lg shadow-milk-500/20 mb-4 hover:rotate-6 transition-transform duration-300">
          <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 8H19C20.1 8 21 8.9 21 10V12C21 13.1 20.1 14 19 14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 8H17V18C17 19.66 15.66 21 14 21H8C6.34 21 5 19.66 5 18V8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 2L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 2V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 2L14 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-milk-600 via-milk-700 to-tea-600 dark:from-milk-400 dark:via-milk-500 dark:to-tea-400 bg-clip-text text-transparent tracking-tight">
          下午茶飲料團購
        </h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-2.5 text-sm font-medium">
          ✨ 一起揪團點飲料！一鍵複製訂單發送 LINE 群組
        </p>
      </div>

      {/* Active Group Banner */}
      {activeGroup && (
        <button
          onClick={() => onResumeGroup(activeGroup)}
          className="w-full mb-8 p-5 rounded-2xl text-left border relative overflow-hidden transition-all duration-300
                     bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/10 dark:via-amber-500/2 dark:to-transparent
                     border-amber-200/80 dark:border-amber-800/40 shadow-md hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] group animate-scale-in"
        >
          {/* Glowing pulse indicator */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -translate-y-6 translate-x-6"></div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1.5 flex-1 pr-4">
              <div className="flex items-center gap-2">
                <span className="pulse-dot"></span>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  正在進行中的團購
                </span>
              </div>
              <h4 className="font-bold text-gray-800 dark:text-zinc-100 text-lg">
                {activeGroup.storeName}
              </h4>
              
              {/* Progress/Summary details */}
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-zinc-400">
                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded font-medium">
                  {activeGroup.totalCups} 杯飲料
                </span>
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  總計 ${activeGroup.totalAmount}
                </span>
              </div>
            </div>
            
            <div className="shrink-0 flex items-center gap-1 text-sm font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
              繼續點餐 
              <span className="text-lg">→</span>
            </div>
          </div>
        </button>
      )}

      {/* Title & Search Section */}
      <div className="mb-4 flex flex-col gap-3 animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
            <span>🏪</span> 選擇店家
          </h2>
          <span className="text-xs text-gray-400 dark:text-zinc-500">
            共 {stores.length} 間可選
          </span>
        </div>

        {/* Store search input */}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            value={storeQuery}
            onChange={e => setStoreQuery(e.target.value)}
            placeholder="搜尋飲料店家或特色..."
            className="w-full pl-9 pr-8 py-2.5 bg-white/80 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700/80 rounded-xl text-sm
                       text-gray-800 dark:text-zinc-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-milk-400/40 focus:border-milk-400 transition-all duration-200"
          />
          {storeQuery && (
            <button
              onClick={() => setStoreQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 text-xs w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Store List */}
      <div className="space-y-4">
        {filteredStores.length === 0 ? (
          <div className="text-center py-10 bg-white/50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800">
            <span className="text-3xl block mb-2">🔍</span>
            <p className="text-sm text-gray-400 dark:text-zinc-500">沒有找到相符的店家</p>
          </div>
        ) : (
          filteredStores.map((store, idx) => {
            const metrics = getStoreMetrics(store.id);
            return (
              <button
                key={store.id}
                onClick={() => onSelectStore(store)}
                className="w-full p-5 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-zinc-800
                           premium-shadow premium-shadow-hover text-left group animate-slide-up"
                style={{ animationDelay: `${(idx + 2) * 80}ms`, animationFillMode: 'both' }}
              >
                <div className="flex items-start gap-4">
                  {/* Shop Icon Frame */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-milk-100 to-tea-100 dark:from-milk-900/40 dark:to-tea-900/40 
                                  border border-milk-200/20 dark:border-milk-800/10
                                  flex items-center justify-center text-3xl shrink-0
                                  group-hover:scale-108 transition-transform duration-300 shadow-inner">
                    {metrics.emoji}
                  </div>
                  
                  {/* Info details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-800 dark:text-zinc-100 group-hover:text-milk-600 dark:group-hover:text-milk-400 transition-colors text-base truncate">
                        {store.name}
                      </h3>
                      <div className="flex items-center gap-1 shrink-0 text-xs font-semibold text-amber-500 ml-2">
                        <span>⭐</span>
                        <span>{metrics.rating}</span>
                      </div>
                    </div>

                    {store.description && (
                      <p className="text-sm text-gray-500 dark:text-zinc-400 line-clamp-1">
                        {store.description}
                      </p>
                    )}

                    {/* Features Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 flex items-center gap-0.5">
                        🕒 {metrics.time}
                      </span>
                      {metrics.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-milk-50 dark:bg-milk-950/20 text-milk-600 dark:text-milk-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Arrow Indicator */}
                  <div className="self-center pl-2 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-gray-400
                                    group-hover:bg-milk-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
                      →
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div className="mt-10 animate-fade-in" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between text-sm font-semibold text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors py-2"
          >
            <span className="flex items-center gap-2">
              <span>📜</span> 歷史團購紀錄 ({history.length})
            </span>
            <span className={`transition-transform duration-300 ${showHistory ? 'rotate-90' : ''}`}>
              ▶
            </span>
          </button>

          {showHistory && (
            <div className="mt-3 space-y-2.5 animate-slide-up">
              {history.slice(0, 10).map(group => {
                const dateObj = new Date(group.createdAt);
                const dateString = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
                const timeString = dateObj.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
                
                return (
                  <button
                    key={group.id}
                    onClick={() => onResumeGroup(group)}
                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-zinc-800/80 bg-gray-50/50 dark:bg-zinc-900/30 text-left text-sm 
                               hover:bg-gray-100/70 dark:hover:bg-zinc-800/50 hover:border-milk-200 dark:hover:border-milk-900/40 transition-all flex items-center justify-between group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700 dark:text-zinc-200">
                          {group.storeName}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400">
                          {dateString} {timeString}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-zinc-500">
                        點餐明細：{group.items.slice(0, 3).map(i => i.itemName).join('、')}
                        {group.items.length > 3 ? '...' : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div className="space-y-0.5">
                        <div className="font-bold text-gray-800 dark:text-zinc-100">${group.totalAmount}</div>
                        <div className="text-[10px] text-gray-400 dark:text-zinc-500">{group.totalCups} 杯</div>
                      </div>
                      <span className="text-gray-300 group-hover:text-milk-500 transition-colors">→</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Admin Link */}
      <div className="mt-10 text-center animate-fade-in" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
        <button
          onClick={onNavigateAdmin}
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-zinc-500 hover:text-milk-500 dark:hover:text-milk-400 transition-colors font-medium"
        >
          <span>⚙️</span> 管理後台系統
        </button>
      </div>
    </div>
  );
}
