// ===== 菜單相關型別 =====

export interface Topping {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  prices: Record<string, number>; // e.g., { "L": 50, "M": 40 }
  tags?: string[];
  sweetOptions?: string[] | null;  // null = use store default
  iceOptions?: string[] | null;    // null = use store default
  toppings?: Topping[];
  toppingGroup?: string;           // 採用的配料群組名稱
  description?: string;
  hot?: boolean;       // 是否可做熱飲
  available?: boolean; // 是否可供應
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
  toppingGroup?: string;           // 類別預設配料群組名稱
}

export interface StoreMenu {
  storeId: string;
  storeName: string;
  defaultSweetOptions: string[];
  defaultIceOptions: string[];
  defaultToppings?: Topping[];
  toppingGroups?: Record<string, Topping[]>; // 配料群組定義
  categories: MenuCategory[];
}

export interface StoreInfo {
  id: string;
  name: string;
  description?: string;
  menuFile: string;
  logo?: string;
}

export interface StoreIndex {
  stores: StoreInfo[];
}

// ===== 訂單相關型別 =====

export interface OrderTopping {
  name: string;
  price: number;
}

export interface OrderItem {
  id: string;           // unique order item id
  personName: string;
  menuItemId: string;
  itemName: string;
  size: string;         // "L", "M", etc.
  price: number;        // base price for the size
  sweet: string;
  ice: string;
  toppings: OrderTopping[];
  quantity: number;
  note?: string;
  subtotal: number;     // calculated: (price + toppings total) * quantity
}

// ===== 團購相關型別 =====

export interface GroupOrder {
  id: string;
  storeId: string;
  storeName: string;
  createdAt: string;    // ISO date string
  closedAt?: string;
  items: OrderItem[];
  totalAmount: number;
  totalCups: number;
  status: 'active' | 'closed';
}

// ===== 搜尋相關 =====

export interface SearchableItem extends MenuItem {
  categoryName: string;
}
