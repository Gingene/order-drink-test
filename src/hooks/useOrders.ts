import { useState, useCallback, useEffect } from 'react';
import type { OrderItem, GroupOrder } from '../types';
import {
  getActiveGroup,
  saveActiveGroup,
  getGroupHistory,
  saveGroupHistory,
  generateId,
} from '../utils/formatOrder';

export function useOrders(storeId: string | null, storeName: string | null) {
  const [activeGroup, setActiveGroup] = useState<GroupOrder | null>(null);
  const [history, setHistory] = useState<GroupOrder[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = getActiveGroup();
    if (saved && saved.storeId === storeId) {
      setActiveGroup(saved);
    }
    setHistory(getGroupHistory());
  }, [storeId]);

  // Persist active group changes
  useEffect(() => {
    saveActiveGroup(activeGroup);
  }, [activeGroup]);

  // Start a new group order
  const startNewGroup = useCallback(() => {
    if (!storeId || !storeName) return;
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
  }, [storeId, storeName]);

  // Resume an existing group (from history or active)
  const resumeGroup = useCallback((group: GroupOrder) => {
    setActiveGroup({ ...group, status: 'active' });
  }, []);

  // Add an order item
  const addItem = useCallback((item: Omit<OrderItem, 'id' | 'subtotal'>) => {
    setActiveGroup(prev => {
      if (!prev) return null;
      const subtotal = (item.price + item.toppings.reduce((s, t) => s + t.price, 0)) * item.quantity;
      const newItem: OrderItem = {
        ...item,
        id: generateId(),
        subtotal,
      };
      const items = [...prev.items, newItem];
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
  const closeGroup = useCallback(() => {
    setActiveGroup(prev => {
      if (!prev) return null;
      const closed = { ...prev, status: 'closed' as const, closedAt: new Date().toISOString() };
      const newHistory = [closed, ...getGroupHistory()];
      saveGroupHistory(newHistory);
      setHistory(newHistory);
      return null;
    });
  }, []);

  // Delete a history item
  const deleteHistoryItem = useCallback((groupId: string) => {
    const newHistory = history.filter(h => h.id !== groupId);
    saveGroupHistory(newHistory);
    setHistory(newHistory);
  }, [history]);

  return {
    activeGroup,
    history,
    startNewGroup,
    resumeGroup,
    addItem,
    removeItem,
    updateItem,
    closeGroup,
    deleteHistoryItem,
  };
}
