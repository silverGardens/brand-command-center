import { useState, useEffect } from 'react';
import { useBrands } from '../context/BrandsContext';
import { getPurchases } from '../lib/n8n';
import Spinner from '../components/ui/Spinner';

export default function AllFinance() {
  const { brands } = useBrands();
  const [filter, setFilter] = useState('all');
  const [period, setPeriod] = useState('30d');
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({ revenue: 0, purchases: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const results = await Promise.all(
        brands.map(b => getPurchases(b.id, period).then(r => ({ brand: b, purchases: r.data?.purchases ?? [] })))
      );
      const all = results.flatMap(r => r.purchases.map(p => ({ ...p, _brand: r.brand })));
      setRows(all);
      setTotals({ revenue: all.reduce((s, p) => s + (Number(p.amount) || 0), 0), purchases: all.length });
      setLoading(false);
    }
    if (brands.length) load();
    else setLoading(false);
  }, [brands, period]);

  const visible = filter === 'all' ? rows : rows.filter(r => String(r._brand.id) === filter);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-primary text-2xl font-semibold">Finance</h1>
        <div className="flex items-center gap-2">
          <PeriodToggle value={period} onChange={setPeriod} />
          <BrandFilter brands={brands} value={filter} onChange={setFilter} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-surface border border-border rounded-md p-5">
          <p className="text-muted text-xs uppercase tracking-wide mb-1">Total Revenue</p>
          <p className="text-primary text-2xl font-semibold">${totals.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-surface border border-border rounded-md p-5">
          <p className="text-muted text-xs uppercase tracking-wide mb-1">Purchases</p>
          <p className="text-primary text-2xl font-semibold">{totals.purchases}</p>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" className="text-accent" /></div>
      ) : visible.length === 0 ? (
        <p className="text-muted text-center py-20 text-sm">No purchases in this period.</p>
      ) : (
        <div className="bg-surface border border-border rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Customer</th>
                <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Brand</th>
                <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Product</th>
                <th className="text-right px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Amount</th>
                <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-elevated">
                  <td className="px-5 py-3 text-primary text-sm">{p.customer_email ?? '—'}</td>
                  <td className="px-5 py-3 text-muted text-sm">{p._brand.name}</td>
                  <td className="px-5 py-3 text-muted text-sm">{p.product_name ?? '—'}</td>
                  <td className="px-5 py-3 text-primary text-sm text-right font-medium">${Number(p.amount || 0).toFixed(2)}</td>
                  <td className="px-5 py-3 text-muted text-sm">{p.purchased_at ? new Date(p.purchased_at).toLocaleDateString() : '—'}</td>
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

function PeriodToggle({ value, onChange }) {
  return (
    <div className="flex gap-1 bg-elevated border border-border rounded-md p-0.5">
      {['7d', '30d', '90d'].map(p => (
        <button key={p} onClick={() => onChange(p)}
          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${value === p ? 'bg-surface text-primary' : 'text-muted hover:text-primary'}`}>
          {p}
        </button>
      ))}
    </div>
  );
}
