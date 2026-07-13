export interface EyePower {
  sph: string;
  cyl: string;
  axis: string;
}

export interface Customer {
  _id: string;
  name: string;
  mobile: string;
  photo?: string;
  orderCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  customerId: string | Customer;
  eyePower: {
    right: EyePower;
    left: EyePower;
  };
  frame: {
    brand: string;
    model: string;
    color: string;
  };
  lensType: string;
  amount: number;
  status: 'New' | 'Processing' | 'Ready' | 'Delivered' | 'Cancelled';
  prescriptionImage?: string;
  invoice?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MasterData {
  _id: string;
  type: 'brands' | 'models' | 'colors' | 'lenses';
  value: string;
}

export type MasterDataGrouped = Record<MasterData['type'], MasterData[]>;

export interface DashboardStats {
  stats: {
    totalCustomers: number;
    newCustomers: number;
    pendingOrders: number;
    readyOrders: number;
    deliveredOrders: number;
    totalRevenue: number;
  };
  recentCustomers: Customer[];
  recentOrders: Order[];
}

export interface AuthState {
  token: string | null;
  admin: {
    id: string;
    username: string;
    name: string;
  } | null;
}
