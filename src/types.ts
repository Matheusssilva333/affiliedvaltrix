export interface User {
  id: number;
  username: string;
  avatar_url: string;
  role: string;
  balance: number;
}

export interface Metric {
  label: string;
  value: string | number;
  subValue?: string;
  icon: any;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface TopAffiliate {
  rank: number;
  username: string;
  avatarUrl: string;
  commission: string;
}

export interface SoldItem {
  id: string;
  name: string;
  price: string;
  salesCount: number;
  image: string;
}

export interface Withdrawal {
  id: number;
  date: string;
  amount: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  pixKey?: string;
  recipient?: string;
}

export interface PerformanceData {
  name: string;
  earnings: number;
  clicks: number;
}
