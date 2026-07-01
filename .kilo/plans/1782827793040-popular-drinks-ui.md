# 熱門飲料 UI 計畫

## 目標
在 MenuBrowser（店家菜單頁）頂部新增「🔥 熱門飲料」區塊，根據該店家已關閉的歷史團購紀錄統計總點購杯數，顯示前 5 名並可點擊直接加入訂單。

## 設計決策
- **位置**：MenuBrowser 頂部（在 sticky 搜尋列之下、菜單清單之上）。
- **統計來源**：localStorage `getGroupHistory()` 中 `storeId === menu.storeId` 且 `status === 'closed'` 的團。
- **排序依據**：以 `menuItemId` 為 key（不分 size/甜度/冰塊/加料），累加 `quantity`，依總杯數 desc 排序。
- **顯示數量**：Top 5。
- **點擊行為**：開啟 `OrderForm`（與現有 `MenuItem` 點擊一致），透過 `setSelectedItem`。
- **不存在的品項**：只保留當前 `menu.categories` 找得到的 `menuItemId`，其餘略過。
- **無歷史**：該店家無符合歷史時，整個熱門區塊不渲染。
- **搜尋/篩選時**：`query` 非空、或 `activeCategory`/`selectedTag` 任一有值時，隱藏熱門區塊（讓結果清單乾淨）。

## 變更任務

### 1. 新增 hook `src/hooks/usePopularItems.ts`
- 匯出 `usePopularItems(menu: StoreMenu | null, history: GroupOrder[]): { item: SearchableItem; count: number }[]`
- 用 `useMemo`：
  1. 過濾 `history` 為同 `storeId` 且 `status === 'closed'`。
  2. 建立 `menuItemId → totalQty` Map（遍歷各團 `items` 累加 `quantity`）。
  3. 建構 `menu` 的 `SearchableItem` 查詢表（與 `useSearch.allItems` 同邏輯：`flatMap` categories + `categoryName`）。
  4. 過濾 Map 只保留查詢表中存在的 id。
  5. 依 count desc 排序，取前 5 回傳。

### 2. 新增元件 `src/components/PopularDrinks.tsx`
- Props: `{ items: { item: SearchableItem; count: number }[]; onSelect: (item: SearchableItem) => void }`
- 標題列：`🔥 熱門飲料`。
- 橫向 scroll 或 grid 卡片，每張卡片顯示：品項名、最低價、杯數徽章（`x N 杯`）。
- 點擊呼叫 `onSelect(item)`，樣式沿用 `MenuItem` 的卡片風格（`milk` 色、hover scale、`animate-slide-up`）。
- 不依賴 `MenuItem` 元件以容納 count 徽章，但視覺一致。

### 3. 修改 `src/App.tsx`
- 將 `useOrders()` 回傳的 `history` 透過 props 傳給 `MenuBrowser`（新增 `history` prop）。

### 4. 修改 `src/components/MenuBrowser.tsx`
- Props 新增 `history: GroupOrder[]`。
- 呼叫 `usePopularItems(menu, history)`。
- 計算 `hasFilter = query.trim() !== '' || activeCategory !== null || selectedTag !== null`。
- 在「Menu Items」區塊上方，當 `popularItems.length > 0 && !hasFilter` 時渲染 `<PopularDrinks items={popularItems} onSelect={setSelectedItem} />`。
- 維持既有 `MenuItem` 點擊邏輯（`setSelectedItem`），熱門卡片複用同一 flow，點擊後 `OrderForm` 開啟路徑不變。

## 型別
- 在 `src/types/index.ts` 不需新增型別；hook 內以內聯型別 `{ item: SearchableItem; count: number }[]` 回傳。若需重用可匯出 `PopularItem` 介面（可選）。

## 失敗模式
- `menu` 為 null：hook 回傳空陣列（已由 `useMenu` loading 狀態保護）。
- `history` localStorage 解析失敗：`getGroupHistory` 已有 try/catch 回 `[]`，熱門區塊自動隱藏。
- 同一 `menuItemId` 在多個 category 重複：以 `flatMap.find` 取第一個（與 `handleEditOrder` 現有行為一致）。

## 驗證
- `npm run lint`、`npm run typecheck`（或 `tsc --noEmit`）通過。
- 手動：對某店家建立並結單數個團（含同一飲品不同 size/冰甜），返回該店家頁應看到 Top 5 含杯數徽章；點擊開啟 OrderForm。
- 刪除該店家所有歷史後，熱門區塊應消失。
- 輸入搜尋字或切分類時，熱門區塊隱藏。
- 歷史含已從菜單移除的 menuItemId 時不出現在熱門清單。

## 不在範圍
- 跨店家熱門排行、獨立頁面。
- 進行中團購納入統計。
- 按人數 / 團數排序。
