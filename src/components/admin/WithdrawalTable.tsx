import React from 'react';
import { Check, X, Search } from 'lucide-react';

interface PendingWithdrawal {
  id: number;
  username: string;
  amount: number;
  pix_key: string;
  recipient: string;
  created_at: string;
}

interface WithdrawalTableProps {
  withdrawals: PendingWithdrawal[];
  processingId: number | null;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

export default function WithdrawalTable({ withdrawals, processingId, onApprove, onReject }: WithdrawalTableProps) {
  return (
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
          {withdrawals.length > 0 ? (
            withdrawals.map((w) => (
              <tr key={w.id} className="text-sm font-bold hover:bg-white/[0.02] transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${w.username}`}
                      className="w-8 h-8 rounded-lg"
                      alt={w.username}
                    />
                    <span className="uppercase italic tracking-tight">{w.username}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-green-400 font-black">R$ {w.amount.toFixed(2)}</td>
                <td className="px-8 py-6 font-mono text-[11px] text-white/60">{w.pix_key}</td>
                <td className="px-8 py-6 text-white/60 text-xs uppercase">{w.recipient}</td>
                <td className="px-8 py-6 text-white/30 text-[10px] uppercase">
                  {new Date(w.created_at).toLocaleDateString()}
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onApprove(w.id)}
                      disabled={processingId === w.id}
                      className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-xl transition-all disabled:opacity-50"
                    >
                      {processingId === w.id ? (
                        <div className="w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
                      ) : (
                        <Check size={18} />
                      )}
                    </button>
                    <button
                      onClick={() => onReject(w.id)}
                      disabled={processingId === w.id}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all disabled:opacity-50"
                    >
                      {processingId === w.id ? (
                        <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                      ) : (
                        <X size={18} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-8 py-20 text-center text-white/10 font-black uppercase tracking-[0.4em]">
                Nenhuma solicitação pendente
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
