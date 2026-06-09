import { useState } from 'react';
import type { StoreInfo, GroupOrder } from './types';
import { useStoreIndex, useMenu } from './hooks/useMenu';
import { useOrders } from './hooks/useOrders';
import StoreSelector from './components/StoreSelector';
import MenuBrowser from './components/MenuBrowser';
import AdminPanel from './components/AdminPanel';
import './index.css';

type Page = 'select' | 'menu' | 'admin';

function App() {
  const [page, setPage] = useState<Page>('select');
  const [selectedStore, setSelectedStore] = useState<StoreInfo | null>(null);

  const { stores, loading: storesLoading } = useStoreIndex();
  const { menu, loading: menuLoading } = useMenu(
    selectedStore?.id ?? null,
    selectedStore?.menuFile ?? null
  );

  const {
    activeGroup, history,
    startNewGroup, resumeGroup,
    addItem, removeItem,
    closeGroup,
  } = useOrders(selectedStore?.id ?? null, selectedStore?.name ?? null);

  const handleSelectStore = (store: StoreInfo) => {
    setSelectedStore(store);
    setPage('menu');
  };

  const handleResumeGroup = (group: GroupOrder) => {
    // Find the store info from stores list
    const store = stores.find(s => s.id === group.storeId);
    if (store) {
      setSelectedStore(store);
      resumeGroup(group);
      setPage('menu');
    }
  };

  const handleBack = () => {
    setPage('select');
    setSelectedStore(null);
  };

  const handleCloseGroup = () => {
    closeGroup();
    setPage('select');
    setSelectedStore(null);
  };

  // Dark mode toggle
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="relative">
      {/* Dark mode toggle */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full
                   bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700
                   shadow-lg hover:scale-110 transition-all duration-200"
        title={darkMode ? '切換亮色模式' : '切換深色模式'}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      {/* Pages */}
      {page === 'select' && (
        <StoreSelector
          stores={stores}
          loading={storesLoading}
          activeGroup={activeGroup}
          history={history}
          onSelectStore={handleSelectStore}
          onResumeGroup={handleResumeGroup}
          onNavigateAdmin={() => setPage('admin')}
        />
      )}

      {page === 'menu' && menu && (
        <MenuBrowser
          menu={menu}
          activeGroup={activeGroup}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          onBack={handleBack}
          onCloseGroup={handleCloseGroup}
          onStartGroup={startNewGroup}
        />
      )}

      {page === 'menu' && menuLoading && (
        <div className="flex items-center justify-center min-h-dvh">
          <div className="text-center animate-fade-in">
            <div className="text-5xl mb-4 animate-bounce">🧋</div>
            <p className="text-gray-500">載入菜單中...</p>
          </div>
        </div>
      )}

      {page === 'admin' && (
        <AdminPanel onBack={handleBack} />
      )}
    </div>
  );
}

export default App;
