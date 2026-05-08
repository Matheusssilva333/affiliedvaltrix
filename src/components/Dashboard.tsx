import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users, MousePointer2, TrendingUp, Trophy, Copy, ExternalLink,
  ChevronDown, Bell, LogOut, Wallet, Star,
  HandCoins, Zap, ShieldCheck, ShoppingBag, CheckCircle2
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import StatsCard from './StatsCard';
import PerformanceChart from './PerformanceChart';
import WithdrawalModal from './WithdrawalModal';
import ParticleBackground from './ParticleBackground';
import { PerformanceData, TopAffiliate, SoldItem, Withdrawal } from '@/src/types';

interface DashboardProps {
  user: {
    username: string;
    avatarUrl: string;
  };
  onLogout: () => void;
}

const PERFORMANCE_DATA: PerformanceData[] = [];
const TOP_AFFILIATES: TopAffiliate[] = [];
const SOLD_ITEMS: SoldItem[] = [];
const RECENT_WITHDRAWALS: Withdrawal[] = [];

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://valtrix-clientes.onrender.com';
  const affiliateLink = `${baseUrl}/?ref=${user.username}`;
  const [isCopied, setIsCopied] = useState(false);

  const [stats, setStats] = useState({ clicks: 0, sales: 0, earnings: 'R$ 0,00', available: 'R$ 0,00' });
  const [performance, setPerformance] = useState<PerformanceData[]>([]);
  const [ranking, setRanking] = useState(TOP_AFFILIATES);
  const [withdrawals, setWithdrawals] = useState(RECENT_WITHDRAWALS);
  const [chartFilter, setChartFilter] = useState('7 dias');
  const [showAllItems, setShowAllItems] = useState(false);
  const [soldItems, setSoldItems] = useState<SoldItem[]>(SOLD_ITEMS);
  const [popularItems, setPopularItems] = useState<SoldItem[]>(SOLD_ITEMS);

  const refreshData = () => {
    fetch(`/api/affiliate/${user.username}`)
      .then(r => r.json())
      .then(data => {
        if (data.stats) setStats(data.stats);
        if (data.ranking) setRanking(data.ranking);
        if (data.performance) setPerformance(data.performance);
        if (data.withdrawals) setWithdrawals(data.withdrawals);
        if (data.sold_items && data.sold_items.length > 0) setSoldItems(data.sold_items);
        if (data.popular_items && data.popular_items.length > 0) setPopularItems(data.popular_items);
      })
      .catch(err => console.error(err));
  };

  React.useEffect(() => {
    refreshData();
  }, [user.username]);

  const copyLink = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(affiliateLink).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }).catch(err => {
        console.error('Failed to copy:', err);
        const textArea = document.createElement("textarea");
        textArea.value = affiliateLink;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        } catch (e) {
          console.error('Fallback failed:', e);
        }
        document.body.removeChild(textArea);
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#04020b] p-4 lg:p-8 space-y-8 max-w-[1600px] mx-auto text-white relative font-sans">
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <ParticleBackground />
      </div>
      
      {/* Top Navbar */}
      <nav className="flex items-center justify-between mb-8 z-10 relative bg-white/[0.02] px-6 py-4 rounded-[1.5rem] border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_#7c3aed]" />
          <span className="font-black text-sm tracking-tight text-white uppercase italic">Valtrix <span className="text-purple-500">Afiliados</span></span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-black/40 rounded-xl border border-white/5 group hover:border-purple-500/30 transition-all">
            <img src={user.avatarUrl} alt="Avatar" className="w-5 h-5 rounded-lg object-cover" />
            <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">{user.username}</span>
            <div className="w-px h-3 bg-white/10 mx-1" />
            <button onClick={onLogout} className="text-[10px] font-black text-red-400/70 hover:text-red-400 uppercase tracking-widest transition-colors">
              Sair
            </button>
          </div>
        </div>
      </nav>

      {/* Header Greeting */}
      <header className="flex items-center gap-8 mb-12 z-10 relative px-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-purple-600/20 rounded-[2rem] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
          <div className="w-24 h-24 rounded-[2rem] relative z-10 border border-white/10 bg-[#17112B] flex items-center justify-center overflow-hidden purple-glow">
            <img
              src={user.avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center border-2 border-[#04020b] z-20">
            <Star size={14} className="text-white fill-white" />
          </div>
        </div>
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tighter text-white italic uppercase">
            Olá, <span className="text-white">{user.username.toLowerCase()}</span>! 🚀
          </h1>
          <p className="text-white/40 text-xs font-black uppercase tracking-[0.2em]">Acompanhe seus cliques, vendas e ganhos em tempo real.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Main Data */}
        <div className="lg:col-span-8 space-y-8">
          {/* Top Bar: Link & Period */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                <ExternalLink size={14} className="text-purple-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Seu Link de Afiliado</span>
                <span className="text-xs font-bold text-white tracking-wide truncate max-w-[200px] md:max-w-none">
                  {affiliateLink.replace(/^https?:\/\//, '')}
                </span>
              </div>
            </div>
            <button
              onClick={copyLink}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border",
                isCopied 
                  ? "bg-green-500/20 text-green-400 border-green-500/40" 
                  : "bg-purple-600 hover:bg-purple-500 text-white border-transparent shadow-lg shadow-purple-500/20"
              )}
            >
              {isCopied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
              <span>{isCopied ? 'Copiado!' : 'Copiar Link'}</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="relative">
            <div className="absolute inset-0 stats-grid-gradient pointer-events-none" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              <StatsCard
                label="Cliques do link"
                value={stats.clicks.toString()}
                icon={MousePointer2}
                variant="purple"
                delay={0.1}
              />
              <StatsCard
                label="Vendas Atribuídas"
                value={stats.sales.toString()}
                subValue="Confirmadas"
                icon={ShoppingBag}
                variant="cyan"
                delay={0.2}
              />
              <StatsCard
                label="Saldo gerado"
                value={stats.earnings}
                subValue="Pendentes/Disponíveis"
                icon={Trophy}
                variant="gold"
                delay={0.3}
              />
            </div>
          </div>

          {/* Mini Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-[2rem] border border-white/5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Última venda</p>
              <p className="text-lg font-black text-white">{stats.sales > 0 ? "Hoje às 20:52" : "Nenhuma ainda"}</p>
            </div>
            <div className="glass-card p-6 rounded-[2rem] border border-white/5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Lucro Estimado</p>
              <p className="text-2xl font-black text-white">{stats.earnings}</p>
            </div>
            <div className="glass-card p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Taxa de conversão</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-black text-green-400">
                  {stats.clicks > 0 ? ((stats.sales / stats.clicks) * 100).toFixed(2) : '0.00'}%
                </p>
                <div className="flex gap-0.5">
                  <div className="w-1 h-3 rounded-full bg-green-500/40" />
                  <div className="w-1 h-5 rounded-full bg-green-500" />
                </div>
              </div>
              <div className="absolute top-2 right-4 text-[8px] font-black text-green-500/50 uppercase tracking-widest">+2.4%</div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="glass-card p-8 rounded-[2.5rem] purple-glow border border-white/5">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-black tracking-tighter italic uppercase">Performance</h3>
                <div className="flex items-center gap-6">
                  {['Ganhos', 'Cliques', 'Vendas'].map((type) => (
                    <button key={type} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-2 group">
                      <div className={cn("w-1.5 h-1.5 rounded-full", type === 'Ganhos' ? 'bg-purple-500' : 'bg-white/10')} />
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/5">
                {['Hoje', '7 dias', '30 dias', 'Total'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setChartFilter(tab)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                      chartFilter === tab ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" : "text-white/40 hover:text-white"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-purple-500/5 blur-[100px] pointer-events-none" />
              <PerformanceChart data={performance.slice(
                chartFilter === 'Hoje' ? -1 :
                  chartFilter === '7 dias' ? -7 :
                    chartFilter === '30 dias' ? -30 : 0
              )} />
            </div>
            
            <div className="mt-8 flex items-center justify-center">
              <div className="px-6 py-3 bg-white/5 rounded-2xl flex items-center gap-6 border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#7c3aed]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Ganhos Diários</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <p className="text-sm font-black italic uppercase tracking-tight">Recorde: <span className="text-purple-400">R$ 5,14</span></p>
              </div>
            </div>
          </div>

          {/* Lower Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Popular Items */}
            <div className="glass-card p-8 rounded-[2.5rem]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black tracking-tighter uppercase italic">Itens <span className="text-purple-500">mais populares</span></h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <Star size={12} className="text-purple-500 fill-purple-500" />
                  <span className="text-[9px] font-black uppercase text-purple-400 tracking-widest">Em Alta</span>
                </div>
              </div>
              <div className="space-y-4">
                {popularItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl hover:bg-white/[0.05] transition-all group border border-transparent hover:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center overflow-hidden border border-white/5">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-black truncate max-w-[120px] uppercase italic tracking-tight">{item.name}</p>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.15em]">{item.salesCount} vendas • <span className="text-purple-400">Comissão R$ {parseFloat(item.price.slice(3).replace(',', '.')) * 0.1}</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black italic tracking-tight">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sold Items Detail */}
            <div className="glass-card p-8 rounded-[2.5rem]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black tracking-tighter uppercase italic">Seus <span className="text-purple-500">Ganhos</span></h3>
                <div className="px-3 py-1 bg-black/40 rounded-lg border border-white/5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Recentes</span>
                </div>
              </div>
              <div className="space-y-4">
                {soldItems.slice(0, 3).map((item, idx) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-white/[0.02] border-l-4 border-purple-600 rounded-r-2xl">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-black text-white/10 italic">0{idx + 1}</span>
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-black truncate max-w-[100px] uppercase italic tracking-tight">{item.name}</p>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Lucro: <span className="text-green-400">R$ {(parseFloat(item.price.slice(3).replace(',', '.')) * 0.1).toFixed(2)}</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black italic tracking-tight">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Widgets */}
        <aside className="lg:col-span-4 space-y-8">

          {/* Own Position */}
          <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group amber-glow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] -mr-16 -mt-16 pointer-events-none" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-4 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Posição no Ranking</h3>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center border border-amber-500/30">
                <span className="text-3xl font-black text-amber-500 italic">#{ranking.findIndex(r => r.username === user.username) !== -1 ? ranking.findIndex(r => r.username === user.username) + 1 : '-'}</span>
              </div>
              <div>
                <p className="text-3xl font-black italic text-white tracking-tighter">{stats.earnings}</p>
                <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">Total Gerado</p>
              </div>
            </div>
          </div>

          {/* Ranking Widget */}
          <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 relative">
            <div className="flex items-center mb-8 gap-3">
              <Trophy size={20} className="text-amber-500" />
              <h3 className="text-sm font-black uppercase tracking-[0.15em] text-white">
                Top Afiliados <span className="text-purple-500">do Mês</span>
              </h3>
            </div>
            <div className="space-y-5">
              {ranking.map((aff) => (
                <div key={aff.rank} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-white/20 w-4">0{aff.rank}</span>
                    <div className="relative">
                      <img src={aff.avatarUrl} alt={aff.username} className="w-10 h-10 rounded-xl border border-white/10 group-hover:border-purple-500/50 transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white italic uppercase tracking-tight">{aff.username}</p>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Rank Atual</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-green-400 italic tracking-tight">{aff.commission}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-4 bg-[#1B1231] hover:bg-purple-600 hover:text-white text-purple-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-purple-500/20 flex items-center justify-center gap-3 group">
              <TrendingUp size={14} className="group-hover:translate-y-[-2px] transition-transform" />
              Seguir Ranking
            </button>
          </div>

          {/* Withdrawal History Widget */}
          <div className="glass-card p-8 rounded-[2.5rem] space-y-8 border border-white/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                <HandCoins className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Histórico de <span className="text-purple-500">Saques</span></h3>
            </div>

            <div className="space-y-4">
              {withdrawals.map((w) => (
                <div key={w.id} className="flex items-center justify-between p-5 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      w.status === 'approved' ? "bg-green-500/10 text-green-400" :
                        w.status === 'pending' ? "bg-amber-500/10 text-amber-400" :
                          "bg-red-500/10 text-red-400"
                    )}>
                      <CheckCircle2 size={20} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-white uppercase italic tracking-widest">{w.date}</p>
                      <p className="text-[9px] text-white/30 uppercase font-black tracking-[0.2em]">{w.pixKey}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-sm font-black italic tracking-tight",
                    w.status === 'approved' ? "text-green-400" :
                      w.status === 'pending' ? "text-amber-400" :
                        "text-red-400"
                  )}>{w.amount}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsWithdrawalModalOpen(true)}
              className="w-full h-16 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black uppercase italic tracking-widest rounded-2xl shadow-lg shadow-purple-500/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
            >
              <Wallet size={20} />
              <span>Solicitar Saque</span>
            </button>
          </div>

          {/* How it works */}
          <div className="glass-card p-8 rounded-[2.5rem] space-y-8 border border-white/5">
            <div className="flex items-center gap-3">
              <Zap className="text-purple-500 fill-purple-500" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] italic">Como <span className="text-purple-500">funciona?</span></h3>
            </div>
            <ul className="space-y-5">
              {[
                'Copie seu link',
                'Compartilhe seu link',
                'Acompanhe cliques e vendas',
                'Ganhos entram como pendentes',
                'Após 7 dias, ficam disponíveis',
                'Solicite seu saque via Pix',
                'Receba na sua conta!'
              ].map((step, idx) => (
                <li key={idx} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5 border border-purple-500/20">
                    <CheckCircle2 size={12} className="text-purple-500" />
                  </div>
                  <span className="text-white/60 text-[13px] font-black uppercase tracking-tight italic">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <footer className="pt-20 pb-10 text-center">
        <p className="text-white/10 text-[10px] uppercase font-black tracking-[0.8em]">
          Valtrix Platform <span className="text-white/20">Official Affiliate</span>
        </p>
      </footer>

      {/* Withdrawal Modal */}
      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        availableBalance={parseFloat(stats.available.replace('R$ ', '').replace('.', '').replace(',', '.'))}
        withdrawals={withdrawals}
        username={user.username}
        onSuccess={refreshData}
      />
    </div>
  );
}
