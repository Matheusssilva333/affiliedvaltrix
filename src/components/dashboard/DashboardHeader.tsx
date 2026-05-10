import React from 'react';
import { User } from '../../types';

interface DashboardHeaderProps {
  user: User;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="flex items-center gap-8 mb-16 z-10 relative px-2">
      <div className="relative group">
        <div className="absolute inset-0 bg-purple-600/30 rounded-[2.5rem] blur-3xl opacity-40 group-hover:opacity-70 transition-opacity" />
        <div className="w-28 h-28 rounded-[2.5rem] relative z-10 border border-white/10 bg-[#17112B] flex items-center justify-center overflow-hidden purple-glow transition-transform duration-500 group-hover:scale-105">
          <img
            src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-6xl font-black tracking-tighter text-white italic-bold text-shadow-glow">
          Olá, {user.username}! 🚀
        </h1>
        <p className="text-white/40 text-sm font-black uppercase tracking-[0.3em]">
          Acompanhe seus cliques, vendas e ganhos em tempo real.
        </p>
      </div>
    </header>
  );
}
