import type { StoreMenu, StoreIndex } from '../types';

const MENU_STORAGE_KEY = 'drink-order-menus';
const STORE_INDEX_KEY = 'drink-order-store-index';

/**
 * Get the stored (edited) version of a menu from localStorage.
 * Returns null if no edited version exists.
 */
export function getStoredMenu(storeId: string): StoreMenu | null {
  try {
    const stored = localStorage.getItem(`${MENU_STORAGE_KEY}-${storeId}`);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Save an edited menu to localStorage.
 */
export function saveMenu(storeId: string, menu: StoreMenu): void {
  localStorage.setItem(`${MENU_STORAGE_KEY}-${storeId}`, JSON.stringify(menu));
}

/**
 * Remove a stored menu edit from localStorage (revert to JSON file).
 */
export function removeStoredMenu(storeId: string): void {
  localStorage.removeItem(`${MENU_STORAGE_KEY}-${storeId}`);
}

/**
 * Get stored store index from localStorage (for admin-added stores).
 */
export function getStoredStoreIndex(): StoreIndex | null {
  try {
    const stored = localStorage.getItem(STORE_INDEX_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Save store index to localStorage.
 */
export function saveStoreIndex(index: StoreIndex): void {
  localStorage.setItem(STORE_INDEX_KEY, JSON.stringify(index));
}

/**
 * Fetch the store index, preferring localStorage version.
 */
export async function fetchStoreIndex(): Promise<StoreIndex> {
  const stored = getStoredStoreIndex();
  if (stored) return stored;

  const res = await fetch('/menus/index.json');
  if (!res.ok) throw new Error('Failed to load store index');
  return res.json();
}

/**
 * Fetch a store's menu, preferring localStorage version.
 */
export async function fetchMenu(storeId: string, menuFile: string): Promise<StoreMenu> {
  const stored = getStoredMenu(storeId);
  if (stored) return stored;

  const res = await fetch(`/menus/${menuFile}`);
  if (!res.ok) throw new Error(`Failed to load menu: ${menuFile}`);
  return res.json();
}

/**
 * Export menu as JSON string for download/sharing.
 */
export function exportMenuJSON(menu: StoreMenu): string {
  return JSON.stringify(menu, null, 2);
}

/**
 * Import menu from JSON string.
 */
export function importMenuJSON(jsonStr: string): StoreMenu {
  const menu = JSON.parse(jsonStr);
  if (!menu.storeId || !menu.storeName || !menu.categories) {
    throw new Error('Invalid menu format');
  }
  return menu as StoreMenu;
}
