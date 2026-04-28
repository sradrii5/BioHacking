import React from 'react';

interface ProductCardProps {
  product: {
    name: string;
    affiliate_link: string;
    price_point: string;
    keywords: string[];
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

  const getEmoji = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('gafas') || lowerName.includes('glasses')) return '👓';
    if (lowerName.includes('band') || lowerName.includes('gtr') || lowerName.includes('reloj') || lowerName.includes('watch')) return '⌚';
    if (lowerName.includes('manta') || lowerName.includes('blanket') || lowerName.includes('sauna')) return '🧖‍♂️';
    if (lowerName.includes('hongo') || lowerName.includes('mushroom')) return '🍄';
    if (lowerName.includes('anillo') || lowerName.includes('ring')) return '💍';
    return '💊';
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col group relative overflow-hidden">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-600/5 rounded-full blur-2xl group-hover:bg-blue-600/10 transition-colors"></div>
      
      <div className="flex justify-between items-start mb-6">
        <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
          {getPriceIcons(product.price_point)}
        </span>
        <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
          {getEmoji(product.name)}
        </div>
      </div>

      <h4 className="text-xl font-black text-slate-900 leading-tight mb-4 group-hover:text-blue-600 transition-colors">
        {product.name}
      </h4>

      <div className="flex flex-wrap gap-2 mb-8">
        {product.keywords.slice(0, 3).map(kw => (
          <span key={kw} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            #{kw}
          </span>
        ))}
      </div>

      <a 
        href={product.affiliate_link} 
        target="_blank" 
        rel="nofollow noreferrer"
        className="mt-auto w-full bg-slate-900 text-white text-center py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-500/20"
      >
        {dict.common?.buy_now || 'Comprar Ahora'}
      </a>
    </div>
  );
}
