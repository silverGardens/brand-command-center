import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPages, getTemplateRegistry, savePage, extractTemplate } from '../lib/n8n';
import { useToast } from '../hooks/useToast';
import Spinner from '../components/ui/Spinner';

const PAGE_TYPES = ['all', 'homepage', 'landing', 'thank-you', 'offer', 'about', 'contact'];

export default function SitePages() {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [pages, setPages] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [extracting, setExtracting] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [pagesRes, tplRes] = await Promise.all([
        getPages(brandId),
        getTemplateRegistry(),
      ]);
      if (!pagesRes.error) setPages(pagesRes.data?.pages ?? []);
      if (!tplRes.error) setTemplates(tplRes.data?.templates ?? []);
      setLoading(false);
    }
    load();
  }, [brandId]);

  async function handleUseTemplate(template) {
    const slug = template.type === 'homepage' ? 'index' : template.id;
    const { error } = await savePage(brandId, {
      slug,
      template_id: template.id,
      field_values: {},
    });
    if (error) { showToast(error, 'error'); return; }
    showToast('Page created!', 'success');
    const { data } = await getPages(brandId);
    setPages(data?.pages ?? []);
  }

  async function handleExtract(pageSlug) {
    setExtracting(pageSlug);
    const { error } = await extractTemplate(brandId, pageSlug);
    setExtracting(null);
    if (error) { showToast(error, 'error'); return; }
    showToast('Template extracted and saved to library!', 'success');
    const { data } = await getTemplateRegistry();
    setTemplates(data?.templates ?? []);
  }

  const filteredTemplates = typeFilter === 'all'
    ? templates
    : templates.filter(t => t.type === typeFilter);

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" className="text-accent" /></div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-primary text-2xl font-semibold mb-1">Pages</h1>
          <p className="text-muted text-sm">Manage page layouts and content for this site.</p>
        </div>
      </div>

      {pages.length > 0 && (
        <div className="bg-surface border border-border rounded-md mb-8">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-primary font-semibold text-sm">Active Pages</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-muted text-xs uppercase tracking-wide font-medium">Slug</th>
                <th className="text-left px-6 py-3 text-muted text-xs uppercase tracking-wide font-medium">Template</th>
                <th className="text-left px-6 py-3 text-muted text-xs uppercase tracking-wide font-medium">Updated</th>
                <th className="text-right px-6 py-3 text-muted text-xs uppercase tracking-wide font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map(page => (
                <tr key={page.slug} className="border-b border-border last:border-0 hover:bg-elevated transition-colors">
                  <td className="px-6 py-3 text-primary text-sm font-mono">/{page.slug}</td>
                  <td className="px-6 py-3 text-muted text-sm">{page.template_name ?? page.template_id}</td>
                  <td className="px-6 py-3 text-muted text-sm">
                    {page.updated_at ? new Date(page.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center gap-3 justify-end">
                      <button
                        onClick={() => navigate(`/brand/${brandId}/sites/pages/${page.slug}/edit`)}
                        className="text-xs text-accent hover:text-accent-hover transition-colors"
                      >
                        Edit Content
                      </button>
                      <button
                        onClick={() => handleExtract(page.slug)}
                        disabled={extracting === page.slug}
                        className="text-xs text-muted hover:text-primary transition-colors disabled:opacity-40 flex items-center gap-1"
                      >
                        {extracting === page.slug && <Spinner />}
                        Convert to Template
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-primary font-semibold text-sm">Template Library</h2>
          <div className="flex items-center gap-1 flex-wrap">
            {PAGE_TYPES.map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  typeFilter === t
                    ? 'bg-accent text-white border-accent'
                    : 'text-muted border-border hover:text-primary'
                }`}
              >
                {t === 'all' ? 'All' : t.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="text-center py-16 text-muted text-sm">
            No templates yet.{' '}
            <button onClick={() => navigate('/page-builder')} className="text-accent hover:underline">
              Build one with AI →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(tpl => (
              <div key={tpl.id} className="bg-surface border border-border rounded-md overflow-hidden hover:border-accent/40 transition-colors">
                {tpl.preview_image_url ? (
                  <img src={tpl.preview_image_url} alt={tpl.name} className="w-full h-40 object-cover object-top border-b border-border" />
                ) : (
                  <div className="w-full h-40 bg-elevated border-b border-border flex items-center justify-center text-muted text-xs">
                    No preview
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <p className="text-primary text-sm font-medium">{tpl.name}</p>
                    <span className="text-xs bg-elevated border border-border px-2 py-0.5 rounded text-muted flex-shrink-0">
                      {tpl.type}
                    </span>
                  </div>
                  <button
                    onClick={() => handleUseTemplate(tpl)}
                    className="w-full bg-accent hover:bg-accent-hover text-white text-xs font-medium py-2 rounded-md transition-colors"
                  >
                    Use This Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
