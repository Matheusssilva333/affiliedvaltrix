import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types';

interface DashboardNavbarProps {
  user: User;
  onLogout: () => void;
}

export default function DashboardNavbar({ user, onLogout }: DashboardNavbarProps) {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-between mb-12 z-10 relative">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_15px_#7c3aed]" />
        <span className="font-black text-lg tracking-tighter text-white uppercase italic">
          Valtrix <span className="text-purple-500">Afiliados</span>
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-5 py-2 bg-white/[0.03] rounded-2xl border border-white/5 group hover:border-purple-500/30 transition-all backdrop-blur-xl">
          {user.role === 'admin' && (
            <>
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 text-[11px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest transition-colors"
              >
                <ShieldCheck size={14} />
                Admin
              </button>
              <div className="w-px h-4 bg-white/10 mx-2" />
            </>
          )}
          <div className="relative">
            <img
              src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
              alt="Avatar"
              className="w-6 h-6 rounded-lg object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 border-2 border-[#04020b] rounded-full" />
          </div>
          <span className="text-[11px] font-black text-white uppercase tracking-widest">{user.username}</span>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button
            onClick={onLogout}
            className="text-[11px] font-black text-white/30 hover:text-red-400 uppercase tracking-widest transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}
