import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SoldItem } from '../../types';

interface ItemsListProps {
  title: string;
  items: SoldItem[];
  showLojaButton?: boolean;
  isRanked?: boolean;
}

export default function ItemsList({ title, items, showLojaButton, isRanked }: ItemsListProps) {
  const navigate = useNavigate();

  const titleParts = title.split(' ');
  const firstWord = titleParts[0];
  const rest = titleParts.slice(1).join(' ');

  const displayItems = items.length > 0
    ? items
    : [{ id: 'empty', name: 'Nenhum item', price: 'R$ 0,00', salesCount: 0, image: 'https://api.dicebear.com/7.x/shapes/svg?seed=empty' }];

  return (
    <div className="glass-card p-10 rounded-[3rem]">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black uppercase tracking-tighter">
          {firstWord} <span className="text-purple-500">{rest}</span>
        </h3>
        {showLojaButton && (
          <button
            onClick={() => navigate('/store')}
            className="text-[10px] font-black uppercase text-purple-400 bg-purple-500/10 px-3 py-1 rounded-lg flex items-center gap-1"
          >
            LOJA <ExternalLink size={10} />
          </button>
        )}
      </div>
      <div className="space-y-6">
        {displayItems.map((item, idx) => (
          <div key={item.id} className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-5">
              {isRanked && <span className="text-[10px] font-black text-white/20 italic">#{idx + 1}</span>}
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-purple-500/50 transition-colors">
                <img src={item.image} className="w-8 h-8 opacity-60" alt={item.name} />
              </div>
              <div>
                <p className="text-sm font-black italic uppercase tracking-tight">{item.name}</p>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                  {item.salesCount} VENDAS
                </p>
              </div>
            </div>
            <p className="text-sm font-black italic">{item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
