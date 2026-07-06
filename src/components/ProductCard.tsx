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
    <div className="bg-zinc-900/60 rounded-xl p-5 border border-zinc-800/60 hover:border-zinc-700 transition-all duration-200 flex flex-col group relative overflow-hidden">
      {/* Price Badge */}
      <div className="absolute left-6 top-6 z-10 flex items-center gap-2">
        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-zinc-950/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-xl border border-zinc-800">
          {getPriceIcons(product.price_point)}
        </span>
      </div>

      {/* Product Image */}
      <div className="w-full aspect-square bg-zinc-950 rounded-lg mb-5 overflow-hidden flex items-center justify-center p-5 group-hover:bg-zinc-800 transition-colors duration-300 border border-zinc-800/60">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100" 
          />
        ) : (
          <div className="w-12 h-12 flex items-center justify-center text-zinc-600">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.332 2.798H4.13c-1.364 0-2.333-1.799-1.333-2.798L4 15.3" />
            </svg>
          </div>
        )}
      </div>

      <h4 className="text-sm font-bold text-zinc-100 leading-snug mb-2 group-hover:text-blue-300 transition-colors font-heading tracking-tight">
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
        className="mt-auto w-full bg-zinc-800 text-zinc-100 text-center py-3 rounded-lg text-xs font-semibold hover:bg-blue-600 hover:text-white transition-all active:scale-[0.98]"
      >
        {dict.common?.buy_now || 'Comprar Ahora'}
      </a>
    </div>
  );
}
