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

const PERFORMANCE_DATA: PerformanceData[] = [
  { name: '28/04', earnings: 0.5, clicks: 12 },
  { name: '29/04', earnings: 0.8, clicks: 15 },
  { name: '30/04', earnings: 0.2, clicks: 8 },
  { name: '01/05', earnings: 1.2, clicks: 22 },
  { name: '02/05', earnings: 0.4, clicks: 10 },
  { name: '03/05', earnings: 2.14, clicks: 28 },
  { name: '04/05', earnings: 1.5, clicks: 18 },
];

const TOP_AFFILIATES: TopAffiliate[] = [
  { rank: 1, username: 'metildes_xpt', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=metildes', commission: 'R$ 55,74' },
  { rank: 2, username: 'i0v3r', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=i0v3r', commission: 'R$ 38,20' },
  { rank: 3, username: 'Jakasinho', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jakasinho', commission: 'R$ 25,43' },
];

const SOLD_ITEMS: SoldItem[] = [
  { id: '1', name: 'Drip-Gray Jeans', price: 'R$ 0,14', salesCount: 12, image: 'https://api.dicebear.com/7.x/shapes/svg?seed=jeans' },
  { id: '2', name: 'All Black Realistic Shirt', price: 'R$ 0,12', salesCount: 8, image: 'https://api.dicebear.com/7.x/shapes/svg?seed=shirt' },
  { id: '3', name: 'Supremacy for Light', price: 'R$ 0,02', salesCount: 45, image: 'https://api.dicebear.com/7.x/shapes/svg?seed=light' },
];

const RECENT_WITHDRAWALS: Withdrawal[] = [
  { id: '1', date: '30 de mar', amount: 'R$ 25,80', status: 'approved', pixKey: '***.456.***-89', recipient: 'João Silva' },
  { id: '2', date: '25 de abr', amount: 'R$ 0,32', status: 'pending', pixKey: 'joao@email.com', recipient: 'João Silva' },
  { id: '3', date: '12 de abr', amount: 'R$ 0,05', status: 'rejected', pixKey: '(11) 99999-9999', recipient: 'João Silva' },
];

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const affiliateLink = `valtrix-three.vercel.app/?ref=${user.username}`;

  const copyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    // Could add a toast here
  };

  return (
    <div className="min-h-screen bg-[#04020b] p-4 lg:p-8 space-y-8 max-w-[1600px] mx-auto text-white relative">
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <ParticleBackground />
      </div>
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 z-10 relative">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-purple-500 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <img 
              src={user.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=neguin"} 
              alt="Avatar" 
              className="w-20 h-20 rounded-[2.5rem] relative z-10 border-2 border-purple-500/20"
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tighter">Olá, <span className="text-purple-500">{user.username}</span>! 🚀</h1>
            <p className="text-muted-foreground text-sm font-medium">Acompanhe seus cliques, vendas e ganhos em tempo real.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="h-12 w-12 flex items-center justify-center glass-card rounded-2xl hover:bg-white/10 transition-colors">
            <Bell size={20} />
          </button>
          <button 
            onClick={onLogout}
            className="h-12 px-6 flex items-center justify-center gap-2 glass-card rounded-2xl border-red-500/10 hover:bg-red-500/10 text-red-400 font-bold transition-all active:scale-95"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Main Data */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Top Bar: Link & Period */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            <div className="flex-1 glass-card p-4 rounded-2.5xl flex items-center justify-between group">
              <div className="flex items-center gap-4 flex-1">
                <div className="p-2 bg-purple-500/10 rounded-xl">
                  <ExternalLink size={16} className="text-purple-400" />
                </div>
                <span className="text-sm font-bold text-muted-foreground truncate max-w-[200px] md:max-w-none">
                  {affiliateLink}
                </span>
              </div>
              <button 
                onClick={copyLink}
                className="h-10 px-4 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl flex items-center gap-2 font-bold text-xs transition-colors"
              >
                <Copy size={14} />
                <span className="hidden sm:inline">Copiar Link</span>
              </button>
            </div>
            
            <button className="px-6 glass-card rounded-2.5xl flex items-center justify-between gap-4 font-bold text-sm hover:bg-white/5 transition-colors">
              <span className="flex items-center gap-2">
                <Users size={16} className="text-purple-400" />
                No Período
              </span>
              <span className="text-purple-400">Últimos 7 dias</span>
              <ChevronDown size={16} className="text-muted-foreground" />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard 
              label="Cliques no Link" 
              value="16" 
              icon={MousePointer2} 
              variant="purple"
              delay={0.1}
            />
            <StatsCard 
              label="Vendas Atribuídas" 
              value="15" 
              subValue="+4 novas"
              icon={ShoppingBag} 
              variant="cyan"
              delay={0.2}
            />
            <StatsCard 
              label="Saldo Gerado" 
              value="R$ 9,16" 
              subValue="R$ 5,41 disponíveis"
              icon={TrendingUp} 
              variant="gold"
              delay={0.3}
            />
          </div>

          {/* Mini Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-5 rounded-3xl flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Última venda</p>
                <p className="text-sm font-bold">Hoje às <span className="text-purple-400">20:52</span></p>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="glass-card p-5 rounded-3xl space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Saldo gerado</p>
              <p className="text-sm font-bold text-white">R$ 0,61 <span className="text-xs text-muted-foreground font-medium ml-1">nesta sessão</span></p>
            </div>
            <div className="glass-card p-5 rounded-3xl flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Taxa de conversão</p>
                <p className="text-sm font-bold">93,75%</p>
              </div>
              <div className="flex gap-0.5">
                {[1,2,3].map(i => <div key={i} className="w-1 h-3 rounded-full bg-green-500/40" />)}
                <div className="w-1 h-3 rounded-full bg-green-500" />
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="glass-card p-8 rounded-[2.5rem] purple-glow">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold tracking-tight italic uppercase">Performance</h3>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <button className="text-purple-400 border-b border-purple-400 pb-0.5">Ganhos</button>
                  <button className="hover:text-white transition-colors">Cliques</button>
                  <button className="hover:text-white transition-colors">Vendas</button>
                </div>
              </div>
              <div className="flex items-center bg-black/40 p-1 rounded-xl">
                {['Hoje', '7 dias', '30 dias', 'Este Mês', 'Total'].map((tab, idx) => (
                  <button 
                    key={tab} 
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all",
                      idx === 2 ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "text-muted-foreground hover:text-white"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            
            <PerformanceChart data={PERFORMANCE_DATA} />

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
                <h3 className="text-xl font-extrabold tracking-tight uppercase italic">Itens <span className="text-purple-500">mais populares</span></h3>
                <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg">
                  <Star size={14} className="text-purple-500" />
                  <span className="text-[10px] font-bold uppercase text-purple-400">Ativos</span>
                </div>
              </div>
              <div className="space-y-4">
                {SOLD_ITEMS.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center overflow-hidden border border-white/5">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold truncate max-w-[120px]">{item.name}</p>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase">{item.salesCount} vendas • <span className="text-purple-400">R$ {parseFloat(item.price.slice(3)) * 0.1} comissão</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold">{item.price}</p>
                      <p className="text-[9px] font-bold text-green-500 uppercase">Em alta</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-4 rounded-2xl border border-white/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-white/5 transition-colors">
                Ver todos os itens
              </button>
            </div>

            {/* Sold Items Detail */}
            <div className="glass-card p-8 rounded-[2.5rem]">
               <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-extrabold tracking-tight uppercase italic">Seus <span className="text-purple-500">Itens Vendidos</span></h3>
                <button className="p-2 glass-card rounded-lg">
                  <ChevronDown size={14} />
                </button>
              </div>
              <div className="space-y-4">
                {SOLD_ITEMS.slice(0, 2).map((item, idx) => (
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
          <div className="glass-card p-8 rounded-[2.5rem] border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
            <div className="flex items-center gap-3 mb-4">
              <Zap size={20} className="text-purple-500" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Sua Posição <span className="text-purple-500">no Ranking</span></h3>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center text-xl font-black italic border border-white/5">
                  #7
                </div>
                <div>
                  <p className="text-lg font-bold">R$ 12,40</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">Faltam para o <span className="text-purple-400">#6</span></p>
                </div>
              </div>
              <TrendingUp className="text-green-500" />
            </div>
          </div>

          {/* Ranking Widget */}
          <div className="glass-card p-8 rounded-[2.5rem] purple-glow">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-extrabold tracking-tight uppercase italic"><Trophy size={20} className="inline mr-2 text-amber-500" /> Top <span className="text-purple-500">Afiliados</span></h3>
              <span className="text-[10px] font-bold text-muted-foreground uppercase bg-white/5 px-2 py-1 rounded-lg">Mensal</span>
            </div>
            <div className="space-y-6">
              {TOP_AFFILIATES.map((aff) => (
                <div key={aff.rank} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img src={aff.avatarUrl} alt={aff.username} className="w-12 h-12 rounded-2xl border-2 border-white/5 relative z-10" />
                      {aff.rank === 1 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full z-20 flex items-center justify-center border-2 border-[#110d21]"><span className="text-[8px] font-bold">1</span></div>}
                    </div>
                    <div>
                      <p className="text-sm font-bold group-hover:text-purple-400 transition-colors">{aff.username}</p>
                      <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                        <Users size={10} /> 140 vendas
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-green-400">{aff.commission}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-10 py-4 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-2xl text-[10px] font-extrabold uppercase tracking-[0.1em] transition-all">
              Seguir este ranking
            </button>
          </div>

          {/* Withdrawal History Widget */}
          <div className="glass-card p-8 rounded-[2.5rem] space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/5 rounded-2xl">
                <HandCoins className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight uppercase italic">Histórico de <span className="text-purple-500">saques</span></h3>
            </div>
            
            <div className="space-y-4">
              {RECENT_WITHDRAWALS.map((w) => (
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
              <h3 className="text-sm font-bold uppercase tracking-widest italic">Como <span className="text-purple-500">funciona?</span></h3>
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
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground italic">Regras e Info</h3>
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
        availableBalance={5.41}
        withdrawals={RECENT_WITHDRAWALS}
      />
    </div>
  );
}
