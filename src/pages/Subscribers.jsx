import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSubscribers } from '../lib/n8n';
import { useToast } from '../hooks/useToast';
import StatusBadge from '../components/ui/StatusBadge';
import Spinner from '../components/ui/Spinner';

function StatCard({ label, value }) {
  return (
    <div className="bg-surface border border-border rounded-md p-5">
      <p className="text-muted text-xs uppercase tracking-wide mb-1">{label}</p>
      <p className="text-primary text-2xl font-semibold">{value ?? '—'}</p>
    </div>
  );
}

function toCSV(subscribers) {
  const headers = ['email', 'first_name', 'source', 'status', 'subscribed_at'];
  const rows = subscribers.map(s =>
    headers.map(h => JSON.stringify(s[h] ?? '')).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

export default function Subscribers() {
  const { siteId } = useParams();
  const { showToast } = useToast();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await getSubscribers(siteId);
      if (error) { showToast(error, 'error'); setLoading(false); return; }
      setSubscribers(data?.subscribers ?? []);
      setLoading(false);
    }
    load();
  }, [siteId]);

  function exportCSV() {
    const csv = toCSV(subscribers);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `subscribers-${siteId}-${date}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const active = subscribers.filter(s => s.status === 'active').length;
  const unsub = subscribers.filter(s => s.status === 'unsubscribed').length;
  const thisMonth = subscribers.filter(s => {
    if (!s.subscribed_at) return false;
    const d = new Date(s.subscribed_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-primary text-2xl font-semibold">Subscribers</h1>
        {subscribers.length > 0 && (
          <button onClick={exportCSV}
            className="border border-border rounded-md px-4 py-2 text-sm text-muted hover:text-primary hover:border-accent transition-colors">
            Export CSV ↓
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total" value={subscribers.length} />
        <StatCard label="Active" value={active} />
        <StatCard label="Unsubscribed" value={unsub} />
        <StatCard label="This Month" value={thisMonth} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" className="text-accent" /></div>
      ) : subscribers.length === 0 ? (
        <div className="bg-surface border border-border rounded-md p-12 text-center">
          <p className="text-muted text-sm">No subscribers yet. Your niche site's newsletter form will send signups here.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Email', 'First Name', 'Source', 'Status', 'Subscribed'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-muted text-xs uppercase tracking-wide font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub, i) => (
                <tr key={sub.email + i} className="border-b border-border last:border-0 hover:bg-elevated transition-colors">
                  <td className="px-6 py-3 text-primary text-sm">{sub.email}</td>
                  <td className="px-6 py-3 text-muted text-sm">{sub.first_name || '—'}</td>
                  <td className="px-6 py-3 text-muted text-sm">{sub.source || '—'}</td>
                  <td className="px-6 py-3">
                    <StatusBadge
                      status={sub.status === 'active' ? 'active' : 'inactive'}
                      label={sub.status === 'active' ? 'Active' : 'Unsubscribed'}
                    />
                  </td>
                  <td className="px-6 py-3 text-muted text-sm">
                    {sub.subscribed_at
                      ? new Date(sub.subscribed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
