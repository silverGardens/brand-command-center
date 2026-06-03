import { useState, useEffect } from 'react';
import { getAnalytics } from '../lib/n8n';
import Spinner from '../components/ui/Spinner';

function StatCard({ label, value, note }) {
  return (
    <div className="bg-surface border border-border rounded-md p-5">
      <p className="text-muted text-xs font-semibold uppercase tracking-wide mb-2">{label}</p>
      <p className="text-primary text-3xl font-bold mb-1">{value ?? '—'}</p>
      {note && <p className="text-muted text-xs">{note}</p>}
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    const { data: result, error: err } = await getAnalytics();
    if (err) setError(err);
    else setData(result);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-primary text-2xl font-semibold">Analytics</h1>
        <p className="text-muted text-sm mt-1">Portfolio-wide performance across all sites</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Spinner size="lg" className="text-accent" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 py-32">
          <p className="text-status-red text-sm">{error}</p>
          <button onClick={load} className="text-accent text-sm hover:underline">Retry</button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Sites" value={data?.total_sites} note="In portfolio" />
          <StatCard label="Active Sites" value={data?.active_sites} note="Currently live" />
          <StatCard label="Total Posts" value={data?.total_posts} note="Published" />
          <StatCard label="Total Subscribers" value={data?.total_subscribers} note="Across all sites" />
        </div>
      )}
    </div>
  );
}
