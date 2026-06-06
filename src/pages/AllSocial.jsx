import { useState, useEffect } from 'react';
import { useBrands } from '../context/BrandsContext';
import { getSocialPosts } from '../lib/n8n';
import StatusBadge from '../components/ui/StatusBadge';
import Spinner from '../components/ui/Spinner';

export default function AllSocial() {
  const { brands } = useBrands();
  const [filter, setFilter] = useState('all');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const results = await Promise.all(
        brands.map(b => getSocialPosts(b.id).then(r => ({ brand: b, posts: r.data?.posts ?? [] })))
      );
      setRows(results.flatMap(r => r.posts.map(p => ({ ...p, _brand: r.brand }))));
      setLoading(false);
    }
    if (brands.length) load();
    else setLoading(false);
  }, [brands]);

  const visible = filter === 'all' ? rows : rows.filter(r => String(r._brand.id) === filter);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-primary text-2xl font-semibold">Social</h1>
        <BrandFilter brands={brands} value={filter} onChange={setFilter} />
      </div>
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" className="text-accent" /></div>
      ) : visible.length === 0 ? (
        <p className="text-muted text-center py-20 text-sm">No social posts yet.</p>
      ) : (
        <div className="bg-surface border border-border rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Content</th>
                <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Brand</th>
                <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Platform</th>
                <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Status</th>
                <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Scheduled</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-elevated">
                  <td className="px-5 py-3 text-primary text-sm max-w-xs truncate">{p.content ?? '—'}</td>
                  <td className="px-5 py-3 text-muted text-sm">{p._brand.name}</td>
                  <td className="px-5 py-3 text-muted text-sm capitalize">{p.platform ?? '—'}</td>
                  <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3 text-muted text-sm">{p.scheduled_at ? new Date(p.scheduled_at).toLocaleDateString() : '—'}</td>
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
