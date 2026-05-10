import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Wallet, Users } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AdminOverview {
  total_revenue: number;
  pending_withdrawals: number;
  active_affiliates: number;
}

interface AdminStatsProps {
  overview: AdminOverview | null;
}

export default function AdminStats({ overview }: AdminStatsProps) {
  const stats = [
    { label: 'Faturamento Total', value: `R$ ${overview?.total_revenue?.toFixed(2) ?? '0.00'}`, icon: ShoppingBag, color: 'text-white' },
    { label: 'Saques Pendentes', value: overview?.pending_withdrawals ?? 0, icon: Wallet, color: 'text-amber-500' },
    { label: 'Afiliados Ativos', value: overview?.active_affiliates ?? 0, icon: Users, color: 'text-cyan-400' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="glass-card p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <stat.icon size={64} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">{stat.label}</p>
          <p className={cn('text-4xl font-black italic', stat.color)}>{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
