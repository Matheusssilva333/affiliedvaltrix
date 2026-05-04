export interface User {
  username: string;
  avatarUrl: string;
  id: string;
}

export interface Metric {
  label: string;
  value: string | number;
  subValue?: string;
  icon: string;
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
  id: string;
  date: string;
  amount: string;
  status: 'pending' | 'approved' | 'rejected';
  pixKey: string;
  recipient: string;
}

export interface PerformanceData {
  name: string;
  earnings: number;
  clicks: number;
}
