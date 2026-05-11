import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Star, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ParticleBackground from './ParticleBackground';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  price_formatted: string;
  image: string;
}

export default function Store() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const affiliateCode = searchParams.get('ref') || localStorage.getItem('valtrix_ref');

  useEffect(() => {
    api
      .get('/api/store/products')
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, []);

  const handleBuy = async (product: Product) => {
    setBuyingId(product.id);
    try {
      const response = await api.post('/api/store/checkout', {
        item_id: product.id,
        item_name: product.name,
        item_price: product.price,
        affiliate_code: affiliateCode,
      });
      if (response.data.init_point) {
        window.location.href = response.data.init_point;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Erro ao processar checkout');
    } finally {
      setBuyingId(null);
    }
  };

  const trustBadges = [
    { icon: ShieldCheck, title: 'Segurança Total', desc: 'Processado via Mercado Pago' },
    { icon: Zap, title: 'Entrega Rápida', desc: 'Sincronizado com sua conta' },
    { icon: Star, title: 'Qualidade', desc: 'Itens reais e verificados' },
  ];

  return (
    <div className="min-h-screen bg-[#04020b] text-white p-4 lg:p-8 relative overflow-hidden">
      <ParticleBackground />

      {/* Navbar */}
      <nav className="flex items-center justify-between mb-12 z-10 relative bg-white/[0.02] p-4 rounded-3xl border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
          <span className="font-extrabold text-lg tracking-tight text-white italic uppercase">
            Valtrix <span className="text-purple-500">Store</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold text-purple-400 transition-all border border-white/5"
            >
              <ShieldCheck size={14} />
              Painel Admin
            </button>
          )}
          {affiliateCode && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
              <ShieldCheck size={12} className="text-green-400" />
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">
                Referência: {affiliateCode}
              </span>
            </div>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-500/20 active:scale-95"
          >
            Área do Afiliado
            <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="text-center mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 rounded-full border border-purple-500/20 mb-6"
        >
          <Zap size={14} className="text-purple-400" />
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Produtos Reais do Roblox</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-black tracking-tighter mb-6 italic uppercase"
        >
          Seus itens favoritos <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">mais baratos.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/50 max-w-2xl mx-auto text-lg font-medium"
        >
          Aproveite as ofertas exclusivas da Valtrix. Itens entregues diretamente na sua conta com segurança garantida via
          Mercado Pago.
        </motion.p>
      </header>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10 mb-20">
        {loading
          ? Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="glass-card h-[400px] rounded-[2.5rem] animate-pulse flex flex-col p-8 space-y-4">
                  <div className="w-full h-48 bg-white/5 rounded-2xl" />
                  <div className="w-2/3 h-6 bg-white/5 rounded-lg" />
                  <div className="w-full h-20 bg-white/5 rounded-lg" />
                  <div className="w-1/2 h-10 bg-white/5 rounded-lg mt-auto" />
                </div>
              ))
          : products.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-8 rounded-[2.5rem] flex flex-col group hover:border-purple-500/30 transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6">
                  <div className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/5">
                    <Star size={18} className="text-yellow-500" />
                  </div>
                </div>

                <div className="mb-6 relative">
                  <div className="absolute inset-0 bg-purple-500/20 blur-[60px] rounded-full scale-0 group-hover:scale-100 transition-transform duration-700" />
                  <div className="w-full aspect-square bg-black/20 rounded-3xl flex items-center justify-center p-4 relative border border-white/5 group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                  </div>
                </div>

                <div className="space-y-2 mb-8">
                  <h3 className="text-xl font-bold tracking-tight group-hover:text-purple-400 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-white/40 line-clamp-3 min-h-[60px]">
                    {product.description || 'Nenhuma descrição fornecida pelo Roblox.'}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Preço</p>
                    <p className="text-2xl font-black text-white">{product.price_formatted}</p>
                  </div>
                  <button
                    disabled={buyingId === product.id}
                    onClick={() => handleBuy(product)}
                    className="px-8 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
                  >
                    {buyingId === product.id ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShoppingBag size={18} />
                        <span>Comprar</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
      </div>

      {/* Trust Badges */}
      <section className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 mb-20">
        {trustBadges.map((badge, i) => (
          <div key={i} className="flex items-center gap-4 p-6 glass-card rounded-2xl">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0 border border-purple-500/20">
              <badge.icon size={22} className="text-purple-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm">{badge.title}</h4>
              <p className="text-xs text-white/40">{badge.desc}</p>
            </div>
          </div>
        ))}
      </section>

      <footer className="text-center py-12 border-t border-white/5 relative z-10">
        <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.5em]">
          Valtrix Platform &copy; 2026 • Conectado à <span className="text-white">API do Roblox</span>
        </p>
      </footer>
    </div>
  );
}
