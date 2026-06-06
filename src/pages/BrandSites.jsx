import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBrandDetail, triggerDeploy, setTemplatePref, getPages, getTemplateRegistry } from '../lib/n8n';
import { useBrands } from '../context/BrandsContext';
import { useToast } from '../hooks/useToast';
import { TEMPLATES } from '../lib/templates';
import Spinner from '../components/ui/Spinner';
import StatusBadge from '../components/ui/StatusBadge';

export default function BrandSites() {
  const { brandId } = useParams();
  const { brands } = useBrands();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [detail, setDetail] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);

  const brand = brands.find(b => String(b.id) === brandId);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [detailRes, pagesRes] = await Promise.all([
        getBrandDetail(brandId),
        getPages(brandId),
      ]);
      if (!detailRes.error) setDetail(detailRes.data);
      if (!pagesRes.error) setPages(pagesRes.data?.pages ?? []);
      setLoading(false);
    }
    load();
  }, [brandId]);

  async function handleDeploy() {
    setDeploying(true);
    const { error } = await triggerDeploy(brandId);
    setDeploying(false);
    if (error) showToast(error, 'error');
    else showToast('Deploy triggered!', 'success');
  }

  const posts = detail?.posts ?? [];
  const site = detail?.site ?? {};

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" className="text-accent" /></div>;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      <h1 className="text-primary text-2xl font-semibold">Sites</h1>

      <section>
        <h2 className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Main Site</h2>
        <div className="bg-surface border border-border rounded-md p-5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-primary font-medium">{brand?.name ?? 'Site'}</p>
              <p className="text-muted text-xs">{site.domain ?? brand?.domain ?? '—'}</p>
              <div className="mt-2"><StatusBadge status={brand?.status ?? 'inactive'} /></div>
            </div>
            <div className="flex items-center gap-3">
              {site.domain && (
                <a href={`https://${site.domain}`} target="_blank" rel="noreferrer"
                  className="text-xs text-accent border border-accent/30 hover:border-accent px-3 py-1.5 rounded-md transition-colors">
                  Open Site ↗
                </a>
              )}
              <button
                onClick={handleDeploy}
                disabled={deploying}
                className="flex items-center gap-1.5 text-xs bg-elevated hover:bg-border border border-border px-3 py-1.5 rounded-md transition-colors disabled:opacity-60"
              >
                {deploying && <Spinner />}
                {deploying ? 'Deploying...' : 'Trigger Deploy'}
              </button>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-muted text-xs uppercase tracking-wide mb-2">Template</p>
            <div className="flex items-center gap-2 flex-wrap">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTemplatePref(brandId, t.id).then(r => r.error ? showToast(r.error, 'error') : showToast('Template saved', 'success'))}
                  className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                    (brand?.template_id ?? 'default') === t.id
                      ? 'bg-accent text-white border-accent'
                      : 'text-muted border-border hover:text-primary'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-primary text-sm font-semibold uppercase tracking-widest">Blog</h2>
          <button
            onClick={() => navigate(`/brand/${brandId}/sites/blog/new`)}
            className="bg-accent hover:bg-accent-hover text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
          >
            + New Post
          </button>
        </div>
        <div className="bg-surface border border-border rounded-md overflow-hidden">
          {posts.length === 0 ? (
            <p className="text-muted text-sm text-center py-8">No blog posts yet.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Title</th>
                  <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Status</th>
                  <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Date</th>
                  <th className="text-right px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {posts.slice(0, 10).map(post => (
                  <tr key={post.id} className="border-b border-border last:border-0 hover:bg-elevated transition-colors">
                    <td className="px-5 py-3 text-primary text-sm">{post.title || 'Untitled'}</td>
                    <td className="px-5 py-3"><StatusBadge status={post.status} /></td>
                    <td className="px-5 py-3 text-muted text-sm">{post.created_at ? new Date(post.created_at).toLocaleDateString() : '—'}</td>
                    <td className="px-5 py-3 text-right">
                      <Link to={`/brand/${brandId}/sites/blog/${post.id}`} className="text-xs text-accent hover:text-accent-hover transition-colors">Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-primary text-sm font-semibold uppercase tracking-widest">Landing Pages</h2>
          <Link
            to="/page-builder"
            className="bg-accent hover:bg-accent-hover text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
          >
            + Build Page
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {pages.length === 0 ? (
            <div className="col-span-3 bg-surface border border-border rounded-md p-8 text-center">
              <p className="text-muted text-sm mb-3">No landing pages yet.</p>
              <Link to="/page-builder" className="text-accent text-sm hover:underline">Build your first page →</Link>
            </div>
          ) : (
            pages.map(page => (
              <div key={page.slug} className="bg-surface border border-border rounded-md p-4">
                <p className="text-primary text-sm font-medium truncate">{page.slug}</p>
                <p className="text-muted text-xs mt-0.5">{page.template_id}</p>
                <Link
                  to={`/brand/${brandId}/sites/pages/${page.slug}/edit`}
                  className="text-accent text-xs mt-3 block hover:underline"
                >
                  Edit Content →
                </Link>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Product Pages</h2>
        <div className="bg-surface border border-border rounded-md p-6 text-center">
          <p className="text-muted text-sm">Product pages are created automatically when products exist.</p>
          <Link to={`/brand/${brandId}/products`} className="text-accent text-xs mt-2 block hover:underline">Go to Products →</Link>
        </div>
      </section>
    </div>
  );
}
