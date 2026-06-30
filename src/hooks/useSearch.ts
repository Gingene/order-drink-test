import { useState, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';
import type { StoreMenu, SearchableItem } from '../types';

export function useSearch(menu: StoreMenu | null) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

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

  // Extract all unique tags
  const allTags = useMemo<string[]>(() => {
    if (!menu) return [];
    const tagsSet = new Set<string>();
    menu.categories.forEach(cat => {
      cat.items.forEach(item => {
        if (item.tags) {
          item.tags.forEach(tag => {
            if (tag.trim()) {
              tagsSet.add(tag.trim());
            }
          });
        }
      });
    });
    return Array.from(tagsSet).sort((a, b) => a.localeCompare(b, 'zh-Hant'));
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

    // Filter by tag
    if (selectedTag) {
      items = items.filter(item => item.tags && item.tags.includes(selectedTag));
    }

    // Filter by category
    if (activeCategory) {
      items = items.filter(item => item.categoryName === activeCategory);
    }

    return items;
  }, [query, selectedTag, activeCategory, fuse, allItems]);

  const categories = useMemo(() => {
    if (!menu) return [];
    return menu.categories.map(c => c.name);
  }, [menu]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setActiveCategory(null);
    setSelectedTag(null);
  }, []);

  return {
    query,
    setQuery,
    activeCategory,
    setActiveCategory,
    selectedTag,
    setSelectedTag,
    allTags,
    results,
    categories,
    clearSearch,
  };
}
