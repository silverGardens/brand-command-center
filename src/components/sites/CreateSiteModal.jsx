import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBrand } from '../../lib/n8n';
import { useBrands } from '../../context/BrandsContext';
import { useToast } from '../../hooks/useToast';
import ColorInput from '../ui/ColorInput';
import Spinner from '../ui/Spinner';

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function CreateSiteModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { refreshBrands } = useBrands();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [existingBrand, setExistingBrand] = useState(null);
  const [form, setForm] = useState({
    name: '', slug: '', niche: '', tagline: '',
    primaryColor: '#2563EB', secondaryColor: '#1C2128',
  });

  useEffect(() => {
    if (form.name) {
      setForm(f => ({ ...f, slug: slugify(f.name) }));
    }
  }, [form.name]);

  useEffect(() => {
    if (!isOpen) {
      setExistingBrand(null);
      setForm({ name: '', slug: '', niche: '', tagline: '', primaryColor: '#2563EB', secondaryColor: '#1C2128' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await createBrand(form);
    setLoading(false);
    if (error) {
      showToast(error, 'error');
      return;
    }
    if (data?.exists) {
      setExistingBrand(data.site ?? data.brand);
      return;
    }
    await refreshBrands();
    showToast('Brand created! Check the sidebar.', 'success');
    onClose();
    const newId = data?.site?.id ?? data?.brand?.id;
    if (newId) navigate(`/brand/${newId}`);
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-elevated border border-border rounded-md max-w-lg w-full p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-primary text-xl leading-none">&times;</button>
        <h2 className="text-primary text-xl font-semibold mb-6">Create New Brand</h2>

        {existingBrand ? (
          <div className="flex flex-col gap-5">
            <div className="bg-surface border border-border rounded-md p-4">
              <p className="text-primary text-sm font-medium mb-1">A brand with this slug already exists</p>
              <p className="text-muted text-sm">
                <span className="text-primary font-medium">{existingBrand.name}</span>
                {existingBrand.domain && <span className="ml-2 text-muted">— {existingBrand.domain}</span>}
              </p>
            </div>
            <p className="text-muted text-sm">Do you want to go to this brand and modify it instead?</p>
            <div className="flex gap-3">
              <button onClick={onClose}
                className="flex-1 bg-elevated hover:bg-border border border-border rounded-md py-2.5 text-sm text-primary transition-colors">
                Cancel
              </button>
              <button onClick={() => { onClose(); navigate(`/brand/${existingBrand.id}`); }}
                className="flex-1 bg-accent hover:bg-accent-hover text-white rounded-md py-2.5 font-medium text-sm transition-colors">
                Go to Brand →
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">Brand Name *</label>
              <input required value={form.name} onChange={e => set('name', e.target.value)}
                className="w-full bg-surface border border-border rounded-md px-3 py-2.5 text-primary text-sm placeholder-muted focus:outline-none focus:border-accent"
                placeholder="My Awesome Brand" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">Slug *</label>
              <input required value={form.slug} onChange={e => set('slug', slugify(e.target.value))}
                className="w-full bg-surface border border-border rounded-md px-3 py-2.5 text-primary text-sm placeholder-muted focus:outline-none focus:border-accent font-mono"
                placeholder="my-awesome-brand" />
              {form.slug && <p className="text-muted text-xs mt-1">brand-url: {form.slug}.netlify.app</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">Niche / Topic</label>
              <input value={form.niche} onChange={e => set('niche', e.target.value)}
                className="w-full bg-surface border border-border rounded-md px-3 py-2.5 text-primary text-sm placeholder-muted focus:outline-none focus:border-accent"
                placeholder="e.g. AI Productivity, Pickleball" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">Tagline</label>
              <input value={form.tagline} onChange={e => set('tagline', e.target.value)}
                className="w-full bg-surface border border-border rounded-md px-3 py-2.5 text-primary text-sm placeholder-muted focus:outline-none focus:border-accent"
                placeholder="One-line description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ColorInput label="Primary Color" value={form.primaryColor} onChange={v => set('primaryColor', v)} />
              <ColorInput label="Secondary Color" value={form.secondaryColor} onChange={v => set('secondaryColor', v)} />
            </div>
            <button type="submit" disabled={loading}
              className="mt-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white rounded-md py-2.5 font-medium text-sm transition-colors flex items-center justify-center gap-2">
              {loading && <Spinner />}
              {loading ? 'Creating...' : 'Create Brand'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
