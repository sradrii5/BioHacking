'use client';

import { useEffect } from 'react';

interface AdSenseUnitProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function AdSenseUnit({ 
  slot, 
  format = 'auto', 
  responsive = true, 
  className = '',
  style = {}
}: AdSenseUnitProps) {
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  useEffect(() => {
    // Only try to push if we have a client ID and we're in a browser
    if (adClient && typeof window !== 'undefined') {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [adClient]);

  // If no client ID, show a premium placeholder
  if (!adClient) {
    return (
      <div className={`bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl flex items-center justify-center min-h-[100px] ${className}`} style={style}>
        <div className="text-center p-4">
          <p className="text-zinc-700 text-[9px] font-black uppercase tracking-[0.3em]">
            Ad Space (Ready for Monetization)
          </p>
          <p className="text-zinc-800 text-[8px] mt-1 font-medium">
            Slot ID: {slot}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`adsense-container overflow-hidden ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client={adClient}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
