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
    <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col group relative overflow-hidden">
      {/* Price Badge */}
      <div className="absolute left-6 top-6 z-10">
        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-blue-50">
          {getPriceIcons(product.price_point)}
        </span>
      </div>

      {/* Product Image */}
      <div className="w-full aspect-square bg-slate-50 rounded-[2rem] mb-6 overflow-hidden flex items-center justify-center p-6 group-hover:bg-white transition-colors duration-500 border border-transparent group-hover:border-slate-100">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" 
          />
        ) : (
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-3xl">
            🧬
          </div>
        )}
      </div>

      <h4 className="text-lg font-black text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
        {product.name}
      </h4>

      <div className="flex flex-wrap gap-2 mb-6">
        {product.keywords.slice(0, 2).map(kw => (
          <span key={kw} className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            #{kw}
          </span>
        ))}
      </div>

      <a 
        href={product.affiliate_link} 
        target="_blank" 
        rel="nofollow noreferrer"
        className="mt-auto w-full bg-slate-900 text-white text-center py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-500/20"
      >
        {dict.common?.buy_now || 'Comprar Ahora'}
      </a>
    </div>
  );
}
