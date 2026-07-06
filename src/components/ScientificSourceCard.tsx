import React from 'react';
import { ExternalLink, ShieldCheck, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface ScientificSourceCardProps {
  title: string;
  sourceUrl: string;
  publishDate: string;
  trustScore: number;
  dict?: {
    verified_source: string;
    trust_score: string;
    original_study: string;
  };
}

/**
 * Component to display scientific source authority (YMYL).
 * Implements Schema.org MedicalWebPage metadata.
 */
export const ScientificSourceCard: React.FC<ScientificSourceCardProps> = ({
  title,
  sourceUrl,
  publishDate,
  trustScore,
  dict = {
    verified_source: "Verified Source",
    trust_score: "Trust Score",
    original_study: "View Original Study"
  }
}) => {
  // Schema.org JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": title,
    "url": sourceUrl,
    "lastReviewed": publishDate,
    "mainEntity": {
      "@type": "MedicalScholarlyArticle",
      "name": title,
      "url": sourceUrl,
      "datePublished": publishDate
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-6 transition-colors hover:border-zinc-700">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <ShieldCheck size={16} />
          <span className="text-[10px] uppercase tracking-widest">{dict.verified_source}</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-medium">
          <Calendar size={14} />
          <span>
            {(() => {
              try {
                return publishDate ? format(new Date(publishDate), 'MMM d, yyyy') : 'N/A';
              } catch (e) {
                return 'N/A';
              }
            })()}
          </span>
        </div>
      </div>

      <h3 className="text-base font-bold text-zinc-100 mb-4 leading-snug font-heading tracking-tight">
        {title}
      </h3>

      <div className="mt-8 pt-8 border-t border-zinc-800 flex flex-col gap-6">
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
              {dict.trust_score}
            </span>
            <span className={`text-xs font-black ${
              trustScore > 80 ? 'text-emerald-400' : trustScore > 50 ? 'text-amber-400' : 'text-rose-400'
            }`}>{trustScore}%</span>
          </div>
          <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                trustScore > 80 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : trustScore > 50 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${trustScore}%` }}
            />
          </div>
        </div>

        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-zinc-800/80 text-zinc-200 py-3 rounded-lg text-xs font-semibold hover:bg-zinc-700 hover:text-white transition-all active:scale-[0.98]"
        >
          {dict.original_study}
          <ExternalLink size={16} />
        </a>
      </div>
    </div>
  );
};
