import { useMemo } from 'react';
import type { StoreMenu, GroupOrder, SearchableItem } from '../types';

export interface PopularItem {
  item: SearchableItem;
  count: number;
}

export function usePopularItems(
  menu: StoreMenu | null,
  history: GroupOrder[],
): PopularItem[] {
  return useMemo<PopularItem[]>(() => {
    if (!menu) return [];

    // 1. Filter history to this store's closed groups
    const closedGroups = history.filter(
      (g) => g.storeId === menu.storeId && g.status === 'closed',
    );
    if (closedGroups.length === 0) return [];

    // 2. Aggregate total quantity per menuItemId
    const countMap = new Map<string, number>();
    for (const group of closedGroups) {
      for (const order of group.items) {
        countMap.set(
          order.menuItemId,
          (countMap.get(order.menuItemId) ?? 0) + order.quantity,
        );
      }
    }
    if (countMap.size === 0) return [];

    // 3. Build SearchableItem lookup table (first match per id)
    const lookup = new Map<string, SearchableItem>();
    for (const cat of menu.categories) {
      for (const item of cat.items) {
        if (!lookup.has(item.id)) {
          lookup.set(item.id, { ...item, categoryName: cat.name });
        }
      }
    }

    // 4. Keep only items still present in the menu, sort by count desc, take top 10
    const popular: PopularItem[] = [];
    for (const [id, count] of countMap) {
      const item = lookup.get(id);
      if (item) {
        popular.push({ item, count });
      }
    }
    popular.sort((a, b) => b.count - a.count);
    return popular.slice(0, 10);
  }, [menu, history]);
}
