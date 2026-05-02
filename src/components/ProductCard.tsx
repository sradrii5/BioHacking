import React from 'react';

interface ProductCardProps {
  product: {
    name: string;
    affiliate_link: string;
    price_point: string;
    keywords: string[];
    image_url?: string;
  };
  dict: any;
}

export default function ProductCard({ product, dict }: ProductCardProps) {
  const getPriceIcons = (point: string) => {
    switch (point) {
      case 'low': return '$';
      case 'medium': return '$$';
      case 'high': return '$$$';
      default: return '$$';
    }
  };

  return (
    <div className="bg-zinc-900 rounded-[2.5rem] p-6 border border-zinc-800 shadow-sm hover:shadow-2xl hover:border-zinc-700 transition-all duration-300 flex flex-col group relative overflow-hidden">
      {/* Price Badge */}
      <div className="absolute left-6 top-6 z-10 flex items-center gap-2">
        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-zinc-950/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-xl border border-zinc-800">
          {getPriceIcons(product.price_point)}
        </span>
      </div>

      {/* Product Image */}
      <div className="w-full aspect-square bg-zinc-950 rounded-[2rem] mb-6 overflow-hidden flex items-center justify-center p-6 group-hover:bg-zinc-800 transition-colors duration-500 border border-zinc-800">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100" 
          />
        ) : (
          <div className="w-16 h-16 bg-blue-900/20 rounded-full flex items-center justify-center text-3xl text-blue-500">
            🧬
          </div>
        )}
      </div>

      <h4 className="text-lg font-black text-white leading-tight mb-2 group-hover:text-blue-400 transition-colors font-heading">
        {product.name}
      </h4>

      <div className="flex flex-wrap gap-2 mb-6">
        {product.keywords.slice(0, 2).map(kw => (
          <span key={kw} className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">
            #{kw}
          </span>
        ))}
      </div>

      <a 
        href={product.affiliate_link} 
        target="_blank" 
        rel="nofollow noreferrer"
        className="mt-auto w-full bg-white text-black text-center py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95"
      >
        {dict.common?.buy_now || 'Comprar Ahora'}
      </a>
    </div>
  );
}
