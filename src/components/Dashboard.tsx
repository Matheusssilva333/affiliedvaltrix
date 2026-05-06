import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users, MousePointer2, TrendingUp, Trophy, Copy, ExternalLink,
  ChevronDown, Bell, LogOut, Wallet, MoreVertical, Star,
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
  const affiliateLink = `https://valtrix-clientes.onrender.com/?ref=${user.username}`;
  const [isCopied, setIsCopied] = useState(false);

  const [stats, setStats] = useState({ clicks: 0, sales: 0, earnings: 'R$ 0,00', available: 'R$ 0,00' });
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
    navigator.clipboard.writeText(affiliateLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#04020b] p-4 lg:p-8 space-y-8 max-w-[1600px] mx-auto text-white relative">
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <ParticleBackground />
      </div>
      {/* Top Navbar */}
      <nav className="flex items-center justify-between mb-8 z-10 relative bg-white/[0.02] p-4 rounded-3xl border border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
          <span className="font-display font-extrabold text-lg tracking-tight text-white">Valtrix Afiliados</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-3 py-1.5 bg-black/40 rounded-full border border-white/5">
            <img src={user.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=neguin"} alt="Avatar" className="w-6 h-6 rounded-full" />
            <span className="text-xs font-bold text-white mr-2">{user.username}</span>
          </div>
          <button onClick={onLogout} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-colors">
            Sair
          </button>
        </div>
      </nav>

      {/* Header Greeting */}
      <header className="flex items-center gap-6 mb-12 z-10 relative">
        <div className="relative group">
          <div className="absolute inset-0 bg-yellow-500/20 rounded-[2rem] blur-xl opacity-40 transition-opacity" />
          <div className="w-20 h-20 rounded-[2rem] relative z-10 border-2 border-yellow-500/40 bg-[#17112B] flex items-center justify-center overflow-hidden">
            <img
              src={user.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=neguin"}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-extrabold tracking-tight text-white">Olá, <span className="text-white">{user.username}</span>! 🚀</h1>
          <p className="text-muted-foreground text-sm font-medium">Acompanhe seus cliques, vendas e ganhos em tempo real.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Main Data */}
        <div className="lg:col-span-8 space-y-8">

          {/* Top Bar: Link & Period */}
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-white/5 rounded-lg">
              <div className="w-3 h-3 bg-yellow-500 rounded-[2px]" />
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Período</span>
            <button className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-xs font-bold transition-colors hover:bg-purple-500/20">
              Últimos 30 dias
              <ChevronDown size={14} />
            </button>
          </div>

          <div className="glass-card p-4 rounded-2.5xl flex items-center justify-between group mb-8">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-white tracking-wide truncate max-w-[200px] md:max-w-none">
                {affiliateLink.replace(/^https?:\/\//, '')}
              </span>
            </div>
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-4 py-2 bg-[#1B1231] hover:bg-purple-500/20 text-green-400 rounded-xl font-bold text-xs transition-colors border border-green-500/20"
            >
              <Copy size={14} />
              <span>Copiar (em prod)</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              label="Cliques no link"
              value={stats.clicks.toString()}
              icon={MousePointer2}
              variant="purple"
              delay={0.1}
            />
            <StatsCard
              label="Vendas Atribuídas"
              value={stats.sales.toString()}
              subValue="Total"
              icon={ShoppingBag}
              variant="cyan"
              delay={0.2}
            />
            <StatsCard
              label="Saldo gerado"
              value={stats.earnings}
              subValue={`${stats.available} disponíveis`}
              icon={Trophy}
              variant="gold"
              delay={0.3}
              extraContent={
                soldItems.length > 0 ? (
                  <div className="mt-4 p-3 bg-[#17112B] rounded-xl flex items-center gap-3 border border-white/5">
                    <img src={soldItems[0].image} alt="item" className="w-8 h-8 rounded-lg bg-black/50 object-cover" />
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-2">
                        <span className="text-green-400">+</span> {soldItems[0].price}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate w-32">{soldItems[0].name}</p>
                    </div>
                  </div>
                ) : null
              }
            />
          </div>

          {/* Mini Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-5 rounded-3xl flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Última venda</p>
                <p className="text-base font-bold text-white">{stats.sales > 0 ? "Realizada" : "Nenhuma"}</p>
              </div>
            </div>
            <div className="glass-card p-5 rounded-3xl flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Saldo gerado</p>
                <p className="text-xl font-bold text-white">{stats.earnings}</p>
              </div>
            </div>
            <div className="glass-card p-5 rounded-3xl flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Taxa de conversão</p>
                <p className="text-xl font-bold text-green-400">
                  {stats.clicks > 0 ? ((stats.sales / stats.clicks) * 100).toFixed(2) : '0.00'}%
                </p>
              </div>
              <div className="flex gap-0.5 mt-auto">
                <div className="w-1.5 h-4 rounded-full bg-green-500" />
                <div className="w-1.5 h-6 rounded-full bg-green-500" />
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="glass-card p-8 rounded-[2.5rem] purple-glow">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h3 className="text-xl font-display font-extrabold tracking-tight italic uppercase">Performance</h3>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <button className="text-purple-400 border-b border-purple-400 pb-0.5">Ganhos</button>
                  <button className="hover:text-white transition-colors">Cliques</button>
                  <button className="hover:text-white transition-colors">Vendas</button>
                </div>
              </div>
              <div className="flex items-center bg-black/40 p-1 rounded-xl">
                {['Hoje', '7 dias', '30 dias', 'Este Mês', 'Total'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setChartFilter(tab)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all",
                      chartFilter === tab ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "text-muted-foreground hover:text-white"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <PerformanceChart data={PERFORMANCE_DATA.slice(
              chartFilter === 'Hoje' ? -1 :
                chartFilter === '7 dias' ? -7 :
                  chartFilter === '30 dias' ? -30 : 0
            )} />

            <div className="mt-8 flex items-center justify-center">
              <div className="px-6 py-3 bg-white/5 rounded-2xl flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Ganhos Diários</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <p className="text-sm font-bold">Recorde: <span className="text-purple-400">R$ 4,12</span></p>
              </div>
            </div>
          </div>

          {/* Lower Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Popular Items */}
            <div className="glass-card p-8 rounded-[2.5rem]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-display font-extrabold tracking-tight uppercase italic">Itens <span className="text-purple-500">mais populares</span></h3>
                <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg">
                  <Star size={14} className="text-purple-500" />
                  <span className="text-[10px] font-bold uppercase text-purple-400">Ativos</span>
                </div>
              </div>
              <div className="space-y-4">
                {popularItems.slice(0, showAllItems ? undefined : 2).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center overflow-hidden border border-white/5">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold truncate max-w-[120px]">{item.name}</p>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase">{item.salesCount} vendas • <span className="text-purple-400">R$ {parseFloat(item.price.slice(3).replace(',', '.')) * 0.1} comissão</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold">{item.price}</p>
                      <p className="text-[9px] font-bold text-green-500 uppercase">Em alta</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowAllItems(!showAllItems)}
                className="w-full mt-6 py-4 rounded-2xl border border-white/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-white/5 transition-colors">
                {showAllItems ? 'Ocultar itens' : 'Ver todos os itens'}
              </button>
            </div>

            {/* Sold Items Detail */}
            <div className="glass-card p-8 rounded-[2.5rem]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-display font-extrabold tracking-tight uppercase italic">Seus <span className="text-purple-500">Itens Vendidos</span></h3>
                <button className="p-2 glass-card rounded-lg">
                  <ChevronDown size={14} />
                </button>
              </div>
              <div className="space-y-4">
                {soldItems.slice(0, 2).map((item, idx) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 border-l-2 border-purple-500/50 rounded-r-2xl">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-black text-white/20 italic">{idx + 1}</span>
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold truncate max-w-[100px]">{item.name}</p>
                        <p className="text-[9px] font-medium text-muted-foreground uppercase">Revenue: <span className="text-white">R$ 5,00</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-white">{item.price}</p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">Taxa por venda</p>
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
          <div className="glass-card p-6 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] -mr-16 -mt-16 pointer-events-none" />
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-4 bg-yellow-500 rounded-full" />
              <h3 className="text-sm font-display font-extrabold uppercase tracking-wide text-white">Posição no ranking</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[14px] bg-gradient-to-b from-amber-500/20 to-amber-500/5 flex items-center justify-center border border-amber-500/20">
                <span className="text-xl font-black text-amber-500 italic">#{ranking.findIndex(r => r.username === user.username) !== -1 ? ranking.findIndex(r => r.username === user.username) + 1 : '-'}</span>
              </div>
              <div>
                <p className="text-2xl font-black text-white">{stats.earnings}</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Saldo gerado</p>
              </div>
            </div>
          </div>

          {/* Ranking Widget */}
          <div className="glass-card p-6 rounded-[2.5rem] border border-white/5 relative">
            <div className="flex items-center mb-6 gap-2">
              <Trophy size={18} className="text-amber-500" />
              <h3 className="text-[15px] font-display font-extrabold tracking-wide text-white">
                Top Afiliados <span className="text-purple-500 font-bold">do Mês</span>
              </h3>
            </div>
            <div className="space-y-4">
              {ranking.map((aff) => (
                <div key={aff.rank} className="flex items-center justify-between group p-2 hover:bg-white/5 rounded-2xl transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-4">#{aff.rank}</span>
                    <div className="relative">
                      <img src={aff.avatarUrl} alt={aff.username} className="w-10 h-10 rounded-xl border border-white/10" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">{aff.username}</p>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-green-400">{aff.commission}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3.5 bg-[#1B1231] hover:bg-purple-500/20 text-purple-400 rounded-2xl text-xs font-bold transition-colors border border-purple-500/20 flex items-center justify-center gap-2">
              <TrendingUp size={14} />
              Seguir este ranking
            </button>
          </div>

          {/* Withdrawal History Widget */}
          <div className="glass-card p-8 rounded-[2.5rem] space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/5 rounded-2xl">
                <HandCoins className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-display font-extrabold tracking-tight uppercase italic">Histórico de <span className="text-purple-500">saques</span></h3>
            </div>

            <div className="space-y-4">
              {withdrawals.map((w) => (
                <div key={w.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      w.status === 'approved' ? "bg-green-500/10 text-green-400" :
                        w.status === 'pending' ? "bg-amber-500/10 text-amber-400" :
                          "bg-red-500/10 text-red-400"
                    )}>
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{w.date}</p>
                      <p className="text-[9px] text-muted-foreground uppercase">{w.pixKey}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-xs font-bold",
                    w.status === 'approved' ? "text-green-400" :
                      w.status === 'pending' ? "text-amber-400" :
                        "text-red-400"
                  )}>{w.amount}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsWithdrawalModalOpen(true)}
              className="w-full h-16 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-2xl shadow-lg shadow-purple-500/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
            >
              <Wallet size={20} />
              <span>Solicitar Saque</span>
            </button>
          </div>

          {/* How it works */}
          <div className="glass-card p-8 rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-3">
              <Zap className="text-purple-500" />
              <h3 className="text-sm font-display font-bold uppercase tracking-widest italic">Como <span className="text-purple-500">funciona?</span></h3>
            </div>
            <ul className="space-y-4">
              {[
                'Copie seu link',
                'Compartilhe seu link',
                'Acompanhe cliques e vendas',
                'Ganhos entram como pendentes',
                'Após 7 dias, ficam disponíveis',
                'Solicite seu saque via Pix',
                'Receba na sua conta!'
              ].map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={12} className="text-purple-500" />
                  </div>
                  <span className="text-muted-foreground font-medium">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Rules/Info */}
          <div className="glass-card p-8 rounded-[2.5rem] border-muted bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="text-muted-foreground" />
              <h3 className="text-sm font-display font-bold uppercase tracking-widest text-muted-foreground italic">Regras e Info</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Aceito: Catálogo de Itens Atuais', color: 'text-purple-400' },
                { label: 'Prazos: Ganhos em 7-14 dias', color: 'text-amber-400' },
                { label: 'Mínimo: Saque a partir de R$ 10', color: 'text-purple-400' },
                { label: 'Segurança: Bloqueamos compras frias', color: 'text-red-400' },
                { label: 'Suporte: Respondemos em até 24h', color: 'text-purple-400' },
              ].map((rule, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-4 h-px bg-white/10" />
                  <span className={cn("text-xs font-bold uppercase", rule.color)}>{rule.label}</span>
                </div>
              ))}
            </div>
          </div>

        </aside>
      </div>

      <footer className="pt-12 pb-6 text-center">
        <p className="text-muted-foreground/30 text-[10px] uppercase font-bold tracking-[0.5em]">
          Plataforma de Afiliados <span className="text-white">Valtrix</span>
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
