import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPages, getTemplateRegistry, savePage } from '../lib/n8n';
import { generatePreviewHTML } from '../lib/preview';
import { useSites } from '../context/SitesContext';
import { useToast } from '../hooks/useToast';
import Spinner from '../components/ui/Spinner';

export default function PageEditor() {
  const { siteId, pageSlug } = useParams();
  const { sites } = useSites();
  const { showToast } = useToast();
  const iframeRef = useRef(null);
  const blobUrlRef = useRef(null);

  const [page, setPage] = useState(null);
  const [schema, setSchema] = useState([]);
  const [fieldValues, setFieldValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  const brand = sites.find(s => String(s.id) === String(siteId)) ?? {};

  useEffect(() => {
    async function load() {
      const [pagesRes, tplRes] = await Promise.all([
        getPages(siteId),
        getTemplateRegistry(),
      ]);
      const foundPage = (pagesRes.data?.pages ?? []).find(p => p.slug === pageSlug);
      if (foundPage) {
        setPage(foundPage);
        setFieldValues(foundPage.field_values ?? {});
        const tpl = (tplRes.data?.templates ?? []).find(t => t.id === foundPage.template_id);
        if (tpl?.section_schema) {
          const parsed = typeof tpl.section_schema === 'string'
            ? JSON.parse(tpl.section_schema)
            : tpl.section_schema;
          setSchema(parsed);
          setExpandedSections(Object.fromEntries(parsed.map(s => [s.id, true])));
        }
      }
      setLoading(false);
    }
    load();
  }, [siteId, pageSlug]);

  const updatePreview = useCallback(() => {
    if (!iframeRef.current) return;
    const html = generatePreviewHTML(schema, fieldValues, brand);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    blobUrlRef.current = url;
    iframeRef.current.src = url;
  }, [schema, fieldValues, brand]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  function setField(id, val) {
    setFieldValues(fv => ({ ...fv, [id]: val }));
  }

  function toggleSection(sectionId) {
    setExpandedSections(s => ({ ...s, [sectionId]: !s[sectionId] }));
  }

  async function handleSave() {
    setSaving(true);
    const { error } = await savePage(siteId, {
      slug: pageSlug,
      template_id: page?.template_id,
      field_values: fieldValues,
    });
    setSaving(false);
    if (error) { showToast(error, 'error'); return; }
    showToast('Page saved and deployed!', 'success');
  }

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" className="text-accent" /></div>;
  if (!page) return (
    <div className="flex flex-col items-center gap-4 py-32">
      <p className="text-muted text-sm">Page not found.</p>
      <Link to={`/site/${siteId}/pages`} className="text-accent text-sm">← Back to Pages</Link>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden -m-6">
      <div className="w-80 flex-shrink-0 bg-surface border-r border-border flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div>
            <Link to={`/site/${siteId}/pages`} className="text-muted text-xs hover:text-accent transition-colors">← Pages</Link>
            <p className="text-primary text-sm font-semibold mt-0.5">/{pageSlug}</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-medium px-3 py-1.5 rounded-md disabled:opacity-60 transition-colors"
          >
            {saving && <Spinner />}
            {saving ? 'Saving...' : 'Save & Deploy'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {schema.length === 0 ? (
            <p className="text-muted text-xs text-center py-8">No editable fields for this template.</p>
          ) : (
            schema.map(section => (
              <div key={section.id} className="mb-1">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-elevated transition-colors"
                >
                  <span className="text-xs font-semibold text-muted uppercase tracking-wide">{section.label}</span>
                  <span className="text-muted text-xs">{expandedSections[section.id] ? '▴' : '▾'}</span>
                </button>
                {expandedSections[section.id] && (
                  <div className="px-4 pb-3 flex flex-col gap-3">
                    {(section.fields ?? []).map(field => (
                      <div key={field.id}>
                        <label className="text-xs text-muted block mb-1">{field.label}</label>
                        {field.type === 'textarea' ? (
                          <textarea
                            value={fieldValues[field.id] ?? ''}
                            onChange={e => setField(field.id, e.target.value)}
                            rows={3}
                            placeholder={field.placeholder ?? ''}
                            className="w-full bg-elevated border border-border rounded-md px-2.5 py-1.5 text-primary text-xs resize-none focus:outline-none focus:border-accent"
                          />
                        ) : (
                          <input
                            type={field.type === 'link_url' || field.type === 'image_url' ? 'url' : 'text'}
                            value={fieldValues[field.id] ?? ''}
                            onChange={e => setField(field.id, e.target.value)}
                            placeholder={field.placeholder ?? (field.type === 'link_url' || field.type === 'image_url' ? 'https://...' : '')}
                            className="w-full bg-elevated border border-border rounded-md px-2.5 py-1.5 text-primary text-xs focus:outline-none focus:border-accent"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 bg-elevated overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-border bg-surface">
          <p className="text-muted text-xs">Live Preview — updates as you type</p>
        </div>
        <iframe
          ref={iframeRef}
          title="Page preview"
          className="flex-1 w-full border-0"
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}
