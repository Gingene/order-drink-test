import { useState, useEffect } from 'react';
import type { StoreMenu, MenuItem as MenuItemType, StoreInfo } from '../types';
import { fetchStoreIndex, fetchMenu, saveMenu, exportMenuJSON, importMenuJSON } from '../utils/menuStorage';

interface Props {
  onBack: () => void;
}

export default function AdminPanel({ onBack }: Props) {
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [menu, setMenu] = useState<StoreMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // Editing states
  const [editingItem, setEditingItem] = useState<MenuItemType | null>(null);
  const [editingCategory, setEditingCategory] = useState<string>('');

  useEffect(() => {
    fetchStoreIndex()
      .then(data => setStores(data.stores))
      .finally(() => setLoading(false));
  }, []);

  const loadMenu = async (storeId: string, menuFile: string) => {
    setLoading(true);
    try {
      const m = await fetchMenu(storeId, menuFile);
      setMenu(m);
      setSelectedStoreId(storeId);
    } catch (e) {
      setMessage(`❌ 載入失敗: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!menu || !selectedStoreId) return;
    saveMenu(selectedStoreId, menu);
    setMessage('✅ 已成功儲存菜單資料到瀏覽器本地！');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExport = () => {
    if (!menu) return;
    const json = exportMenuJSON(menu);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${menu.storeId}-menu.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const imported = importMenuJSON(text);
        setMenu(imported);
        setSelectedStoreId(imported.storeId);
        setMessage('✅ 菜單檔案匯入成功！請點選「儲存」以確認變更');
        setTimeout(() => setMessage(null), 4000);
      } catch (err) {
        setMessage(`❌ 匯入失敗: ${err}`);
      }
    };
    input.click();
  };

  const addItem = (categoryIndex: number) => {
    if (!menu) return;
    const newItem: MenuItemType = {
      id: `custom-${Date.now()}`,
      name: '新品項飲料',
      prices: { M: 30 },
      tags: ['新品'],
    };
    const updated = { ...menu };
    updated.categories = [...updated.categories];
    updated.categories[categoryIndex] = {
      ...updated.categories[categoryIndex],
      items: [...updated.categories[categoryIndex].items, newItem],
    };
    setMenu(updated);
    setEditingItem(newItem);
    setEditingCategory(updated.categories[categoryIndex].name);
  };

  const deleteItem = (categoryIndex: number, itemIndex: number) => {
    if (!menu) return;
    const updated = { ...menu };
    updated.categories = [...updated.categories];
    updated.categories[categoryIndex] = {
      ...updated.categories[categoryIndex],
      items: updated.categories[categoryIndex].items.filter((_, i) => i !== itemIndex),
    };
    setMenu(updated);
  };

  const addCategory = () => {
    if (!menu) return;
    const updated = { ...menu };
    updated.categories = [...updated.categories, { name: '自訂新分類', items: [] }];
    setMenu(updated);
  };

  const updateCategoryName = (index: number, name: string) => {
    if (!menu) return;
    const updated = { ...menu };
    updated.categories = [...updated.categories];
    updated.categories[index] = { ...updated.categories[index], name };
    setMenu(updated);
  };

  const deleteCategory = (index: number) => {
    if (!menu) return;
    if (menu.categories[index].items.length > 0) {
      if (!confirm('此分類下仍有飲料品項，確定要全部刪除嗎？')) return;
    }
    const updated = { ...menu };
    updated.categories = updated.categories.filter((_, i) => i !== index);
    setMenu(updated);
  };

  const saveItemEdit = (item: MenuItemType) => {
    if (!menu || !editingCategory) return;
    const updated = { ...menu };
    updated.categories = updated.categories.map(cat => {
      if (cat.name !== editingCategory) return cat;
      return {
        ...cat,
        items: cat.items.map(i => i.id === item.id ? item : i),
      };
    });
    setMenu(updated);
    setEditingItem(null);
    setEditingCategory('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-gradient-to-br from-milk-50 to-tea-50 dark:from-zinc-950 dark:to-zinc-900">
        <div className="text-center animate-pulse">
          <div className="text-4xl mb-2">⚙️</div>
          <p className="text-sm text-gray-500">載入管理系統中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3.5 mb-8 animate-slide-up">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          title="返回首頁"
        >
          ←
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-800 dark:text-zinc-200 flex items-center gap-1.5">
            <span>⚙️</span> 菜單管理控制台
          </h2>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">客製化您的店面飲品、價格與配料規格</p>
        </div>
      </div>

      {/* Message Notifications Banner */}
      {message && (
        <div className="mb-6 p-3.5 bg-milk-50 dark:bg-milk-900/10 border border-milk-200/20 dark:border-milk-850/40 rounded-xl text-xs font-bold text-milk-800 dark:text-milk-400 animate-slide-up">
          {message}
        </div>
      )}

      {/* Store not selected (List of available stores to edit) */}
      {!selectedStoreId && (
        <div className="space-y-4 animate-fade-in">
          <p className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider pl-1">
            請選擇欲編輯的店家菜單
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {stores.map(store => (
              <button
                key={store.id}
                onClick={() => loadMenu(store.id, store.menuFile)}
                className="w-full p-5 bg-white/90 dark:bg-zinc-800/80 rounded-2xl border border-gray-200/40 dark:border-zinc-800/80 
                           text-left hover:border-milk-400 hover:shadow-lg dark:hover:border-milk-900/60 hover:scale-[1.01] transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-milk-50 dark:bg-milk-950/20 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">🏪</span>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-800 dark:text-zinc-200 group-hover:text-milk-600 transition-colors">{store.name}</h3>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5 truncate">{store.description || '點擊載入編輯菜單'}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-4">
            <button
              onClick={handleImport}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-400 hover:border-milk-400 hover:text-milk-600 dark:hover:text-milk-550 hover:bg-milk-50/10 transition-colors cursor-pointer"
            >
              📁 匯入外部 JSON 菜單檔案 (.json)
            </button>
          </div>
        </div>
      )}

      {/* Active Menu Editor */}
      {selectedStoreId && menu && (
        <div className="space-y-6 animate-fade-in">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 dark:bg-zinc-800/40 p-3 rounded-2xl border border-gray-200/40 dark:border-zinc-800/80">
            <button
              onClick={() => { setSelectedStoreId(null); setMenu(null); }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all cursor-pointer"
            >
              ← 店家列表
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all cursor-pointer"
              >
                📤 匯出 JSON
              </button>
              
              <button
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-milk-500 to-milk-600 hover:from-milk-600 hover:to-milk-700 text-white shadow-md shadow-milk-500/25 transition-all cursor-pointer"
              >
                💾 儲存變更
              </button>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-lg">🏬</span>
            <h3 className="font-extrabold text-lg text-gray-800 dark:text-zinc-200">
              {menu.storeName}
            </h3>
            <span className="text-xs text-gray-400 dark:text-zinc-500 font-medium">編輯中</span>
          </div>

          {/* Categories Grid list */}
          <div className="space-y-5">
            {menu.categories.map((cat, catIdx) => (
              <div key={catIdx} className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-800/80 p-5 shadow-sm space-y-4">
                {/* Category Header Row */}
                <div className="flex items-center gap-3 border-b border-gray-50 dark:border-zinc-800 pb-3">
                  <span className="text-sm">📂</span>
                  <input
                    type="text"
                    value={cat.name}
                    onChange={e => updateCategoryName(catIdx, e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-gray-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-milk-400/40"
                  />
                  <button
                    onClick={() => deleteCategory(catIdx)}
                    className="text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer"
                  >
                    刪除分類
                  </button>
                </div>

                {/* Items List inside Category */}
                <div className="space-y-2">
                  {cat.items.map((item, itemIdx) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between gap-3 p-3 bg-gray-50/50 dark:bg-zinc-900/30 rounded-xl border border-gray-200/10 dark:border-zinc-800/40 group hover:border-milk-200/50 dark:hover:border-milk-900/30 transition-all"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-bold text-gray-750 dark:text-zinc-200">{item.name}</span>
                          {item.tags && item.tags.length > 0 && (
                            <span className="text-[9px] font-semibold text-gray-400 dark:text-zinc-500">
                              {item.tags.join(', ')}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5 font-medium">
                          {Object.entries(item.prices).map(([s, p]) => `${s}: $${p}`).join(' | ')}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => { setEditingItem({ ...item }); setEditingCategory(cat.name); }}
                          className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-milk-50 dark:bg-milk-950/25 text-milk-600 dark:text-milk-400 hover:bg-milk-100 dark:hover:bg-milk-900/30 transition-colors cursor-pointer"
                        >
                          編輯
                        </button>
                        <button
                          onClick={() => deleteItem(catIdx, itemIdx)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                          title="刪除"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => addItem(catIdx)}
                  className="w-full py-2.5 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 text-[11px] font-bold text-gray-400 hover:border-milk-400 hover:text-milk-500 transition-colors cursor-pointer"
                >
                  + 新增飲品品項
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addCategory}
            className="w-full py-3.5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-500 hover:border-milk-400 hover:text-milk-600 hover:bg-milk-50/5 transition-colors cursor-pointer"
          >
            + 新增選單大分類
          </button>
        </div>
      )}

      {/* Item Editor Modal Overlay */}
      {editingItem && (
        <ItemEditor
          item={editingItem}
          onSave={saveItemEdit}
          onCancel={() => { setEditingItem(null); setEditingCategory(''); }}
        />
      )}
    </div>
  );
}

// --- Item Editor Sub-component ---
function ItemEditor({
  item,
  onSave,
  onCancel,
}: {
  item: MenuItemType;
  onSave: (item: MenuItemType) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(item.name);
  const [pricesStr, setPricesStr] = useState(
    Object.entries(item.prices).map(([k, v]) => `${k}:${v}`).join(', ')
  );
  const [tagsStr, setTagsStr] = useState((item.tags ?? []).join(', '));

  const handleSave = () => {
    // Parse prices
    const prices: Record<string, number> = {};
    pricesStr.split(',').forEach(s => {
      const [k, v] = s.trim().split(':');
      if (k && v) prices[k.trim()] = parseInt(v.trim()) || 0;
    });

    const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);

    onSave({ ...item, name, prices, tags });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[24px] p-6 shadow-2xl animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-extrabold text-base text-gray-800 dark:text-zinc-100 flex items-center gap-1.5">
            <span>✏️</span> 編輯飲品規格
          </h3>
          <button 
            onClick={onCancel}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">飲料品名</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-milk-400/40 focus:border-milk-400 text-gray-800 dark:text-zinc-200"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              規格價格 <span className="text-[10px] text-gray-400 font-normal">（格式如 L:50, M:40）</span>
            </label>
            <input
              type="text"
              value={pricesStr}
              onChange={e => setPricesStr(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-milk-400/40 focus:border-milk-400 text-gray-800 dark:text-zinc-200"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              標籤定義 <span className="text-[10px] text-gray-400 font-normal">（英文/中文逗號分隔）</span>
            </label>
            <input
              type="text"
              value={tagsStr}
              onChange={e => setTagsStr(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-milk-400/40 focus:border-milk-400 text-gray-800 dark:text-zinc-200"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-milk-500 to-milk-600 hover:from-milk-600 hover:to-milk-700 text-white shadow-md shadow-milk-500/25 transition-colors cursor-pointer"
          >
            儲存規格
          </button>
        </div>
      </div>
    </div>
  );
}
