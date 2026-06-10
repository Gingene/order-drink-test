import { useState } from 'react';
import type { StoreInfo, GroupOrder } from '../types';
import { formatByPerson, formatBySummary, copyToClipboard } from '../utils/formatOrder';

interface Props {
  stores: StoreInfo[];
  loading: boolean;
  activeGroup: GroupOrder | null;
  history: GroupOrder[];
  onSelectStore: (store: StoreInfo) => void;
  onResumeActiveGroup: () => void;
  onDeleteHistoryItem: (groupId: string) => void;
  onNavigateAdmin: () => void;
}

export default function StoreSelector({
  stores, loading, activeGroup, history, onSelectStore, onResumeActiveGroup, onDeleteHistoryItem, onNavigateAdmin,
}: Props) {
  const [showHistory, setShowHistory] = useState(false);
  const [viewingGroup, setViewingGroup] = useState<GroupOrder | null>(null);
  const [viewFormat, setViewFormat] = useState<'person' | 'summary'>('person');
  const [copied, setCopied] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

  const handleCopyHistory = async (group: GroupOrder) => {
    const text = viewFormat === 'person'
      ? formatByPerson(group.storeName, group.items)
      : formatBySummary(group.storeName, group.items);
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeleteHistory = (groupId: string) => {
    onDeleteHistoryItem(groupId);
    setConfirmDeleteId(null);
    // If we just deleted the group we're viewing, close modal
    if (viewingGroup?.id === groupId) {
      setViewingGroup(null);
    }
  };

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
          onClick={onResumeActiveGroup}
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
                <div
                  key={group.id}
                  className="flex items-center gap-2"
                >
                  <button
                    onClick={() => {
                      setViewingGroup(group);
                      setViewFormat('person');
                      setCopied(false);
                    }}
                    className="flex-1 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-left text-sm 
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
                  {/* Delete button */}
                  {confirmDeleteId === group.id ? (
                    <div className="flex gap-1 shrink-0 animate-scale-in">
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs px-2 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 
                                   hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => handleDeleteHistory(group.id)}
                        className="text-xs px-2 py-1.5 rounded-lg bg-red-500 text-white 
                                   hover:bg-red-600 transition-colors"
                      >
                        刪除
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(group.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 
                                 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 
                                 transition-all shrink-0"
                      title="刪除紀錄"
                    >
                      🗑️
                    </button>
                  )}
                </div>
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

      {/* History View Modal */}
      {viewingGroup && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setViewingGroup(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />

          <div
            className="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto bg-white dark:bg-gray-900 
                       rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">📋 歷史紀錄</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {viewingGroup.storeName} · {new Date(viewingGroup.createdAt).toLocaleDateString('zh-TW')}
                </p>
              </div>
              <button onClick={() => setViewingGroup(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">✕</button>
            </div>

            {/* Stats */}
            <div className="flex gap-4 mb-5">
              <div className="flex-1 p-3 bg-milk-50 dark:bg-milk-900/20 rounded-xl text-center">
                <div className="text-2xl font-bold text-milk-600 dark:text-milk-400">{viewingGroup.totalCups}</div>
                <div className="text-xs text-gray-500">杯</div>
              </div>
              <div className="flex-1 p-3 bg-tea-50 dark:bg-tea-900/20 rounded-xl text-center">
                <div className="text-2xl font-bold text-tea-600 dark:text-tea-400">${viewingGroup.totalAmount}</div>
                <div className="text-xs text-gray-500">總計</div>
              </div>
              <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                  {new Set(viewingGroup.items.map(i => i.personName)).size}
                </div>
                <div className="text-xs text-gray-500">人</div>
              </div>
            </div>

            {/* Format Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setViewFormat('person')}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all
                  ${viewFormat === 'person'
                    ? 'bg-milk-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }`}
              >
                👤 按人分組
              </button>
              <button
                onClick={() => setViewFormat('summary')}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all
                  ${viewFormat === 'summary'
                    ? 'bg-milk-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }`}
              >
                🧋 品項彙總
              </button>
            </div>

            {/* Preview */}
            <pre className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-700 dark:text-gray-300 
                            whitespace-pre-wrap break-words font-mono leading-relaxed max-h-60 overflow-y-auto">
              {viewFormat === 'person'
                ? formatByPerson(viewingGroup.storeName, viewingGroup.items)
                : formatBySummary(viewingGroup.storeName, viewingGroup.items)}
            </pre>

            {/* Copy Button */}
            <div className="mt-5">
              <button
                onClick={() => handleCopyHistory(viewingGroup)}
                className={`w-full py-3.5 rounded-xl font-semibold shadow-lg transition-all duration-200 active:scale-[0.98]
                  ${copied
                    ? 'bg-tea-500 text-white shadow-tea-500/30'
                    : 'bg-gradient-to-r from-milk-500 to-milk-600 hover:from-milk-600 hover:to-milk-700 text-white shadow-milk-500/30'
                  }`}
              >
                {copied ? '✅ 已複製！' : '📋 複製訂單文字'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
