import { useState } from 'react';
import Spinner from '../ui/Spinner';

const inputCls = "w-full bg-elevated border border-border rounded-md px-3 py-2 text-primary text-xs focus:outline-none focus:border-accent";

export default function SeoPanel({ siteId, postId, content, seo, onChange, onAnalyze }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-elevated hover:bg-border transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">SEO</span>
          {seo.score !== null && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
              seo.score >= 70 ? 'bg-status-green/20 text-status-green' :
              seo.score >= 40 ? 'bg-yellow-400/20 text-yellow-400' :
              'bg-status-red/20 text-status-red'
            }`}>
              {seo.score}
            </span>
          )}
        </div>
        <span className="text-muted text-xs">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="p-4 flex flex-col gap-4 border-t border-border">
          <div>
            <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">Focus Keyword</label>
            <input
              className={inputCls}
              value={seo.focusKeyword}
              onChange={e => onChange('focusKeyword', e.target.value)}
              placeholder="e.g. pickleball tips for beginners"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">
              Meta Title
              <span className={`ml-2 font-normal ${seo.metaTitle.length > 60 ? 'text-status-red' : 'text-muted'}`}>
                {seo.metaTitle.length}/60
              </span>
            </label>
            <input
              className={inputCls}
              value={seo.metaTitle}
              onChange={e => onChange('metaTitle', e.target.value)}
              placeholder="Page title for search engines..."
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">
              Meta Description
              <span className={`ml-2 font-normal ${seo.metaDescription.length > 160 ? 'text-status-red' : 'text-muted'}`}>
                {seo.metaDescription.length}/160
              </span>
            </label>
            <textarea
              className={inputCls + " resize-none"}
              rows={3}
              value={seo.metaDescription}
              onChange={e => onChange('metaDescription', e.target.value)}
              placeholder="Search result snippet..."
            />
          </div>

          <button
            onClick={onAnalyze}
            disabled={seo.analyzing || !seo.focusKeyword}
            className="w-full bg-elevated hover:bg-border border border-border rounded-md py-2 text-xs font-medium text-primary flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {seo.analyzing && <Spinner />}
            {seo.analyzing ? 'Analyzing...' : 'Analyze SEO'}
          </button>

          {seo.score !== null && !seo.analyzing && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted uppercase tracking-wide">Score</span>
                <span className={`text-sm font-bold ${
                  seo.score >= 70 ? 'text-status-green' :
                  seo.score >= 40 ? 'text-yellow-400' :
                  'text-status-red'
                }`}>{seo.score}/100</span>
              </div>
              {seo.issues.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  {seo.issues.map((issue, i) => (
                    <li key={i} className="text-xs text-muted flex items-start gap-1.5">
                      <span className="text-status-red mt-0.5 flex-shrink-0">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              )}
              {seo.issues.length === 0 && (
                <p className="text-xs text-status-green">No issues found.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
