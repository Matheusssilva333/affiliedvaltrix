import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, MousePointer2, TrendingUp, Trophy, Copy, ExternalLink,
  ChevronDown, Bell, LogOut, Wallet, Star,
  HandCoins, Zap, ShieldCheck, ShoppingBag, CheckCircle2,
  Calendar, ArrowUpRight, History, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import StatsCard from './StatsCard';
import PerformanceChart from './PerformanceChart';
import WithdrawalModal from './WithdrawalModal';
import ParticleBackground from './ParticleBackground';
import { PerformanceData, TopAffiliate, SoldItem, Withdrawal, User } from '../types';
import axios from 'axios';

interface DashboardProps {
  user: User | null;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const affiliateLink = `${baseUrl.replace('http://', '').replace('https://', '')}/?ref=${user?.username}`;
  const [isCopied, setIsCopied] = useState(false);
  const navigate = useNavigate();

  const [stats, setStats] = useState({ clicks: 0, sales: 0, earnings: 'R$ 0,00', available: 'R$ 0,00' });
  const [performance, setPerformance] = useState<PerformanceData[]>([]);
  const [ranking, setRanking] = useState<TopAffiliate[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [chartFilter, setChartFilter] = useState('30 dias');
  const [soldItems, setSoldItems] = useState<SoldItem[]>([]);
  const [popularItems, setPopularItems] = useState<SoldItem[]>([]);

  const refreshData = async () => {
    try {
      const statsRes = await axios.get('/api/affiliate/stats');
      setStats(statsRes.data.stats);
      const withdrawalsRes = await axios.get('/api/affiliate/withdrawals');
      setWithdrawals(withdrawalsRes.data);
      
      // Update real data
      if (statsRes.data.performance?.length) {
        setPerformance(statsRes.data.performance);
      }
      if (statsRes.data.ranking?.length) {
        setRanking(statsRes.data.ranking);
      }
      if (statsRes.data.sold_items?.length) {
        setSoldItems(statsRes.data.sold_items);
      }
      if (statsRes.data.popular_items?.length) {
        setPopularItems(statsRes.data.popular_items);
      }
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

  return (
    <div className="min-h-screen bg-[#04020b] p-4 lg:p-10 space-y-10 max-w-[1600px] mx-auto text-white relative font-sans overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <ParticleBackground />
      </div>
      
      {/* Top Navbar */}
      <nav className="flex items-center justify-between mb-12 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_15px_#7c3aed]" />
          <span className="font-black text-lg tracking-tighter text-white uppercase italic">Valtrix <span className="text-purple-500">Afiliados</span></span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-5 py-2 bg-white/[0.03] rounded-2xl border border-white/5 group hover:border-purple-500/30 transition-all backdrop-blur-xl">
             <div className="relative">
                <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="Avatar" className="w-6 h-6 rounded-lg object-cover" />
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 border-2 border-[#04020b] rounded-full" />
             </div>
             <span className="text-[11px] font-black text-white uppercase tracking-widest">{user.username}</span>
             <div className="w-px h-4 bg-white/10 mx-1" />
             <button onClick={onLogout} className="text-[11px] font-black text-white/30 hover:text-red-400 uppercase tracking-widest transition-colors">Sair</button>
          </div>
        </div>
      </nav>

      {/* Header Greeting */}
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
          <p className="text-white/40 text-sm font-black uppercase tracking-[0.3em]">Acompanhe seus cliques, vendas e ganhos em tempo real.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Main Data */}
        <div className="lg:col-span-8 space-y-10">
          
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
                "flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all border shadow-2xl",
                isCopied 
                  ? "bg-green-500/20 text-green-400 border-green-500/40" 
                  : "bg-purple-600 hover:bg-purple-500 text-white border-transparent shadow-purple-500/20 btn-glow"
              )}
            >
              {isCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              <span>{isCopied ? 'COPIADO!' : 'COPIAR LINK'}</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              subValue="Disponível para saque"
              icon={Trophy}
              variant="gold"
              delay={0.3}
            />
          </div>

          {/* Mini Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                <Calendar size={40} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Última venda</p>
              <p className="text-xl font-black text-white italic">Hoje às 20:52</p>
            </div>
            <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Saldo gerado (Hoje)</p>
              <p className="text-2xl font-black text-white italic-bold">R$ 0,61</p>
            </div>
            <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Taxa de conversão</p>
              <div className="flex items-center gap-3">
                <p className="text-3xl font-black text-green-400 italic-bold">
                  {stats.clicks > 0 ? ((stats.sales / stats.clicks) * 100).toFixed(2) : '93,75'}%
                </p>
                <TrendingUp size={20} className="text-green-500 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="glass-card p-10 rounded-[3rem] border border-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-12">
              <div className="space-y-2">
                <h3 className="text-3xl font-black italic-bold uppercase tracking-tighter">Performance</h3>
                <div className="flex items-center gap-6">
                  {['Ganhos', 'Cliques', 'Vendas'].map((type) => (
                    <div key={type} className="flex items-center gap-2">
                       <div className={cn("w-2 h-2 rounded-full", type === 'Ganhos' ? 'bg-purple-500 shadow-[0_0_8px_#7c3aed]' : 'bg-white/10')} />
                       <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{type}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center bg-black/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
                {['Hoje', '7 dias', '30 dias', 'Total'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setChartFilter(tab)}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      chartFilter === tab ? "bg-purple-600 text-white shadow-xl shadow-purple-500/30" : "text-white/30 hover:text-white"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="relative h-[320px]">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/10 blur-[100px] pointer-events-none" />
               <PerformanceChart data={performance} />
               {/* Last record indicator */}
               <div className="absolute top-[40%] right-[15%] bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-purple-500/30 shadow-2xl z-20">
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">RECORD EM 25/05</p>
                  <p className="text-xl font-black italic-bold text-white">R$ 5,14</p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             {/* Left List: Itens mais populares */}
             <div className="glass-card p-10 rounded-[3rem]">
                <h3 className="text-xl font-black italic-bold uppercase tracking-tighter mb-8">Itens <span className="text-purple-500">mais populares</span></h3>
                <div className="space-y-6">
                   {(popularItems.length > 0 ? popularItems : [
                     { id: '1', name: 'Carregando...', price: 'R$ 0,00', salesCount: 0, image: 'https://api.dicebear.com/7.x/shapes/svg?seed=item1' },
                   ]).map(item => (
                     <div key={item.id} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-5">
                           <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-purple-500/50 transition-colors">
                              <img src={item.image} className="w-8 h-8 opacity-60" />
                           </div>
                           <div>
                              <p className="text-sm font-black italic uppercase tracking-tight">{item.name}</p>
                              <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">{item.salesCount} VENDAS</p>
                           </div>
                        </div>
                        <p className="text-sm font-black italic-bold">{item.price}</p>
                     </div>
                   ))}
                </div>
             </div>

             {/* Right List: Meus Itens Vendidos */}
             <div className="glass-card p-10 rounded-[3rem]">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black italic-bold uppercase tracking-tighter">Itens <span className="text-purple-500">Vendidos</span></h3>
                  <button onClick={() => navigate('/store')} className="text-[10px] font-black uppercase text-purple-400 bg-purple-500/10 px-3 py-1 rounded-lg">LOJA OFICIAL <ExternalLink size={10} className="inline ml-1" /></button>
                </div>
                <div className="space-y-6">
                   {(soldItems.length > 0 ? soldItems : [
                     { id: '1', name: 'Nenhum item vendido', price: 'R$ 0,00', salesCount: 0, image: 'https://api.dicebear.com/7.x/shapes/svg?seed=jeans' },
                   ]).map((item, idx) => (
                     <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                           <span className="text-[10px] font-black text-white/20 italic">#{idx + 1}</span>
                           <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                              <img src={item.image} className="w-7 h-7 opacity-50" />
                           </div>
                           <div>
                              <p className="text-sm font-black italic uppercase tracking-tight">{item.name}</p>
                              <p className="text-[9px] font-black text-green-500/50 uppercase tracking-widest">{item.salesCount} VENDAS</p>
                           </div>
                        </div>
                        <p className="text-sm font-black italic-bold">{item.price}</p>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Widgets */}
        <aside className="lg:col-span-4 space-y-10">
          
          {/* Posição no Ranking */}
          <div className="glass-card p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group amber-glow">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[80px] -mr-10 -mt-10 pointer-events-none" />
             <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-4 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.6)]" />
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white italic-bold">Posição no Ranking</h3>
             </div>
             <div className="flex items-center gap-8">
                <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-amber-500/30 to-amber-500/5 flex items-center justify-center border border-amber-500/30 shadow-2xl">
                   <Trophy size={32} className="text-amber-500 fill-amber-500/20" />
                </div>
                <div className="space-y-1">
                   <div className="flex items-center gap-2">
                      <span className="text-5xl font-black italic-bold text-white tracking-tighter">#1</span>
                      <div className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[8px] font-black rounded uppercase">Top Rank</div>
                   </div>
                   <p className="text-2xl font-black italic text-amber-500 tracking-tight">R$ 23,40</p>
                   <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Ganhos no mês</p>
                </div>
             </div>
          </div>

          {/* Top Afiliados do Mês */}
          <div className="glass-card p-10 rounded-[3rem] border border-white/5 relative">
             <div className="flex items-center gap-4 mb-10">
                <Trophy size={20} className="text-amber-500" />
                <h3 className="text-sm font-black uppercase tracking-[0.2em] italic-bold">Top Afiliados <span className="text-purple-500">do Mês</span></h3>
             </div>
             <div className="space-y-8">
                {ranking.map((aff) => (
                  <div key={aff.rank} className="flex items-center justify-between group hover:translate-x-1 transition-transform">
                     <div className="flex items-center gap-4">
                        <span className="text-[11px] font-black text-white/10 w-4 italic">0{aff.rank}</span>
                        <div className="relative">
                           <img src={aff.avatarUrl} alt={aff.username} className="w-12 h-12 rounded-2xl border border-white/5 group-hover:border-purple-500/40 transition-colors shadow-lg" />
                           {aff.rank === 1 && <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center border-2 border-[#04020b] shadow-lg"><Star size={10} className="fill-white text-white" /></div>}
                        </div>
                        <div>
                           <p className="text-sm font-black text-white italic uppercase tracking-tighter">{aff.username}</p>
                           <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Rank atual</p>
                        </div>
                     </div>
                     <span className="text-sm font-black text-green-400 italic-bold">{aff.commission}</span>
                  </div>
                ))}
             </div>
             <button className="w-full mt-10 py-5 bg-[#1B1231]/50 hover:bg-purple-600 hover:text-white text-purple-400 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all border border-purple-500/20 shadow-2xl flex items-center justify-center gap-3">
                <TrendingUp size={16} />
                Seguir Ranking
             </button>
          </div>

          {/* Histórico de Saques */}
          <div className="glass-card p-10 rounded-[3rem] border border-white/5 relative">
             <div className="flex items-center gap-4 mb-10">
                <History size={20} className="text-purple-400" />
                <h3 className="text-sm font-black uppercase tracking-[0.2em] italic-bold">Histórico de saques</h3>
             </div>
             <div className="space-y-6">
                {[
                  { id: 1, date: '10 de mai - 18h47', amount: 'R$ 15,30', status: 'approved', method: 'Saque via Pix' },
                  { id: 2, date: '16 de abr - 14h20', amount: 'R$ 10,10', status: 'pending', method: 'Saque via Pix' },
                  { id: 3, date: '12 de abr - 09h15', amount: 'R$ 10,10', status: 'pending', method: 'Saque via Pix' },
                ].map(w => (
                  <div key={w.id} className="flex items-center justify-between group">
                     <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center border", w.status === 'approved' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-purple-500/10 border-purple-500/20 text-purple-400')}>
                           <HandCoins size={20} />
                        </div>
                        <div>
                           <p className="text-sm font-black italic uppercase tracking-tighter">{w.date}</p>
                           <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">{w.method} • <span className={w.status === 'approved' ? 'text-green-500/50' : 'text-amber-500/50'}>{w.status === 'approved' ? 'ENVIADO' : 'PENDENTE'}</span></p>
                        </div>
                     </div>
                     <span className={cn("text-sm font-black italic-bold", w.status === 'approved' ? 'text-green-400' : 'text-white/40')}>{w.amount}</span>
                  </div>
                ))}
             </div>
             
             <button
              onClick={() => setIsWithdrawalModalOpen(true)}
              className="w-full mt-10 h-20 bg-gradient-to-r from-[#f59e0b] to-[#ea580c] hover:from-[#fbbf24] hover:to-[#f97316] text-white font-black uppercase italic-bold tracking-[0.3em] rounded-[1.8rem] shadow-2xl shadow-amber-500/20 flex items-center justify-center gap-4 active:scale-[0.98] transition-all group"
            >
              <Zap size={22} className="group-hover:animate-pulse" />
              <span>Solicitar Saque</span>
            </button>
          </div>

          {/* Como funciona (Steps) */}
          <div className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20">
                <Info size={18} className="text-purple-400" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] italic-bold">Como <span className="text-purple-500">funciona?</span></h3>
            </div>
            <ul className="space-y-6">
              {[
                'Copie seu link',
                'Compartilhe seu link',
                'Acompanhe cliques e vendas',
                'Ganhos entram como pendentes',
                'Após 7 dias, ficam disponíveis',
                'Solicite seu saque via Pix',
                'Receba na sua conta!'
              ].map((step, idx) => (
                <li key={idx} className="flex items-center gap-5 group">
                  <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20 group-hover:bg-green-500 group-hover:text-white transition-all">
                    <CheckCircle2 size={12} className={cn("transition-colors", "text-green-500 group-hover:text-white")} />
                  </div>
                  <span className="text-white/50 text-xs font-black uppercase tracking-widest italic group-hover:text-white transition-colors">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Como funciona (Numbered) */}
          <div className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-8 bg-gradient-to-br from-white/[0.03] to-transparent">
            <div className="flex items-center gap-4">
              <Zap size={20} className="text-amber-500 fill-amber-500/20" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] italic-bold">Como funciona</h3>
            </div>
            <div className="space-y-6">
              {[
                'Acesse o site da dashboard.valtrix',
                'Faça o login com seu username do roblox',
                'Agora é só copiar seu link',
                'Criar divulgações em redes sociais',
                'Pagamento automático via pix!'
              ].map((text, idx) => (
                <div key={idx} className="flex items-center gap-5">
                   <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-[10px] font-black text-amber-500 italic">
                      {idx + 1}
                   </div>
                   <p className="text-[11px] font-black text-white/30 uppercase tracking-widest italic">{text}</p>
                </div>
              ))}
            </div>
          </div>

        </aside>
      </div>

      <footer className="pt-20 pb-10 text-center relative z-10">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-px bg-white/5" />
          <p className="text-white/10 text-[11px] uppercase font-black tracking-[1em] italic">
            Valtrix Platform Official Affiliate
          </p>
        </div>
      </footer>

      {/* Withdrawal Modal */}
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

