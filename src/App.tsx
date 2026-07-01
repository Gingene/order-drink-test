import { useState, useRef, useEffect, useCallback } from "react";
import type { StoreInfo } from "./types";
import { useStoreIndex, useMenu } from "./hooks/useMenu";
import { useOrders } from "./hooks/useOrders";
import StoreSelector from "./components/StoreSelector";
import MenuBrowser from "./components/MenuBrowser";
import AdminPanel from "./components/AdminPanel";
import "./index.css";

type Page = "select" | "menu" | "admin";

const USER_NAME_KEY = "drink-order-user-name";

function App() {
  const [page, setPage] = useState<Page>("select");
  const [selectedStore, setSelectedStore] = useState<StoreInfo | null>(null);

  // userName: required, stored in localStorage
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem(USER_NAME_KEY) || "";
  });
  const [showNameGate, setShowNameGate] = useState(
    () => !localStorage.getItem(USER_NAME_KEY),
  );
  const [nameInput, setNameInput] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameInput, setEditNameInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const editNameRef = useRef<HTMLInputElement>(null);
  const gateInputRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showNameGate && gateInputRef.current) {
      gateInputRef.current.focus();
    }
  }, [showNameGate]);

  useEffect(() => {
    if (isEditingName && editNameRef.current) {
      editNameRef.current.focus();
      editNameRef.current.select();
    }
  }, [isEditingName]);

  // Click-outside to close settings dropdown
  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if (
      settingsRef.current &&
      !settingsRef.current.contains(e.target as Node)
    ) {
      setShowSettings(false);
      setIsEditingName(false);
    }
  }, []);

  useEffect(() => {
    if (showSettings) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showSettings, handleOutsideClick]);

  const handleNameGateSubmit = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setUserName(trimmed);
    localStorage.setItem(USER_NAME_KEY, trimmed);
    setShowNameGate(false);
    setNameInput("");
  };

  const handleEditNameSubmit = () => {
    const trimmed = editNameInput.trim();
    if (!trimmed) return;
    setUserName(trimmed);
    localStorage.setItem(USER_NAME_KEY, trimmed);
    setIsEditingName(false);
  };

  const { stores, loading: storesLoading } = useStoreIndex();
  const { menu, loading: menuLoading } = useMenu(
    selectedStore?.id ?? null,
    selectedStore?.menuFile ?? null,
  );

  const {
    activeGroup,
    history,
    startNewGroup,
    clearActiveGroup,
    addItem,
    removeItem,
    removePersonItems,
    updateItem,
    closeGroup,
    deleteHistoryItem,
  } = useOrders();

  const handleSelectStore = (store: StoreInfo) => {
    // If switching to a different store, clear previous active group
    if (activeGroup && activeGroup.storeId !== store.id) {
      clearActiveGroup();
    }
    setSelectedStore(store);
    setPage("menu");
  };

  const handleResumeActiveGroup = () => {
    if (!activeGroup) return;
    // Find the store info from stores list
    const store = stores.find((s) => s.id === activeGroup.storeId);
    if (store) {
      setSelectedStore(store);
      setPage("menu");
    }
  };

  const handleBack = () => {
    setPage("select");
    setSelectedStore(null);
  };

  const handleCloseGroup = () => {
    closeGroup();
    setPage("select");
    setSelectedStore(null);
  };

  const handleStartGroup = () => {
    if (selectedStore) {
      startNewGroup(selectedStore.id, selectedStore.name);
    }
  };

  // Dark mode toggle with localStorage persistence
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored) {
        const isDark = stored === "dark";
        document.documentElement.classList.toggle("dark", isDark);
        return isDark;
      }
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      document.documentElement.classList.toggle("dark", prefersDark);
      return prefersDark;
    }
    return false;
  });

  const toggleDarkMode = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  // Name gate modal — blocks everything
  if (showNameGate) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-milk-100 via-white to-tea-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="w-full max-w-sm mx-4 p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 animate-scale-in">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🧋</div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              歡迎使用飲料點餐
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              請先輸入您的名稱，此名稱將用於訂單彙總
            </p>
          </div>
          <div className="space-y-4">
            <input
              ref={gateInputRef}
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleNameGateSubmit();
              }}
              placeholder="請輸入您的名稱"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                         rounded-xl text-gray-800 dark:text-gray-100 placeholder:text-gray-400
                         focus:outline-none focus:ring-2 focus:ring-milk-400/50 focus:border-milk-400 transition-all text-center text-lg"
            />
            <button
              onClick={handleNameGateSubmit}
              disabled={!nameInput.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-milk-500 to-milk-600 hover:from-milk-600 hover:to-milk-700
                         text-white font-semibold rounded-xl shadow-lg shadow-milk-500/30 
                         hover:shadow-xl hover:shadow-milk-500/40
                         active:scale-[0.98] transition-all duration-200
                         disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-milk-500 disabled:hover:to-milk-600"
            >
              開始使用 →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Settings button + dropdown */}
      <div ref={settingsRef} className="fixed top-4 right-4 z-50">
        {/* Gear icon */}
        <button
          id="settings-toggle"
          onClick={() => {
            setShowSettings((prev) => !prev);
            setIsEditingName(false);
          }}
          className={`w-10 h-10 flex items-center justify-center rounded-full
                     bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700
                     shadow-lg hover:scale-110 transition-all duration-200 text-gray-600 dark:text-gray-300
                     ${showSettings ? "rotate-45 bg-white dark:bg-gray-800 scale-110" : ""}`}
          title="設定"
        >
          ⚙️
        </button>

        {/* Dropdown panel */}
        {showSettings && (
          <div
            className="absolute top-13 right-0 w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md
                          border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl
                          p-3 space-y-2 animate-scale-in origin-top-right"
          >
            {/* userName row */}
            <div className="px-1">
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-wide">
                使用者名稱
              </p>
              {isEditingName ? (
                <div className="flex items-center gap-1.5">
                  <input
                    ref={editNameRef}
                    type="text"
                    value={editNameInput}
                    onChange={(e) => setEditNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEditNameSubmit();
                      if (e.key === "Escape") setIsEditingName(false);
                    }}
                    className="flex-1 px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                               rounded-lg text-sm text-gray-800 dark:text-gray-100
                               focus:outline-none focus:ring-2 focus:ring-milk-400/50 focus:border-milk-400 transition-all"
                  />
                  <button
                    onClick={handleEditNameSubmit}
                    disabled={!editNameInput.trim()}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-milk-500 text-white text-sm
                               hover:bg-milk-600 transition-colors disabled:opacity-40 shrink-0"
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditNameInput(userName);
                    setIsEditingName(true);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg
                             bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700
                             text-left transition-colors group"
                >
                  <span className="text-base">👤</span>
                  <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                    {userName}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    編輯
                  </span>
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 dark:border-gray-800" />

            {/* Dark mode row */}
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg
                         hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
            >
              <span className="text-base">{darkMode ? "☀️" : "🌙"}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {darkMode ? "切換亮色模式" : "切換深色模式"}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Pages */}
      {page === "select" && (
        <StoreSelector
          stores={stores}
          loading={storesLoading}
          activeGroup={activeGroup}
          history={history}
          onSelectStore={handleSelectStore}
          onResumeActiveGroup={handleResumeActiveGroup}
          onDeleteHistoryItem={deleteHistoryItem}
          onNavigateAdmin={() => setPage("admin")}
        />
      )}

      {page === "menu" && menu && (
        <MenuBrowser
          menu={menu}
          activeGroup={activeGroup}
          onAddItem={addItem}
          onUpdateItem={updateItem}
          onRemoveItem={removeItem}
          onRemovePersonItems={removePersonItems}
          onBack={handleBack}
          onCloseGroup={handleCloseGroup}
          onStartGroup={handleStartGroup}
          userName={userName}
          history={history}
        />
      )}

      {page === "menu" && menuLoading && (
        <div className="flex items-center justify-center min-h-dvh">
          <div className="text-center animate-fade-in">
            <div className="text-5xl mb-4 animate-bounce">🧋</div>
            <p className="text-gray-500">載入菜單中...</p>
          </div>
        </div>
      )}

      {page === "admin" && <AdminPanel onBack={handleBack} />}
    </div>
  );
}

export default App;
