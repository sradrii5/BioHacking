'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TrustScoreTooltipProps {
  score: number;
  label: string;
  description: string;
}

export const TrustScoreTooltip = ({ score, label, description }: TrustScoreTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full shadow-2xl relative">
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
        {label}: <span className="text-blue-500">{score}%</span>
      </span>
      
      <div className="relative flex items-center" ref={tooltipRef}>
        <button 
          onClick={() => setIsVisible(!isVisible)}
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
          className="w-5 h-5 rounded-full bg-zinc-800 text-[9px] flex items-center justify-center font-black hover:bg-blue-600 transition-colors cursor-help border border-zinc-700 active:scale-90"
          aria-label="More information"
        >
          i
        </button>

        {/* Custom Tooltip */}
        <div 
          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl transition-all duration-200 z-50 text-left ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <p className="text-[9px] text-zinc-400 leading-relaxed font-medium">
            {description}
          </p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-zinc-800"></div>
        </div>
      </div>
    </div>
  );
};
