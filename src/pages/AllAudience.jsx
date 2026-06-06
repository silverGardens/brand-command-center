import { useState, useEffect } from 'react';
import { useBrands } from '../context/BrandsContext';
import { getSubscribers } from '../lib/n8n';
import Spinner from '../components/ui/Spinner';

export default function AllAudience() {
  const { brands } = useBrands();
  const [filter, setFilter] = useState('all');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const results = await Promise.all(
        brands.map(b => getSubscribers(b.id).then(r => ({ brand: b, subs: r.data?.subscribers ?? [] })))
      );
      setRows(results.flatMap(r => r.subs.map(s => ({ ...s, _brand: r.brand }))));
      setLoading(false);
    }
    if (brands.length) load();
    else setLoading(false);
  }, [brands]);

  const visible = filter === 'all' ? rows : rows.filter(r => String(r._brand.id) === filter);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-primary text-2xl font-semibold">Audience</h1>
        <div className="flex items-center gap-3">
          <p className="text-muted text-sm">{rows.length.toLocaleString()} total contacts</p>
          <BrandFilter brands={brands} value={filter} onChange={setFilter} />
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" className="text-accent" /></div>
      ) : visible.length === 0 ? (
        <p className="text-muted text-center py-20 text-sm">No contacts yet.</p>
      ) : (
        <div className="bg-surface border border-border rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Email</th>
                <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Brand</th>
                <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Type</th>
                <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((s, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-elevated">
                  <td className="px-5 py-3 text-primary text-sm">{s.email}</td>
                  <td className="px-5 py-3 text-muted text-sm">{s._brand.name}</td>
                  <td className="px-5 py-3 text-muted text-sm">{s.type ?? 'subscriber'}</td>
                  <td className="px-5 py-3 text-muted text-sm">{s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function BrandFilter({ brands, value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="bg-elevated border border-border text-primary text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-accent">
      <option value="all">All Brands</option>
      {brands.map(b => <option key={b.id} value={String(b.id)}>{b.name}</option>)}
    </select>
  );
}
