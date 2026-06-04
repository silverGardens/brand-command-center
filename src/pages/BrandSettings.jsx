import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSiteDetail, updateBrand } from '../lib/n8n';
import { useSites } from '../context/SitesContext';
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

export default function BrandSettings() {
  const { siteId } = useParams();
  const { sites } = useSites();
  const { showToast } = useToast();

  // umbra_sites has no numeric id column — slug is the unique key n8n looks up by.
  // siteId from the URL is the n8n auto-row-number; resolve the actual slug here.
  const currentSite = sites.find(s => String(s.id) === siteId);
  const siteSlug = currentSite?.slug ?? siteId;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    siteName: '', tagline: '', description: '',
    primaryColor: '#2563EB', secondaryColor: '#1C2128', accentColor: '#E6EDF3',
    backgroundColor: '#0F1117', surfaceColor: '#1E293B', textColor: '#E6EDF3', mutedColor: '#94A3B8',
    fontHeading: 'Inter', fontBody: 'Inter',
    logoUrl: '', faviconUrl: '',
    contactEmail: '',
    twitterUrl: '', instagramUrl: '', youtubeUrl: '',
  });

  useEffect(() => {
    if (!siteSlug) return;
    async function load() {
      const { data, error } = await getSiteDetail(siteSlug);
      if (error) { showToast(error, 'error'); setLoading(false); return; }
      const bc = data?.brand_config ?? {};
      const site = data?.site ?? {};
      setForm(f => ({
        ...f,
        siteName: site.name ?? f.siteName,
        tagline: bc.tagline ?? site.tagline ?? f.tagline,
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
      setLoading(false);
    }
    load();
  }, [siteSlug]);

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  async function handleSave() {
    setSaving(true);
    const { error } = await updateBrand(siteSlug, form);
    setSaving(false);
    if (error) showToast(error, 'error');
    else showToast('Brand settings saved!', 'success');
  }

  if (loading) return <div className="flex items-center justify-center py-32"><Spinner size="lg" className="text-accent" /></div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-primary text-2xl font-semibold">Brand Settings</h1>
        <button onClick={handleSave} disabled={saving}
          className="bg-accent hover:bg-accent-hover disabled:opacity-60 text-white px-5 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
          {saving && <Spinner />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Form */}
        <div className="flex-1 min-w-0">
          <Section title="Identity">
            <Field label="Site Name">
              <input className={inputCls} value={form.siteName} onChange={e => set('siteName', e.target.value)} placeholder="My Site" />
            </Field>
            <Field label="Tagline">
              <input className={inputCls} value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="One-line description" />
            </Field>
            <Field label="Description">
              <textarea className={inputCls + " resize-y min-h-[80px]"} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Longer description..." rows={3} />
            </Field>
          </Section>

          <Section title="Colors">
            <div className="grid grid-cols-2 gap-4">
              <ColorInput label="Primary" value={form.primaryColor} onChange={v => set('primaryColor', v)} />
              <ColorInput label="Secondary" value={form.secondaryColor} onChange={v => set('secondaryColor', v)} />
              <ColorInput label="Accent" value={form.accentColor} onChange={v => set('accentColor', v)} />
              <ColorInput label="Background" value={form.backgroundColor} onChange={v => set('backgroundColor', v)} />
              <ColorInput label="Surface" value={form.surfaceColor} onChange={v => set('surfaceColor', v)} />
              <ColorInput label="Text" value={form.textColor} onChange={v => set('textColor', v)} />
              <ColorInput label="Muted Text" value={form.mutedColor} onChange={v => set('mutedColor', v)} />
            </div>
          </Section>

          <Section title="Typography">
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

          <Section title="Media">
            <Field label="Logo URL">
              <input className={inputCls} value={form.logoUrl} onChange={e => set('logoUrl', e.target.value)} placeholder="https://..." />
              {form.logoUrl && <img src={form.logoUrl} alt="Logo preview" className="mt-2 h-10 object-contain" onError={e => e.target.style.display='none'} />}
            </Field>
            <Field label="Favicon URL">
              <input className={inputCls} value={form.faviconUrl} onChange={e => set('faviconUrl', e.target.value)} placeholder="https://..." />
            </Field>
          </Section>

          <Section title="Social">
            <Field label="Twitter / X"><input className={inputCls} value={form.twitterUrl} onChange={e => set('twitterUrl', e.target.value)} placeholder="https://x.com/..." /></Field>
            <Field label="Instagram"><input className={inputCls} value={form.instagramUrl} onChange={e => set('instagramUrl', e.target.value)} placeholder="https://instagram.com/..." /></Field>
            <Field label="YouTube"><input className={inputCls} value={form.youtubeUrl} onChange={e => set('youtubeUrl', e.target.value)} placeholder="https://youtube.com/..." /></Field>
          </Section>

          <Section title="Contact">
            <Field label="Contact Email">
              <input className={inputCls} value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} placeholder="hello@yoursite.com" type="email" />
            </Field>
          </Section>
        </div>

        {/* Preview Panel */}
        <div className="w-72 flex-shrink-0">
          <div className="sticky top-4">
            <p className="text-xs font-medium text-muted uppercase tracking-wide mb-3">Preview</p>
            <div className="border border-border rounded-md overflow-hidden">
              {/* Mock browser chrome */}
              <div className="flex items-center gap-1.5 px-3 py-2 bg-elevated border-b border-border">
                <span className="w-2.5 h-2.5 rounded-full bg-status-red/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-status-yellow/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-status-green/60" />
                <span className="flex-1 bg-surface rounded text-center text-muted text-xs py-0.5 px-2 ml-2 truncate">
                  {form.siteName ? form.siteName.toLowerCase().replace(/\s+/g,'-') : 'your-site'}.netlify.app
                </span>
              </div>
              {/* Mock header */}
              <div className="px-4 py-3 flex items-center" style={{ backgroundColor: form.primaryColor }}>
                {form.logoUrl
                  ? <img src={form.logoUrl} alt="" className="h-6 object-contain" onError={e => e.target.style.display='none'} />
                  : <span className="text-white font-semibold text-sm" style={{ fontFamily: form.fontHeading }}>
                      {form.siteName || 'Your Site'}
                    </span>
                }
              </div>
              {/* Mock hero */}
              <div className="px-4 py-6" style={{ backgroundColor: form.backgroundColor }}>
                <p className="text-sm font-semibold mb-1" style={{ color: form.textColor, fontFamily: form.fontHeading }}>
                  {form.tagline || 'Your tagline here'}
                </p>
                <p className="text-xs opacity-60" style={{ color: form.textColor, fontFamily: form.fontBody }}>
                  {form.description ? form.description.slice(0, 80) + (form.description.length > 80 ? '…' : '') : 'Site description will appear here...'}
                </p>
              </div>
              {/* Mock card */}
              <div className="px-4 pb-4" style={{ backgroundColor: form.backgroundColor }}>
                <div className="rounded-md p-3 border" style={{ backgroundColor: form.secondaryColor, borderColor: form.primaryColor + '40' }}>
                  <div className="h-2 rounded w-3/4 mb-2" style={{ backgroundColor: form.textColor, opacity: 0.6 }} />
                  <div className="h-1.5 rounded w-full mb-1" style={{ backgroundColor: form.textColor, opacity: 0.3 }} />
                  <div className="h-1.5 rounded w-2/3" style={{ backgroundColor: form.textColor, opacity: 0.3 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
