import { useState, useEffect } from 'react';
import { useBrands } from '../context/BrandsContext';
import { getProducts } from '../lib/n8n';
import Spinner from '../components/ui/Spinner';

export default function AllProducts() {
  const { brands } = useBrands();
  const [filter, setFilter] = useState('all');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const results = await Promise.all(
        brands.map(b => getProducts(b.id).then(r => ({ brand: b, products: r.data?.products ?? [] })))
      );
      setRows(results.flatMap(r => r.products.map(p => ({ ...p, _brand: r.brand }))));
      setLoading(false);
    }
    if (brands.length) load();
    else setLoading(false);
  }, [brands]);

  const visible = filter === 'all' ? rows : rows.filter(r => String(r._brand.id) === filter);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-primary text-2xl font-semibold">Products</h1>
        <BrandFilter brands={brands} value={filter} onChange={setFilter} />
      </div>
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" className="text-accent" /></div>
      ) : visible.length === 0 ? (
        <p className="text-muted text-center py-20 text-sm">No products yet.</p>
      ) : (
        <div className="bg-surface border border-border rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Product</th>
                <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Brand</th>
                <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Price</th>
                <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Type</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(p => (
                <tr key={`${p._brand.id}-${p.id}`} className="border-b border-border last:border-0 hover:bg-elevated">
                  <td className="px-5 py-3 text-primary text-sm font-medium">{p.name}</td>
                  <td className="px-5 py-3 text-muted text-sm">{p._brand.name}</td>
                  <td className="px-5 py-3 text-muted text-sm">{p.price ? `$${Number(p.price).toFixed(2)}` : '—'}</td>
                  <td className="px-5 py-3 text-muted text-sm">{p.type ?? '—'}</td>
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
