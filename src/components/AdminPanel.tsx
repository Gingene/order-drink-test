import { useState, useEffect } from 'react';
import type { StoreMenu, MenuItem as MenuItemType } from '../types';
import { fetchStoreIndex, fetchMenu, saveMenu, exportMenuJSON, importMenuJSON } from '../utils/menuStorage';

interface Props {
  onBack: () => void;
}

export default function AdminPanel({ onBack }: Props) {
  const [stores, setStores] = useState<{ id: string; name: string; menuFile: string }[]>([]);
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
      setMessage(`載入失敗: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!menu || !selectedStoreId) return;
    saveMenu(selectedStoreId, menu);
    setMessage('✅ 已儲存到本地！');
    setTimeout(() => setMessage(null), 2000);
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
        setMessage('✅ 匯入成功！記得點儲存');
        setTimeout(() => setMessage(null), 3000);
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
      name: '新品項',
      prices: { M: 30 },
      tags: [],
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
    updated.categories = [...updated.categories, { name: '新分類', items: [] }];
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
      if (!confirm('此分類下有品項，確定要刪除嗎？')) return;
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
      <div className="flex items-center justify-center min-h-dvh">
        <p className="text-gray-500">載入中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">⚙️ 菜單管理</h2>
      </div>

      {/* Message */}
      {message && (
        <div className="mb-4 p-3 bg-milk-50 dark:bg-milk-900/20 border border-milk-200 dark:border-milk-800 rounded-xl text-sm text-milk-700 dark:text-milk-300 animate-slide-up">
          {message}
        </div>
      )}

      {/* Store not selected */}
      {!selectedStoreId && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">選擇要編輯的店家菜單</p>
          {stores.map(store => (
            <button
              key={store.id}
              onClick={() => loadMenu(store.id, store.menuFile)}
              className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 
                         hover:shadow-md hover:border-milk-300 dark:hover:border-milk-600 text-left transition-all"
            >
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">{store.name}</h3>
            </button>
          ))}

          <div className="mt-6">
            <button
              onClick={handleImport}
              className="w-full p-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-500 dark:text-gray-400
                         hover:border-milk-400 hover:text-milk-600 transition-colors"
            >
              📁 匯入 JSON 菜單檔
            </button>
          </div>
        </div>
      )}

      {/* Menu Editor */}
      {selectedStoreId && menu && (
        <div>
          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => { setSelectedStoreId(null); setMenu(null); }}
              className="px-4 py-2 rounded-xl text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              ← 回店家列表
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl text-sm bg-milk-500 text-white hover:bg-milk-600 shadow-md transition-colors"
            >
              💾 儲存
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-xl text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              📤 匯出 JSON
            </button>
          </div>

          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4">{menu.storeName}</h3>

          {/* Categories */}
          <div className="space-y-6">
            {menu.categories.map((cat, catIdx) => (
              <div key={catIdx} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={cat.name}
                    onChange={e => updateCategoryName(catIdx, e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-milk-400/50"
                  />
                  <button
                    onClick={() => deleteCategory(catIdx)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    刪除分類
                  </button>
                </div>

                <div className="space-y-2">
                  {cat.items.map((item, itemIdx) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-200">{item.name}</span>
                      <span className="text-xs text-gray-400">
                        {Object.entries(item.prices).map(([s, p]) => `${s}:$${p}`).join(' ')}
                      </span>
                      <button
                        onClick={() => { setEditingItem({ ...item }); setEditingCategory(cat.name); }}
                        className="text-xs text-milk-500 hover:text-milk-700 transition-colors"
                      >
                        編輯
                      </button>
                      <button
                        onClick={() => deleteItem(catIdx, itemIdx)}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        刪除
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => addItem(catIdx)}
                  className="mt-2 w-full py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-xs text-gray-400 hover:border-milk-400 hover:text-milk-500 transition-colors"
                >
                  + 新增品項
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addCategory}
            className="mt-4 w-full py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-500 hover:border-milk-400 hover:text-milk-600 transition-colors"
          >
            + 新增分類
          </button>
        </div>
      )}

      {/* Item Editor Modal */}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4">編輯品項</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">品名</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-milk-400/50"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              價格 <span className="text-xs text-gray-400">（格式：L:50, M:40）</span>
            </label>
            <input
              type="text"
              value={pricesStr}
              onChange={e => setPricesStr(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-milk-400/50"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              標籤 <span className="text-xs text-gray-400">（逗號分隔）</span>
            </label>
            <input
              type="text"
              value={tagsStr}
              onChange={e => setTagsStr(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-milk-400/50"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-sm bg-milk-500 text-white hover:bg-milk-600 shadow-md transition-colors"
          >
            儲存
          </button>
        </div>
      </div>
    </div>
  );
}
