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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="text-center animate-fade-in">
          <div className="text-6xl mb-4">🧋</div>
          <p className="text-lg text-gray-500">載入店家中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh px-4 py-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-8 animate-slide-up">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-milk-600 to-tea-500 bg-clip-text text-transparent">
          🧋 飲料團購
        </h1>
        <p className="text-gray-500 mt-2">選一間店，開始揪團！</p>
      </div>

      {/* Active Group Banner */}
      {activeGroup && (
        <button
          onClick={() => onResumeGroup(activeGroup)}
          className="w-full mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 
                     border border-amber-200 dark:border-amber-800 rounded-2xl text-left 
                     hover:shadow-lg transition-all duration-300 animate-scale-in group"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">🔥 進行中的團</span>
              <p className="font-semibold text-gray-800 dark:text-gray-100 mt-1">{activeGroup.storeName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {activeGroup.totalCups} 杯 · ${activeGroup.totalAmount}
              </p>
            </div>
            <span className="text-sm text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
              繼續 →
            </span>
          </div>
        </button>
      )}

      {/* Store List */}
      <div className="space-y-3">
        {stores.map((store, idx) => (
          <button
            key={store.id}
            onClick={() => onSelectStore(store)}
            className="w-full p-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-700
                       hover:shadow-xl hover:scale-[1.02] hover:border-milk-300 dark:hover:border-milk-600
                       transition-all duration-300 text-left group animate-slide-up"
            style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'both' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-milk-200 to-tea-200 dark:from-milk-700 dark:to-tea-700 
                              flex items-center justify-center text-2xl shrink-0
                              group-hover:scale-110 transition-transform duration-300">
                🏪
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">{store.name}</h3>
                {store.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{store.description}</p>
                )}
              </div>
              <span className="text-gray-400 group-hover:text-milk-500 group-hover:translate-x-1 transition-all">
                →
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <span className={`transition-transform duration-200 ${showHistory ? 'rotate-90' : ''}`}>▶</span>
            歷史團購紀錄 ({history.length})
          </button>

          {showHistory && (
            <div className="mt-3 space-y-2 animate-slide-up">
              {history.slice(0, 10).map(group => (
                <button
                  key={group.id}
                  onClick={() => onResumeGroup(group)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-left text-sm 
                             hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-200">{group.storeName}</span>
                      <span className="text-gray-400 ml-2">
                        {new Date(group.createdAt).toLocaleDateString('zh-TW')}
                      </span>
                    </div>
                    <span className="text-gray-500">{group.totalCups} 杯 · ${group.totalAmount}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Admin Link */}
      <div className="mt-8 text-center">
        <button
          onClick={onNavigateAdmin}
          className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          ⚙️ 管理菜單
        </button>
      </div>
    </div>
  );
}
