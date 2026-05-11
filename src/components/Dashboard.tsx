import React, { useState, useEffect } from 'react';
import {
  MousePointer2, TrendingUp, Trophy, Copy,
  ChevronDown, Wallet, HandCoins, Zap, CheckCircle2,
  Calendar, History,
} from 'lucide-react';
import { cn } from '../lib/utils';
import StatsCard from './StatsCard';
import PerformanceChart from './PerformanceChart';
import WithdrawalModal from './WithdrawalModal';
import ParticleBackground from './ParticleBackground';
import { PerformanceData, TopAffiliate, SoldItem, Withdrawal, User } from '../types';
import { api } from '../lib/api';
import DashboardNavbar from './dashboard/DashboardNavbar';
import DashboardHeader from './dashboard/DashboardHeader';
import RankingWidget from './dashboard/RankingWidget';
import ItemsList from './dashboard/ItemsList';
import InstructionsWidget from './dashboard/InstructionsWidget';

interface DashboardProps {
  user: User | null;
  onLogout: () => void;
}

interface DashboardStats {
  clicks: number;
  sales: number;
  earnings: string;
  available: string;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [chartFilter, setChartFilter] = useState('30 dias');
  const [stats, setStats] = useState<DashboardStats>({ clicks: 0, sales: 0, earnings: 'R$ 0,00', available: 'R$ 0,00' });
  const [performance, setPerformance] = useState<PerformanceData[]>([]);
  const [ranking, setRanking] = useState<TopAffiliate[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [soldItems, setSoldItems] = useState<SoldItem[]>([]);
  const [popularItems, setPopularItems] = useState<SoldItem[]>([]);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const affiliateLink = `${baseUrl.replace('http://', '').replace('https://', '')}/?ref=${user?.username ?? ''}`;

  const refreshData = async () => {
    try {
      const [statsRes, withdrawalsRes] = await Promise.all([
        api.get('/api/affiliate/stats'),
        api.get('/api/affiliate/withdrawals'),
      ]);

      const { stats: s, performance: p, ranking: r, sold_items: si, popular_items: pi } = statsRes.data;

      if (s) setStats(s);
      setWithdrawals(withdrawalsRes.data ?? []);
      if (p) setPerformance(p);
      if (r) setRanking(r);
      if (si) setSoldItems(si);
      if (pi) setPopularItems(pi);
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
    }
  };

  useEffect(() => {
    if (user) refreshData();
  }, [user?.id]);

  const copyLink = () => {
    navigator.clipboard.writeText(affiliateLink).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  if (!user) return null;

  const getWithdrawalDate = (w: Withdrawal): string => {
    const raw = w.created_at ?? w.date ?? '';
    if (!raw) return '—';
    const d = new Date(raw);
    return isNaN(d.getTime()) ? raw : d.toLocaleDateString();
  };

  const getWithdrawalAmount = (w: Withdrawal): string => {
    return typeof w.amount === 'number' ? w.amount.toFixed(2) : String(w.amount);
  };

  return (
    <div className="min-h-screen bg-[#04020b] p-4 lg:p-10 space-y-10 max-w-[1600px] mx-auto text-white relative font-sans overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <ParticleBackground />
      </div>

      <DashboardNavbar user={user} onLogout={onLogout} />
      <DashboardHeader user={user} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 space-y-10">
          {/* Link Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={14} className="text-purple-400" />
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Período</span>
                </div>
                <button className="flex items-center gap-3 px-4 py-2 bg-black/40 rounded-xl border border-white/5 text-xs font-black uppercase tracking-widest">
                  Últimos Dados <ChevronDown size={14} className="text-purple-500" />
                </button>
              </div>
              <div className="w-px h-12 bg-white/5 mx-2 hidden md:block" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Seu Link</span>
                <p className="text-sm font-black italic tracking-tight text-white/80">{affiliateLink}</p>
              </div>
            </div>
            <button
              onClick={copyLink}
              className={cn(
                'flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all border shadow-2xl',
                isCopied
                  ? 'bg-green-500/20 text-green-400 border-green-500/40'
                  : 'bg-purple-600 hover:bg-purple-500 text-white border-transparent shadow-purple-500/20'
              )}
            >
              {isCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              <span>{isCopied ? 'COPIADO!' : 'COPIAR LINK'}</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatsCard label="Cliques do link" value={stats.clicks.toString()} icon={MousePointer2} variant="purple" delay={0.1} />
            <StatsCard label="Vendas Atribuídas" value={stats.sales.toString()} subValue="Confirmadas" icon={Zap} variant="cyan" delay={0.2} />
            <StatsCard label="Saldo gerado" value={stats.earnings} subValue="Disponível" icon={Trophy} variant="gold" delay={0.3} />
          </div>

          {/* Chart Section */}
          <div className="glass-card p-10 rounded-[3rem] border border-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-3xl font-black uppercase tracking-tighter">Performance</h3>
              <div className="flex items-center bg-black/40 p-1.5 rounded-2xl border border-white/5">
                {['Hoje', '7 dias', '30 dias', 'Total'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setChartFilter(tab)}
                    className={cn(
                      'px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                      chartFilter === tab ? 'bg-purple-600 text-white shadow-xl' : 'text-white/30'
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative h-[320px]">
              <PerformanceChart data={performance} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <ItemsList title="Itens mais populares" items={popularItems} />
            <ItemsList title="Itens Vendidos" items={soldItems} showLojaButton isRanked />
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-10">
          <div className="glass-card p-10 rounded-[3rem] border border-white/5 relative group">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
              <h3 className="text-xs font-black uppercase tracking-[0.3em]">Sua Posição</h3>
            </div>
            <div className="flex items-center gap-8">
              <span className="text-5xl font-black text-white tracking-tighter">#1</span>
              <div>
                <p className="text-2xl font-black italic text-amber-500">R$ 23,40</p>
                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Ganhos no mês</p>
              </div>
            </div>
          </div>

          <RankingWidget ranking={ranking} />

          {/* Withdrawal History Widget */}
          <div className="glass-card p-10 rounded-[3rem] border border-white/5 relative">
            <div className="flex items-center gap-4 mb-10">
              <History size={20} className="text-purple-400" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em]">Histórico</h3>
            </div>
            <div className="space-y-6">
              {withdrawals.slice(0, 3).map((w) => (
                <div key={w.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                      <HandCoins size={20} className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-black italic uppercase">{getWithdrawalDate(w)}</p>
                      <p className="text-[9px] font-black text-white/20 uppercase">
                        {w.status === 'approved' || w.status === 'paid' ? 'ENVIADO' : 'PENDENTE'}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-black italic">R$ {getWithdrawalAmount(w)}</span>
                </div>
              ))}
              {withdrawals.length === 0 && (
                <p className="text-white/20 text-xs font-black uppercase tracking-widest text-center py-4">
                  Nenhum saque ainda
                </p>
              )}
            </div>
            <button
              onClick={() => setIsWithdrawalModalOpen(true)}
              className="w-full mt-10 h-20 bg-gradient-to-r from-[#f59e0b] to-[#ea580c] text-white font-black uppercase tracking-[0.3em] rounded-[1.8rem] shadow-2xl flex items-center justify-center gap-4 transition-all hover:opacity-90"
            >
              <Zap size={22} />
              <span>Solicitar Saque</span>
            </button>
          </div>

          <InstructionsWidget />
        </aside>
      </div>

      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        availableBalance={user.balance}
        withdrawals={withdrawals}
        username={user.username}
        onSuccess={refreshData}
      />
    </div>
  );
}
