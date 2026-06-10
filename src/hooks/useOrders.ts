import { useState, useCallback, useEffect } from 'react';
import type { OrderItem, GroupOrder } from '../types';
import {
  getActiveGroup,
  saveActiveGroup,
  getGroupHistory,
  saveGroupHistory,
  generateId,
} from '../utils/formatOrder';

export function useOrders() {
  // Lazy initialization from localStorage — runs once, avoids race with save effect
  const [activeGroup, setActiveGroup] = useState<GroupOrder | null>(() => getActiveGroup());
  const [history, setHistory] = useState<GroupOrder[]>(() => getGroupHistory());

  // Persist active group changes
  useEffect(() => {
    saveActiveGroup(activeGroup);
  }, [activeGroup]);

  // Start a new group order — clears any existing active group
  const startNewGroup = useCallback((storeId: string, storeName: string) => {
    const group: GroupOrder = {
      id: generateId(),
      storeId,
      storeName,
      createdAt: new Date().toISOString(),
      items: [],
      totalAmount: 0,
      totalCups: 0,
      status: 'active',
    };
    setActiveGroup(group);
  }, []);

  // Clear the active group (e.g., when switching stores)
  const clearActiveGroup = useCallback(() => {
    setActiveGroup(null);
  }, []);

  // Add an order item, merging with existing identical drink if found
  const addItem = useCallback((item: Omit<OrderItem, 'id' | 'subtotal'>) => {
    setActiveGroup(prev => {
      if (!prev) return null;

      // Check for duplicate: same person + same item + same size + same sweet + same ice + same toppings
      // Note: different notes are treated as different items
      const toppingsKey = item.toppings.map(t => t.name).sort().join(',');
      const duplicateIndex = prev.items.findIndex(existing => {
        const existingToppingsKey = existing.toppings.map(t => t.name).sort().join(',');
        return (
          existing.personName === item.personName &&
          existing.menuItemId === item.menuItemId &&
          existing.size === item.size &&
          existing.sweet === item.sweet &&
          existing.ice === item.ice &&
          existingToppingsKey === toppingsKey &&
          (existing.note ?? '') === (item.note ?? '')
        );
      });

      let items: OrderItem[];
      if (duplicateIndex >= 0) {
        // Merge: increase quantity
        items = prev.items.map((existing, idx) => {
          if (idx !== duplicateIndex) return existing;
          const newQty = existing.quantity + item.quantity;
          const newSubtotal = (existing.price + existing.toppings.reduce((s, t) => s + t.price, 0)) * newQty;
          return { ...existing, quantity: newQty, subtotal: newSubtotal };
        });
      } else {
        // New item
        const subtotal = (item.price + item.toppings.reduce((s, t) => s + t.price, 0)) * item.quantity;
        const newItem: OrderItem = {
          ...item,
          id: generateId(),
          subtotal,
        };
        items = [...prev.items, newItem];
      }

      return {
        ...prev,
        items,
        totalAmount: items.reduce((s, i) => s + i.subtotal, 0),
        totalCups: items.reduce((s, i) => s + i.quantity, 0),
      };
    });
  }, []);

  // Remove an order item
  const removeItem = useCallback((itemId: string) => {
    setActiveGroup(prev => {
      if (!prev) return null;
      const items = prev.items.filter(i => i.id !== itemId);
      return {
        ...prev,
        items,
        totalAmount: items.reduce((s, i) => s + i.subtotal, 0),
        totalCups: items.reduce((s, i) => s + i.quantity, 0),
      };
    });
  }, []);

  // Remove all items for a specific person
  const removePersonItems = useCallback((personName: string) => {
    setActiveGroup(prev => {
      if (!prev) return null;
      const items = prev.items.filter(i => i.personName !== personName);
      return {
        ...prev,
        items,
        totalAmount: items.reduce((s, i) => s + i.subtotal, 0),
        totalCups: items.reduce((s, i) => s + i.quantity, 0),
      };
    });
  }, []);

  // Update an order item
  const updateItem = useCallback((itemId: string, updates: Partial<Omit<OrderItem, 'id' | 'subtotal'>>) => {
    setActiveGroup(prev => {
      if (!prev) return null;
      const items = prev.items.map(item => {
        if (item.id !== itemId) return item;
        const updated = { ...item, ...updates };
        updated.subtotal = (updated.price + updated.toppings.reduce((s, t) => s + t.price, 0)) * updated.quantity;
        return updated;
      });
      return {
        ...prev,
        items,
        totalAmount: items.reduce((s, i) => s + i.subtotal, 0),
        totalCups: items.reduce((s, i) => s + i.quantity, 0),
      };
    });
  }, []);

  // Close the current group (save to history)
  // Read from closure directly — event handlers are NOT double-invoked by StrictMode
  const closeGroup = useCallback(() => {
    if (!activeGroup) return;
    const closed = { ...activeGroup, status: 'closed' as const, closedAt: new Date().toISOString() };
    const newHistory = [closed, ...history];
    saveGroupHistory(newHistory);
    setHistory(newHistory);
    setActiveGroup(null);
  }, [activeGroup, history]);

  // Delete a history item
  const deleteHistoryItem = useCallback((groupId: string) => {
    setHistory(prev => {
      const newHistory = prev.filter(h => h.id !== groupId);
      saveGroupHistory(newHistory);
      return newHistory;
    });
  }, []);

  return {
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
  };
}
