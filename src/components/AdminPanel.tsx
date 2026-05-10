import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, ShoppingBag, Wallet, Check, X, Search, Filter, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { cn } from '../lib/utils';

interface AdminOverview {
  total_revenue: number;
  pending_withdrawals: number;
  active_affiliates: number;
}

interface PendingWithdrawal {
  id: number;
  username: string;
  amount: number;
  pix_key: string;
  recipient: string;
  created_at: string;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [withdrawals, setWithdrawals] = useState<PendingWithdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const overRes = await axios.get('/api/admin/overview');
      setOverview(overRes.data);
      
      const withRes = await axios.get('/api/admin/withdrawals/pending');
      setWithdrawals(withRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: number) => {
    setProcessingId(id);
    try {
      await axios.post(`/api/admin/withdrawals/${id}/approve`);
      await fetchData();
    } catch (err) {
      alert('Erro ao aprovar saque');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Deseja realmente rejeitar este saque? O saldo voltará para o usuário.')) return;
    setProcessingId(id);
    try {
      await axios.post(`/api/admin/withdrawals/${id}/reject`);
      await fetchData();
    } catch (err) {
      alert('Erro ao rejeitar saque');
    } finally {
      setProcessingId(null);
    }
  };

  if (user?.role !== 'admin') {
    return <div className="text-white p-20 text-center font-bold">Acesso Negado</div>;
  }

  return (
    <div className="min-h-screen bg-[#04020b] p-8 space-y-8 max-w-[1400px] mx-auto text-white">
      {/* Header */}
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Painel <span className="text-purple-500">Admin</span></h1>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Gestão da Plataforma Valtrix</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <TrendingUp size={14} className="text-purple-500" />
            Dashboard
          </button>
          <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
             <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="Admin" className="w-8 h-8 rounded-xl" />
             <span className="text-xs font-bold uppercase tracking-widest pr-4">{user.username}</span>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShoppingBag size={64} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Faturamento Total</p>
          <p className="text-4xl font-black italic text-white">R$ {overview?.total_revenue.toFixed(2) || '0.00'}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet size={64} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Saques Pendentes</p>
          <p className="text-4xl font-black italic text-amber-500">{overview?.pending_withdrawals || 0}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Users size={64} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Afiliados Ativos</p>
          <p className="text-4xl font-black italic text-cyan-400">{overview?.active_affiliates || 0}</p>
        </motion.div>
      </div>

      {/* Pending Withdrawals Table */}
      <section className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Wallet size={18} className="text-amber-500" />
            </div>
            <h2 className="text-xl font-black italic uppercase tracking-tight">Solicitações de Saque</h2>
          </div>
          <div className="flex gap-4">
             <div className="relative">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
               <input 
                type="text" 
                placeholder="BUSCAR USUÁRIO..." 
                className="bg-black/40 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-purple-500/50"
               />
             </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-white/20 text-left border-b border-white/5">
                <th className="px-8 py-4">Usuário</th>
                <th className="px-8 py-4">Valor</th>
                <th className="px-8 py-4">Chave Pix</th>
                <th className="px-8 py-4">Destinatário</th>
                <th className="px-8 py-4">Data</th>
                <th className="px-8 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {withdrawals.length > 0 ? withdrawals.map((w) => (
                <tr key={w.id} className="text-sm font-bold hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${w.username}`} className="w-8 h-8 rounded-lg" />
                      <span className="uppercase italic tracking-tight">{w.username}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-green-400 font-black">R$ {w.amount.toFixed(2)}</td>
                  <td className="px-8 py-6 font-mono text-[11px] text-white/60">{w.pix_key}</td>
                  <td className="px-8 py-6 text-white/60 text-xs uppercase">{w.recipient}</td>
                  <td className="px-8 py-6 text-white/30 text-[10px] uppercase">{new Date(w.created_at).toLocaleDateString()}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleApprove(w.id)}
                        disabled={processingId === w.id}
                        className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-xl transition-all disabled:opacity-50"
                      >
                        {processingId === w.id ? <div className="w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" /> : <Check size={18} />}
                      </button>
                      <button 
                        onClick={() => handleReject(w.id)}
                        disabled={processingId === w.id}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all disabled:opacity-50"
                      >
                        {processingId === w.id ? <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" /> : <X size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-white/10 font-black uppercase tracking-[0.4em]">Nenhuma solicitação pendente</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
