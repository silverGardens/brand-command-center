import { useNavigate } from 'react-router-dom';
import StatusBadge from '../ui/StatusBadge';

export default function SiteCard({ site }) {
  const navigate = useNavigate();

  const formattedDate = site.created_at
    ? new Date(site.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <div className="bg-surface border border-border rounded-md p-6 flex flex-col gap-4 hover:border-accent/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-primary font-semibold text-base mb-1">{site.name}</h2>
          {site.domain ? (
            <a href={`https://${site.domain}`} target="_blank" rel="noopener noreferrer"
              className="text-muted text-xs hover:text-accent transition-colors">
              {site.domain} ↗
            </a>
          ) : (
            <span className="text-muted text-xs">{site.slug}.netlify.app</span>
          )}
        </div>
        <StatusBadge status={site.status ?? 'inactive'} />
      </div>

      {site.tagline && (
        <p className="text-muted text-sm line-clamp-2">{site.tagline}</p>
      )}

      <div className="mt-auto pt-2 flex items-center justify-between border-t border-border">
        <span className="text-muted text-xs">Created {formattedDate}</span>
        <button
          onClick={() => navigate(`/site/${site.id}`)}
          className="text-accent hover:text-white text-xs font-medium transition-colors"
        >
          Manage Site →
        </button>
      </div>
    </div>
  );
}
