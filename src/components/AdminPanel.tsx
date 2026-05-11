import React, { useState, useEffect } from 'react';
import { ShieldCheck, Wallet, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import AdminStats from './admin/AdminStats';
import WithdrawalTable from './admin/WithdrawalTable';

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
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [overRes, withRes] = await Promise.all([
        api.get('/api/admin/overview'),
        api.get('/api/admin/withdrawals/pending'),
      ]);
      setOverview(overRes.data);
      setWithdrawals(withRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchData();
  }, [user]);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    if (action === 'reject' && !confirm('Rejeitar este saque?')) return;
    setProcessingId(id);
    try {
      await api.post(`/api/admin/withdrawals/${id}/${action}`);
      await fetchData();
    } catch (_err) {
      alert(`Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} saque`);
    } finally {
      setProcessingId(null);
    }
  };

  if (user?.role !== 'admin') {
    return <div className="text-white p-20 text-center font-bold">Acesso Negado</div>;
  }

  return (
    <div className="min-h-screen bg-[#04020b] p-8 space-y-8 max-w-[1400px] mx-auto text-white">
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">
              Painel <span className="text-purple-500">Admin</span>
            </h1>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Gestão Valtrix</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest transition-all"
        >
          <TrendingUp size={14} className="text-purple-500" />
          Dashboard
        </button>
      </header>

      <AdminStats overview={overview} />

      <section className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center gap-4">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Wallet size={18} className="text-amber-500" />
          </div>
          <h2 className="text-xl font-black italic uppercase tracking-tight">Solicitações de Saque</h2>
        </div>
        <WithdrawalTable
          withdrawals={withdrawals}
          processingId={processingId}
          onApprove={(id) => handleAction(id, 'approve')}
          onReject={(id) => handleAction(id, 'reject')}
        />
      </section>
    </div>
  );
}
