import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Wallet, History, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { Withdrawal } from '../types';
import axios from 'axios';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  withdrawals: Withdrawal[];
  username: string;
  onSuccess: () => void;
}

export default function WithdrawalModal({
  isOpen,
  onClose,
  availableBalance,
  withdrawals,
  onSuccess,
}: WithdrawalModalProps) {
  const [amount, setAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const totalWithdrawn = withdrawals
    .filter((w) => w.status === 'paid' || w.status === 'approved')
    .reduce((acc, w) => acc + (typeof w.amount === 'number' ? w.amount : 0), 0);

  const validate = (): string | null => {
    if (!amount || !pixKey || !recipient) return 'Preencha todos os campos';
    const val = parseFloat(amount);
    if (isNaN(val) || val < 10) return 'Saque mínimo de R$ 10,00';
    if (val > availableBalance) return 'Saldo insuficiente';
    return null;
  };

  const resetForm = () => {
    setAmount('');
    setPixKey('');
    setRecipient('');
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await axios.post('/api/affiliate/withdraw', {
        amount: parseFloat(amount),
        pix_key: pixKey,
        recipient,
      });
      onSuccess();
      onClose();
      resetForm();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.msg : undefined;
      setError(msg ?? 'Erro ao processar saque');
    } finally {
      setIsLoading(false);
    }
  };

  const getWithdrawalDateDisplay = (w: Withdrawal): string => {
    const raw = w.created_at ?? w.date ?? '';
    if (!raw) return '—';
    const d = new Date(raw);
    return isNaN(d.getTime()) ? raw : d.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 40 }}
          className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] relative border border-white/10 p-12"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-5">
              <div className="p-5 bg-purple-500/10 rounded-3xl border border-purple-500/20 shadow-2xl">
                <Wallet className="w-10 h-10 text-purple-400" />
              </div>
              <div>
                <h2 className="text-4xl font-black uppercase tracking-tighter">
                  Saque via <span className="text-purple-500">Pix</span>
                </h2>
                <p className="text-white/30 text-xs font-black uppercase tracking-widest mt-1">
                  Sua comissão cai na conta em até 48h
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5"
            >
              <X className="w-6 h-6 text-white/30" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Form */}
            <div className="lg:col-span-3 space-y-10">
              <div className="space-y-8">
                <FieldGroup label="Valor para Saque" onAction={() => setAmount(availableBalance.toFixed(2))} actionLabel="USAR TUDO">
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black italic text-white/20">R$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-20 bg-black/40 border border-white/5 rounded-3xl pl-16 pr-6 text-white font-black text-3xl italic placeholder:text-white/5 focus:outline-none focus:border-purple-500/50 transition-all shadow-inner"
                    />
                  </div>
                </FieldGroup>

                <FieldGroup label="Titular da Conta">
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="NOME COMPLETO DO RECEBEDOR"
                    className="w-full h-16 bg-black/40 border border-white/5 rounded-2xl px-6 text-white font-black uppercase tracking-widest text-xs placeholder:text-white/5 focus:outline-none focus:border-purple-500/50 transition-all"
                  />
                </FieldGroup>

                <FieldGroup label="Sua Chave Pix">
                  <input
                    type="text"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder="CPF, E-MAIL OU TELEFONE"
                    className="w-full h-16 bg-black/40 border border-white/5 rounded-2xl px-6 text-white font-black uppercase tracking-widest text-xs placeholder:text-white/5 focus:outline-none focus:border-purple-500/50 transition-all"
                  />
                </FieldGroup>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest p-5 rounded-2xl text-center"
                >
                  {error}
                </motion.div>
              )}

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full h-24 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black uppercase italic tracking-[0.3em] rounded-3xl shadow-2xl shadow-purple-500/30 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-5"
              >
                {isLoading ? (
                  <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="text-lg">Confirmar Saque</span>
                    <div className="w-px h-8 bg-white/20" />
                    <span className="text-2xl">R$ {parseFloat(amount || '0').toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Disponível para Saque</p>
                  <p className="text-4xl font-black italic text-cyan-400">R$ {availableBalance.toFixed(2)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Total já Sacado</p>
                  <p className="text-3xl font-black italic text-purple-400">R$ {totalWithdrawn.toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                <div className="flex items-center gap-3 text-amber-500">
                  <Info size={16} />
                  <p className="text-xs font-black uppercase tracking-widest italic">Informações</p>
                </div>
                <ul className="space-y-4">
                  {['Saque mínimo R$ 10,00', 'Processamento manual em 48h', 'Taxas administrativas: R$ 0,00'].map(
                    (rule, idx) => (
                      <li key={idx} className="flex items-center gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_#7c3aed]" />
                        <span className="text-[11px] font-black text-white/40 uppercase italic tracking-tight">{rule}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-3 text-white/20 px-2">
                  <History size={16} />
                  <h3 className="text-xs font-black uppercase tracking-widest italic">Últimos Saques</h3>
                </div>
                <div className="space-y-3">
                  {withdrawals.length > 0 ? (
                    withdrawals.slice(0, 3).map((w) => (
                      <div
                        key={w.id}
                        className="p-5 bg-white/[0.02] rounded-2xl border border-white/5 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-black text-white italic uppercase tracking-tight">
                            R$ {typeof w.amount === 'number' ? w.amount.toFixed(2) : w.amount}
                          </p>
                          <p className="text-[9px] font-black text-white/20 uppercase mt-0.5">
                            {getWithdrawalDateDisplay(w)}
                          </p>
                        </div>
                        <div
                          className={cn(
                            'w-2.5 h-2.5 rounded-full shadow-lg',
                            w.status === 'paid' || w.status === 'approved'
                              ? 'bg-green-500 shadow-green-500/40'
                              : w.status === 'pending'
                              ? 'bg-amber-500 shadow-amber-500/40 animate-pulse'
                              : 'bg-red-500 shadow-red-500/40'
                          )}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-white/10 text-[10px] font-black uppercase tracking-widest">
                      Nenhum saque recente
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface FieldGroupProps {
  label: string;
  children: React.ReactNode;
  onAction?: () => void;
  actionLabel?: string;
}

function FieldGroup({ label, children, onAction, actionLabel }: FieldGroupProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-2">
        <label className="text-[11px] font-black uppercase tracking-widest text-white/30">{label}</label>
        {onAction && actionLabel && (
          <button
            onClick={onAction}
            className="text-[10px] font-black uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors"
          >
            {actionLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
