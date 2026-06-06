import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBrandDetail, getAudienceMetrics, getRevenueSummary } from '../lib/n8n';
import { useToast } from '../hooks/useToast';
import Spinner from '../components/ui/Spinner';

const PERIODS = ['today', 'month', 'all'];
const PERIOD_LABELS = { today: 'Today', month: 'This Month', all: 'All Time' };

function StatCard({ label, value, loading }) {
  return (
    <div className="bg-surface border border-border rounded-md p-5">
      <p className="text-muted text-xs uppercase tracking-wide mb-1">{label}</p>
      {loading ? (
        <div className="h-8 w-20 bg-elevated rounded animate-pulse" />
      ) : (
        <p className="text-primary text-2xl font-semibold">{value ?? '—'}</p>
      )}
    </div>
  );
}

function PipelineBar({ label, stages, loading }) {
  return (
    <div className="bg-surface border border-border rounded-md p-4">
      <p className="text-muted text-xs uppercase tracking-wide mb-3">{label}</p>
      {loading ? (
        <div className="h-6 bg-elevated rounded animate-pulse" />
      ) : (
        <div className="flex items-center gap-3 flex-wrap">
          {stages.map(({ name, count }) => (
            <div key={name} className="flex items-center gap-1.5">
              <span className="text-primary text-sm font-medium">{count ?? 0}</span>
              <span className="text-muted text-xs">{name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BrandOverview() {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [period, setPeriod] = useState('month');
  const [detail, setDetail] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revenueLoading, setRevenueLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [detailRes, metricsRes] = await Promise.all([
        getBrandDetail(brandId),
        getAudienceMetrics(brandId),
      ]);
      if (detailRes.error) showToast(detailRes.error, 'error');
      else setDetail(detailRes.data);
      if (!metricsRes.error) setMetrics(metricsRes.data);
      setLoading(false);
    }
    load();
  }, [brandId]);

  useEffect(() => {
    async function loadRevenue() {
      setRevenueLoading(true);
      const { data } = await getRevenueSummary(brandId, period);
      if (data) setRevenue(data);
      setRevenueLoading(false);
    }
    loadRevenue();
  }, [brandId, period]);

  const posts = detail?.posts ?? [];
  const blogStages = [
    { name: 'Ideas', count: posts.filter(p => p.status === 'idea').length },
    { name: 'Researching', count: posts.filter(p => p.status === 'researching').length },
    { name: 'Drafting', count: posts.filter(p => p.status === 'draft').length },
    { name: 'In Review', count: posts.filter(p => p.status === 'in_review').length },
    { name: 'Published', count: posts.filter(p => p.status === 'published').length },
  ];

  const formatCurrency = (n) => n != null ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-primary text-2xl font-semibold">{detail?.site?.name ?? 'Overview'}</h1>
        <div className="flex items-center gap-1 bg-elevated border border-border rounded-md p-1">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs rounded transition-colors ${period === p ? 'bg-accent text-white' : 'text-muted hover:text-primary'}`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Leads" value={metrics?.leads} loading={loading} />
        <StatCard label="Subscribers" value={metrics?.subscribers} loading={loading} />
        <StatCard label="Customers" value={metrics?.customers} loading={loading} />
        <StatCard label="Revenue" value={formatCurrency(revenue?.gross_revenue)} loading={revenueLoading} />
      </div>

      <div className="mb-6">
        <h2 className="text-primary text-sm font-semibold mb-3">Content Pipeline</h2>
        <div className="flex flex-col gap-3">
          <PipelineBar label="Blog" stages={blogStages} loading={loading} />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-primary text-sm font-semibold mb-3">Quick Actions</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/brand/${brandId}/sites/blog/new`)}
            className="bg-elevated hover:bg-border border border-border rounded-md px-4 py-2.5 text-sm text-primary transition-colors"
          >
            + New Blog Post
          </button>
          <button
            onClick={() => navigate(`/brand/${brandId}/social`)}
            className="bg-elevated hover:bg-border border border-border rounded-md px-4 py-2.5 text-sm text-primary transition-colors"
          >
            + Schedule Social Post
          </button>
          <button
            onClick={() => navigate(`/brand/${brandId}/sites`)}
            className="bg-elevated hover:bg-border border border-border rounded-md px-4 py-2.5 text-sm text-primary transition-colors"
          >
            + New Landing Page
          </button>
          <button
            onClick={() => navigate(`/brand/${brandId}/audience`)}
            className="bg-elevated hover:bg-border border border-border rounded-md px-4 py-2.5 text-sm text-primary transition-colors"
          >
            + New Email Sequence
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-primary text-sm font-semibold mb-3">Upcoming Content</h2>
        <div className="bg-surface border border-border rounded-md p-6 text-center">
          <p className="text-muted text-sm">Scheduled content calendar coming soon.</p>
        </div>
      </div>
    </div>
  );
}
