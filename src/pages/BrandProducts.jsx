import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProducts, saveProduct } from '../lib/n8n';
import { normalizeProduct } from '../lib/normalize';
import { useToast } from '../hooks/useToast';
import Spinner from '../components/ui/Spinner';

const TYPES = ['digital', 'course', 'membership', 'physical'];

function ProductModal({ product, onSave, onClose }) {
  const [form, setForm] = useState({
    name: product?.name ?? '',
    type: product?.type ?? 'digital',
    price: product?.price?.toString() ?? '',
    description: product?.description ?? '',
  });
  const [saving, setSaving] = useState(false);

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));
  const inputCls = "w-full bg-elevated border border-border rounded-md px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-accent";

  async function handleSave() {
    setSaving(true);
    await onSave({ ...product, ...form, price: parseFloat(form.price) || 0 });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-surface border border-border rounded-lg p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-primary font-semibold mb-4">{product?.id ? 'Edit Product' : 'New Product'}</h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-muted uppercase tracking-wide block mb-1">Name</label>
            <input className={inputCls} value={form.name} onChange={set('name')} placeholder="Product name" />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted uppercase tracking-wide block mb-1">Type</label>
              <select className={inputCls} value={form.type} onChange={set('type')}>
                {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted uppercase tracking-wide block mb-1">Price ($)</label>
              <input className={inputCls} type="number" min="0" step="0.01" value={form.price} onChange={set('price')} placeholder="0.00" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wide block mb-1">Description</label>
            <textarea className={`${inputCls} resize-y`} rows={3} value={form.description} onChange={set('description')} />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted hover:text-primary transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.name.trim()}
            className="bg-accent hover:bg-accent-hover disabled:opacity-60 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
            {saving && <Spinner />}{saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BrandProducts() {
  const { brandId } = useParams();
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  async function load() {
    setLoading(true);
    const { data, error } = await getProducts(brandId);
    if (error) showToast(error, 'error');
    else setProducts((data?.products ?? []).map(normalizeProduct));
    setLoading(false);
  }

  useEffect(() => { load(); }, [brandId]);

  async function handleSave(productData) {
    const { error } = await saveProduct(brandId, productData);
    if (error) { showToast(error, 'error'); return; }
    setModal(null);
    showToast('Product saved!', 'success');
    load();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-primary text-2xl font-semibold">Products</h1>
        <button onClick={() => setModal({})}
          className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-md transition-colors">
          + New Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" className="text-accent" /></div>
      ) : products.length === 0 ? (
        <div className="bg-surface border border-border rounded-md p-12 text-center">
          <p className="text-muted text-sm mb-4">No products yet.</p>
          <button onClick={() => setModal({})} className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors">
            + Create First Product
          </button>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Product</th>
                <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Type</th>
                <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Price</th>
                <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Stripe</th>
                <th className="text-right px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-b border-border last:border-0 hover:bg-elevated transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-primary text-sm font-medium">{product.name}</p>
                    {product.description && <p className="text-muted text-xs mt-0.5 truncate max-w-xs">{product.description}</p>}
                  </td>
                  <td className="px-5 py-3 text-muted text-sm capitalize">{product.type}</td>
                  <td className="px-5 py-3 text-primary text-sm">${product.price.toFixed(2)}</td>
                  <td className="px-5 py-3 text-muted text-sm">{product.stripe_product_id ? '✓ Connected' : '—'}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => setModal(product)} className="text-xs text-accent hover:text-accent-hover transition-colors">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && <ProductModal product={modal} onSave={handleSave} onClose={() => setModal(null)} />}
    </div>
  );
}
