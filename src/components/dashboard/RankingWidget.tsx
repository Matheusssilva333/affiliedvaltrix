import React from 'react';
import { Trophy, Star, TrendingUp } from 'lucide-react';
import { TopAffiliate } from '../../types';

interface RankingWidgetProps {
  ranking: TopAffiliate[];
}

export default function RankingWidget({ ranking }: RankingWidgetProps) {
  if (!ranking || ranking.length === 0) {
    return (
      <div className="glass-card p-10 rounded-[3rem] border border-white/5 relative">
        <div className="flex items-center gap-4 mb-6">
          <Trophy size={20} className="text-amber-500" />
          <h3 className="text-sm font-black uppercase tracking-[0.2em]">
            Top Afiliados <span className="text-purple-500">do Mês</span>
          </h3>
        </div>
        <p className="text-white/20 text-xs font-black uppercase tracking-widest text-center py-8">
          Nenhum dado disponível
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-10 rounded-[3rem] border border-white/5 relative">
      <div className="flex items-center gap-4 mb-10">
        <Trophy size={20} className="text-amber-500" />
        <h3 className="text-sm font-black uppercase tracking-[0.2em]">
          Top Afiliados <span className="text-purple-500">do Mês</span>
        </h3>
      </div>
      <div className="space-y-8">
        {ranking.map((aff) => (
          <div key={aff.rank} className="flex items-center justify-between group hover:translate-x-1 transition-transform">
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-black text-white/10 w-4 italic">0{aff.rank}</span>
              <div className="relative">
                <img
                  src={aff.avatarUrl}
                  alt={aff.username}
                  className="w-12 h-12 rounded-2xl border border-white/5 group-hover:border-purple-500/40 transition-colors shadow-lg"
                />
                {aff.rank === 1 && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center border-2 border-[#04020b] shadow-lg">
                    <Star size={10} className="fill-white text-white" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-black text-white italic uppercase tracking-tighter">{aff.username}</p>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Rank atual</p>
              </div>
            </div>
            <span className="text-sm font-black text-green-400">{aff.commission}</span>
          </div>
        ))}
      </div>
      <button className="w-full mt-10 py-5 bg-[#1B1231]/50 hover:bg-purple-600 hover:text-white text-purple-400 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all border border-purple-500/20 shadow-2xl flex items-center justify-center gap-3">
        <TrendingUp size={16} />
        Seguir Ranking
      </button>
    </div>
  );
}
