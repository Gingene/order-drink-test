import type { OrderItem, GroupOrder, StoreMenu } from '../types';

/**
 * Format: 按人分組
 */
export function formatByPerson(storeName: string, items: OrderItem[], menu?: StoreMenu): string {
  const grouped = new Map<string, OrderItem[]>();
  items.forEach(item => {
    const existing = grouped.get(item.personName) || [];
    existing.push(item);
    grouped.set(item.personName, existing);
  });

  let text = `📋 ${storeName} 團購訂單\n`;
  text += `━━━━━━━━━━━━━━\n`;

  grouped.forEach((orders, name) => {
    text += `👤 ${name}\n`;
    orders.forEach((order, idx) => {
      const details: string[] = [];
      if (order.sweet !== '固定') details.push(order.sweet);
      if (order.ice !== '固定') details.push(order.ice);
      const sweetIceStr = details.join('');
      const toppingsStr = order.toppings.length > 0
        ? ` +${order.toppings.map(t => t.name).join('+')}`
        : '';
      const detailPart = (sweetIceStr || toppingsStr) ? ` ${sweetIceStr}${toppingsStr}` : '';
      const noteStr = order.note ? ` (${order.note})` : '';

      const menuItem = menu?.categories
        .flatMap(c => c.items)
        .find(mi => mi.id === order.menuItemId);
      const hasMultipleSizes = menuItem ? Object.keys(menuItem.prices).length > 1 : true;
      const sizeStr = hasMultipleSizes ? `(${order.size})` : '';

      text += `  ${numToCircle(idx + 1)} ${order.itemName}${sizeStr}${detailPart} ×${order.quantity}  $${order.subtotal}${noteStr}\n`;
    });
    const personTotal = orders.reduce((sum, o) => sum + o.subtotal, 0);
    text += `  📎 小計 $${personTotal}\n\n`;
  });

  const totalCups = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);

  text += `━━━━━━━━━━━━━━\n`;
  text += `📊 共 ${totalCups} 杯 ｜ 💰 總計 $${totalAmount}`;

  return text;
}

/**
 * Format: 品項彙總（方便店家備料）
 */
export function formatBySummary(storeName: string, items: OrderItem[], userName?: string, menu?: StoreMenu): string {
  // Group by item name + size + sweet + ice + toppings combination
  const grouped = new Map<
    string,
    {
      item: OrderItem;
      totalQty: number;
      notes: Map<string, number>;
    }
  >();

  items.forEach(item => {
    const toppingsKey = item.toppings.map(t => t.name).sort().join(',');
    const key = `${item.itemName}|${item.size}|${item.sweet}|${item.ice}|${toppingsKey}`;

    const existing = grouped.get(key);
    if (existing) {
      existing.totalQty += item.quantity;
      if (item.note) {
        const count = existing.notes.get(item.note) || 0;
        existing.notes.set(item.note, count + item.quantity);
      }
    } else {
      const notes = new Map<string, number>();
      if (item.note) {
        notes.set(item.note, item.quantity);
      }
      grouped.set(key, {
        item,
        totalQty: item.quantity,
        notes,
      });
    }
  });

  const displayName = userName || storeName;
  let text = `📋 ${displayName}\n`;
  text += `━━━━━━━━━━━━━━\n`;

  let idx = 0;
  grouped.forEach(({ item, totalQty, notes }) => {
    idx++;
    const toppingsStr = item.toppings.length > 0
      ? ` +${item.toppings.map(t => t.name).join('+')}`
      : '';
    
    // Format notes string if present
    let notesStr = '';
    if (notes.size > 0) {
      const notesList: string[] = [];
      notes.forEach((qty, note) => {
        notesList.push(`${note} ×${qty}`);
      });
      notesStr = ` (${notesList.join(', ')})`;
    }

    const menuItem = menu?.categories
      .flatMap(c => c.items)
      .find(mi => mi.id === item.menuItemId);
    const hasMultipleSizes = menuItem ? Object.keys(menuItem.prices).length > 1 : true;
    const sizeStr = hasMultipleSizes ? `(${item.size})` : '';

    text += `${idx}. ${item.itemName}${sizeStr} ×${totalQty}\n`;
    
    const details: string[] = [];
    if (item.sweet !== '固定') details.push(item.sweet);
    if (item.ice !== '固定') details.push(item.ice);
    const sweetIceStr = details.join('/');
    
    const toppingsAndNotes = `${toppingsStr}${notesStr}`;
    if (sweetIceStr || toppingsAndNotes) {
      const separator = (sweetIceStr && toppingsAndNotes) ? ' ' : '';
      text += `   ${sweetIceStr}${separator}${toppingsAndNotes}\n`;
    }
  });

  return text;
}

function numToCircle(n: number): string {
  const circles = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩',
    '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱', '⑲', '⑳'];
  return n <= 20 ? circles[n - 1] : `${n}.`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

// Group history storage
const GROUP_HISTORY_KEY = 'drink-order-group-history';
const ACTIVE_GROUP_KEY = 'drink-order-active-group';

export function getGroupHistory(): GroupOrder[] {
  try {
    const stored = localStorage.getItem(GROUP_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveGroupHistory(history: GroupOrder[]): void {
  localStorage.setItem(GROUP_HISTORY_KEY, JSON.stringify(history));
}

export function getActiveGroup(): GroupOrder | null {
  try {
    const stored = localStorage.getItem(ACTIVE_GROUP_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function saveActiveGroup(group: GroupOrder | null): void {
  if (group) {
    localStorage.setItem(ACTIVE_GROUP_KEY, JSON.stringify(group));
  } else {
    localStorage.removeItem(ACTIVE_GROUP_KEY);
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
