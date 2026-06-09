import { useState, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';
import type { StoreMenu, SearchableItem } from '../types';

export function useSearch(menu: StoreMenu | null) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Flatten all items with category info for search
  const allItems = useMemo<SearchableItem[]>(() => {
    if (!menu) return [];
    return menu.categories.flatMap(cat =>
      cat.items.map(item => ({
        ...item,
        categoryName: cat.name,
      }))
    );
  }, [menu]);

  // Create Fuse instance for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(allItems, {
      keys: [
        { name: 'name', weight: 0.5 },
        { name: 'tags', weight: 0.3 },
        { name: 'categoryName', weight: 0.2 },
      ],
      threshold: 0.4,   // fuzzy tolerance
      distance: 100,
      includeScore: true,
      minMatchCharLength: 1,
    });
  }, [allItems]);

  // Search results
  const results = useMemo(() => {
    let items: SearchableItem[];

    if (query.trim()) {
      items = fuse.search(query).map(r => r.item);
    } else {
      items = allItems;
    }

    // Filter by category
    if (activeCategory) {
      items = items.filter(item => item.categoryName === activeCategory);
    }

    return items;
  }, [query, activeCategory, fuse, allItems]);

  const categories = useMemo(() => {
    if (!menu) return [];
    return menu.categories.map(c => c.name);
  }, [menu]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setActiveCategory(null);
  }, []);

  return {
    query,
    setQuery,
    activeCategory,
    setActiveCategory,
    results,
    categories,
    clearSearch,
  };
}
