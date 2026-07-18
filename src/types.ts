export interface StatCard {
  id: string;
  title: string;
  value: string | number;
  change: number; // percentage change (e.g., +12.4 or -3.2)
  trend: 'up' | 'down' | 'neutral';
  timeframe: string;
  icon: string; // lucide icon name
  color: string; // tailwind color classes
}

export type UserRole = 'Super Admin' | 'Admin' | 'Editor' | 'Viewer';
export type UserStatus = 'Aktif' | 'Nonaktif' | 'Ditangguhkan';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar: string;
  joinDate: string;
  lastActive: string;
  permissions: string[];
}

export type LogCategory = 'system' | 'security' | 'transaction' | 'user';
export type LogStatus = 'success' | 'warning' | 'error' | 'info';

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  action: string;
  category: LogCategory;
  status: LogStatus;
  ip: string;
  details?: string;
}

export interface SalesData {
  name: string; // e.g. "Senin" or "Jan"
  sales: number;
  revenue: number;
  visitors: number;
}

export interface ProductPerformance {
  id: string;
  name: string;
  category: string;
  salesCount: number;
  revenue: number;
  stock: number;
  trend: number; // positive or negative percentage
}
