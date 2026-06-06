import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getRevenueSummary, getPurchases } from '../lib/n8n';
import { useToast } from '../hooks/useToast';
import Spinner from '../components/ui/Spinner';

const PERIODS = ['today', 'month', 'all'];
const PERIOD_LABELS = { today: 'Today', month: 'This Month', all: 'All Time' };

function StatCard({ label, value, loading }) {
  return (
    <div className="bg-surface border border-border rounded-md p-5">
      <p className="text-muted text-xs uppercase tracking-wide mb-1">{label}</p>
      {loading ? <div className="h-8 w-24 bg-elevated rounded animate-pulse" /> : (
        <p className="text-primary text-2xl font-semibold">{value ?? '—'}</p>
      )}
    </div>
  );
}

export default function BrandFinance() {
  const { brandId } = useParams();
  const { showToast } = useToast();
  const [period, setPeriod] = useState('month');
  const [summary, setSummary] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    async function loadPurchases() {
      setLoading(true);
      const { data, error } = await getPurchases(brandId, 'all');
      if (error) showToast(error, 'error');
      else setPurchases(data?.purchases ?? []);
      setLoading(false);
    }
    loadPurchases();
  }, [brandId]);

  useEffect(() => {
    async function loadSummary() {
      setSummaryLoading(true);
      const { data } = await getRevenueSummary(brandId, period);
      if (data) setSummary(data);
      setSummaryLoading(false);
    }
    loadSummary();
  }, [brandId, period]);

  const fmt = n => n != null ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-primary text-2xl font-semibold">Finance</h1>
        <div className="flex items-center gap-1 bg-elevated border border-border rounded-md p-1">
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs rounded transition-colors ${period === p ? 'bg-accent text-white' : 'text-muted hover:text-primary'}`}>
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Gross Revenue" value={fmt(summary?.gross_revenue)} loading={summaryLoading} />
        <StatCard label="Total Orders" value={summary?.total_orders} loading={summaryLoading} />
        <StatCard label="Refunds" value={fmt(summary?.refunds)} loading={summaryLoading} />
      </div>

      <div>
        <h2 className="text-primary text-sm font-semibold mb-3">Purchase History</h2>
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" className="text-accent" /></div>
        ) : purchases.length === 0 ? (
          <div className="bg-surface border border-border rounded-md p-10 text-center">
            <p className="text-muted text-sm">No purchases yet.</p>
            <p className="text-muted text-xs mt-2">Connect Stripe to start tracking revenue automatically.</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Customer</th>
                  <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Product</th>
                  <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Amount</th>
                  <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p, i) => (
                  <tr key={p.id ?? i} className="border-b border-border last:border-0 hover:bg-elevated transition-colors">
                    <td className="px-5 py-3 text-primary text-sm">{p.subscriber_id ?? '—'}</td>
                    <td className="px-5 py-3 text-muted text-sm">{p.product_id ?? '—'}</td>
                    <td className="px-5 py-3 text-primary text-sm">{fmt(p.amount)}</td>
                    <td className="px-5 py-3 text-muted text-sm">{p.purchased_at ? new Date(p.purchased_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
