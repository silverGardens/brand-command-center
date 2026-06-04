import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSiteDetail, updateBrand } from '../lib/n8n';
import { getTemplate } from '../lib/templates';
import { useToast } from '../hooks/useToast';
import ColorInput from '../components/ui/ColorInput';
import Spinner from '../components/ui/Spinner';

const FONTS = ['Inter', 'Merriweather', 'Playfair Display', 'Roboto', 'Montserrat', 'Lato', 'Oswald'];

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h3 className="text-xs font-semibold text-muted uppercase tracking-widest mb-4 pb-2 border-b border-border">{title}</h3>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-elevated border border-border rounded-md px-3 py-2.5 text-primary text-sm placeholder-muted focus:outline-none focus:border-accent";

export default function TemplateBrandSettings() {
  const { templateId } = useParams();
  const { showToast } = useToast();
  const template = getTemplate(templateId);
  const n8nKey = `template-${templateId}`;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    siteName: '{{siteName}}', tagline: '{{tagline}}', description: '{{description}}',
    primaryColor: '#2563EB', secondaryColor: '#1C2128', accentColor: '#E6EDF3',
    backgroundColor: '#0F1117', surfaceColor: '#1E293B', textColor: '#E6EDF3', mutedColor: '#94A3B8',
    fontHeading: 'Inter', fontBody: 'Inter',
    logoUrl: '', faviconUrl: '',
    contactEmail: '{{contactEmail}}',
    twitterUrl: '', instagramUrl: '', youtubeUrl: '',
  });

  useEffect(() => {
    async function load() {
      const { data } = await getSiteDetail(n8nKey);
      if (data?.brand_config) {
        const bc = data.brand_config;
        setForm(f => ({
          ...f,
          siteName: bc.site_name ?? f.siteName,
          tagline: bc.tagline ?? f.tagline,
          description: bc.description ?? f.description,
          primaryColor: bc.primary_color ?? f.primaryColor,
          secondaryColor: bc.secondary_color ?? f.secondaryColor,
          accentColor: bc.accent_color ?? f.accentColor,
          backgroundColor: bc.background_color ?? f.backgroundColor,
          surfaceColor: bc.surface_color ?? f.surfaceColor,
          textColor: bc.text_color ?? f.textColor,
          mutedColor: bc.muted_color ?? f.mutedColor,
          contactEmail: bc.contact_email ?? f.contactEmail,
          fontHeading: bc.font_heading ?? f.fontHeading,
          fontBody: bc.font_body ?? f.fontBody,
          logoUrl: bc.logo_url ?? f.logoUrl,
          faviconUrl: bc.favicon_url ?? f.faviconUrl,
          twitterUrl: bc.twitter_url ?? f.twitterUrl,
          instagramUrl: bc.instagram_url ?? f.instagramUrl,
          youtubeUrl: bc.youtube_url ?? f.youtubeUrl,
        }));
      }
      setLoading(false);
    }
    load();
  }, [n8nKey]);

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  async function handleSave() {
    setSaving(true);
    const { error } = await updateBrand(n8nKey, form);
    setSaving(false);
    if (error) showToast(error, 'error');
    else showToast('Template defaults saved!', 'success');
  }

  if (loading) return <div className="flex items-center justify-center py-32"><Spinner size="lg" className="text-accent" /></div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-primary text-2xl font-semibold">Template Defaults</h1>
        <button onClick={handleSave} disabled={saving}
          className="bg-accent hover:bg-accent-hover disabled:opacity-60 text-white px-5 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
          {saving && <Spinner />}
          {saving ? 'Saving...' : 'Save Defaults'}
        </button>
      </div>
      <p className="text-muted text-sm mb-8">
        <span className="text-primary font-medium">{template.name}</span> — {template.description}
        <span className="ml-2 text-xs bg-elevated border border-border px-2 py-0.5 rounded">Template</span>
      </p>
      <p className="text-xs text-muted bg-elevated border border-border rounded-md px-4 py-3 mb-8">
        Fields like <code className="text-accent">{"{{siteName}}"}</code> are template variables — each site that uses this template
        substitutes its own value. Color and font defaults here are inherited by new sites unless overridden in Brand Settings.
      </p>

      <div className="flex gap-8">
        <div className="flex-1 min-w-0">
          <Section title="Identity Variables">
            <Field label="Site Name variable">
              <input className={inputCls} value={form.siteName} onChange={e => set('siteName', e.target.value)} placeholder="{{siteName}}" />
            </Field>
            <Field label="Tagline variable">
              <input className={inputCls} value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="{{tagline}}" />
            </Field>
            <Field label="Description variable">
              <textarea className={inputCls + " resize-y min-h-[80px]"} value={form.description} onChange={e => set('description', e.target.value)} placeholder="{{description}}" rows={3} />
            </Field>
            <Field label="Contact Email variable">
              <input className={inputCls} value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} placeholder="{{contactEmail}}" />
            </Field>
          </Section>

          <Section title="Default Colors">
            <p className="text-xs text-muted -mt-2">These are the color defaults new sites inherit. Override per-site in Brand Settings.</p>
            <div className="grid grid-cols-2 gap-4">
              <ColorInput label="Brand (Header + Buttons)" value={form.primaryColor} onChange={v => set('primaryColor', v)} />
              <ColorInput label="Secondary Accent" value={form.secondaryColor} onChange={v => set('secondaryColor', v)} />
              <ColorInput label="Highlight / Accent" value={form.accentColor} onChange={v => set('accentColor', v)} />
              <ColorInput label="Page Background" value={form.backgroundColor} onChange={v => set('backgroundColor', v)} />
              <ColorInput label="Card / Panel" value={form.surfaceColor} onChange={v => set('surfaceColor', v)} />
              <ColorInput label="Body Text" value={form.textColor} onChange={v => set('textColor', v)} />
              <ColorInput label="Muted / Subtle Text" value={form.mutedColor} onChange={v => set('mutedColor', v)} />
            </div>
          </Section>

          <Section title="Default Typography">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Heading Font">
                <select className={inputCls} value={form.fontHeading} onChange={e => set('fontHeading', e.target.value)}>
                  {FONTS.map(f => <option key={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Body Font">
                <select className={inputCls} value={form.fontBody} onChange={e => set('fontBody', e.target.value)}>
                  {FONTS.map(f => <option key={f}>{f}</option>)}
                </select>
              </Field>
            </div>
          </Section>
        </div>

        <div className="w-72 flex-shrink-0">
          <div className="sticky top-4">
            <p className="text-xs font-medium text-muted uppercase tracking-wide mb-3">Preview</p>
            <div className="border border-border rounded-md overflow-hidden">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-elevated border-b border-border">
                <span className="w-2.5 h-2.5 rounded-full bg-status-red/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-status-yellow/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-status-green/60" />
                <span className="flex-1 bg-surface rounded text-center text-muted text-xs py-0.5 px-2 ml-2">your-site.netlify.app</span>
              </div>
              <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: form.primaryColor }}>
                <span className="text-white font-semibold text-sm" style={{ fontFamily: form.fontHeading }}>Your Site</span>
                <div className="flex gap-3">
                  {['Blog', 'About'].map(l => (
                    <span key={l} className="text-xs" style={{ color: 'rgba(255,255,255,0.75)', fontFamily: form.fontBody }}>{l}</span>
                  ))}
                </div>
              </div>
              <div className="px-4 py-5" style={{ backgroundColor: form.backgroundColor }}>
                <p className="text-sm font-bold mb-1" style={{ color: form.textColor, fontFamily: form.fontHeading }}>Your tagline here</p>
                <p className="text-xs mb-3" style={{ color: form.mutedColor, fontFamily: form.fontBody }}>Site description...</p>
                <span className="inline-block text-xs font-semibold px-3 py-1 rounded text-white" style={{ backgroundColor: form.primaryColor, fontFamily: form.fontBody }}>
                  Subscribe Free
                </span>
              </div>
              <div className="px-4 pb-4" style={{ backgroundColor: form.backgroundColor }}>
                <div className="rounded-md p-3 border" style={{ backgroundColor: form.surfaceColor, borderColor: 'rgba(148,163,184,0.12)' }}>
                  <div className="h-2 rounded w-3/4 mb-2" style={{ backgroundColor: form.textColor, opacity: 0.6 }} />
                  <div className="h-1.5 rounded w-full mb-1" style={{ backgroundColor: form.textColor, opacity: 0.25 }} />
                  <div className="h-1.5 rounded w-2/3" style={{ backgroundColor: form.textColor, opacity: 0.25 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
