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
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-emerald-600 font-semibold">
          <ShieldCheck size={20} />
          <span className="text-xs uppercase tracking-widest font-black">{dict.verified_source}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
          <Calendar size={16} />
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

      <h3 className="text-xl font-black text-slate-900 mb-3 leading-tight">
        {title}
      </h3>

      <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black mb-2">
            {dict.trust_score}
          </span>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  trustScore > 80 ? 'bg-emerald-500' : trustScore > 50 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${trustScore}%` }}
              />
            </div>
            <span className="text-sm font-black text-slate-700">{trustScore}%</span>
          </div>
        </div>

        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
        >
          {dict.original_study}
          <ExternalLink size={16} />
        </a>
      </div>
    </div>
  );
};
