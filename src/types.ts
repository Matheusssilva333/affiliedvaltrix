import type React from 'react';

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
  icon: React.ElementType;
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
  date?: string;
  created_at?: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  pix_key?: string;
  recipient?: string;
}

export interface PerformanceData {
  name: string;
  earnings: number;
  clicks: number;
}
