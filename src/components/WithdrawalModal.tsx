import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Wallet, Info, History } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Withdrawal } from '@/src/types';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  withdrawals: Withdrawal[];
  username: string;
  onSuccess: () => void;
}

export default function WithdrawalModal({ isOpen, onClose, availableBalance, withdrawals, username, onSuccess }: WithdrawalModalProps) {
  const [amount, setAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const pendingBalance = 0.00; // Mocked
  const totalWithdrawn = withdrawals.filter(w => w.status === 'approved').reduce((acc, w) => acc + parseFloat(w.amount.replace('R$ ', '').replace('.', '').replace(',', '.')), 0);

  const handleSubmit = async () => {
    if (!amount || !pixKey || !recipient) {
      setError('Preencha todos os campos');
      return;
    }
    
    const val = parseFloat(amount);
    if (isNaN(val) || val < 10) {
      setError('Saque mínimo de R$ 10,00');
      return;
    }
    
    if (val > availableBalance) {
      setError('Saldo insuficiente');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          amount: val,
          pixKey,
          recipient
        })
      });
      
      if (res.ok) {
        onSuccess();
        onClose();
        setAmount('');
        setPixKey('');
        setRecipient('');
      } else {
        const data = await res.json();
        setError(data.error || 'Erro ao processar saque');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[3rem] relative purple-glow border border-white/10 p-10 scrollbar-hide"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                <Wallet className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter italic">Saque via <span className="text-purple-500">Pix</span></h2>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-1">Processamento em até 48h úteis</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5"
            >
              <X className="w-6 h-6 text-white/50" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-8">
              {/* Form */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Valor (R$)</label>
                    <button 
                      onClick={() => setAmount(availableBalance.toString())}
                      className="text-[10px] font-black uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      MAX DISPONÍVEL
                    </button>
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-16 bg-black/40 border border-white/5 rounded-2xl px-6 text-white font-black text-xl italic placeholder:text-white/10 focus:outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2">Titular da Conta</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="NOME COMPLETO"
                    className="w-full h-14 bg-black/40 border border-white/5 rounded-2xl px-6 text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2">Chave Pix</label>
                  <input
                    type="text"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder="CPF, E-MAIL OU CELULAR"
                    className="w-full h-14 bg-black/40 border border-white/5 rounded-2xl px-6 text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl text-center">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full h-20 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black uppercase italic tracking-[0.2em] rounded-2xl shadow-xl shadow-purple-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Confirmar Saque</span>
                    <div className="w-px h-6 bg-white/20" />
                    <span className="text-xl">R$ {parseFloat(amount || '0').toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {/* Balance Summary */}
              <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 space-y-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Saldo Disponível</p>
                  <p className="text-2xl font-black italic text-cyan-400">R$ {availableBalance.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Total Sacado</p>
                  <p className="text-2xl font-black italic text-purple-400">R$ {totalWithdrawn.toFixed(2)}</p>
                </div>
              </div>

              {/* Rules */}
              <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-amber-500">
                  <Info size={14} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Informações</p>
                </div>
                <ul className="space-y-3">
                  {[
                    'Saque mínimo R$ 10,00',
                    'Prazo de até 48h úteis',
                    'Taxa de saque: R$ 0,00'
                  ].map((rule, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="text-[11px] font-black text-white/40 uppercase italic">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recent History */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-white/20 px-2">
                  <History size={14} />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Recentes</h3>
                </div>
                <div className="space-y-2">
                  {withdrawals.slice(0, 3).map((w) => (
                    <div key={w.id} className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-white uppercase italic tracking-tight">{w.amount}</p>
                        <p className="text-[8px] font-black text-white/20 uppercase mt-0.5">{w.date}</p>
                      </div>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        w.status === 'approved' ? 'bg-green-500' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                      )} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
