import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getBrandDetail, updateBrandProfile } from '../lib/n8n';
import { useBrands } from '../context/BrandsContext';
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
const textareaCls = "w-full bg-elevated border border-border rounded-md px-3 py-2.5 text-primary text-sm placeholder-muted focus:outline-none focus:border-accent resize-y";

export default function BrandProfile() {
  const { brandId } = useParams();
  const { brands } = useBrands();
  const { showToast } = useToast();

  const currentBrand = brands.find(b => String(b.id) === brandId);
  const brandSlug = currentBrand?.slug ?? brandId;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    siteName: '', tagline: '', description: '',
    primaryColor: '#2563EB', secondaryColor: '#1C2128', accentColor: '#E6EDF3',
    backgroundColor: '#0F1117', surfaceColor: '#1E293B', textColor: '#E6EDF3', mutedColor: '#94A3B8',
    fontHeading: 'Inter', fontBody: 'Inter',
    logoUrl: '', faviconUrl: '',
    contactEmail: '',
    targetAudience: '', voiceAndTone: '', mission: '',
  });

  useEffect(() => {
    if (!brandSlug) return;
    async function load() {
      const { data, error } = await getBrandDetail(brandSlug);
      if (error) { showToast(error, 'error'); setLoading(false); return; }
      const bc = data?.brand_config ?? {};
      const site = data?.site ?? {};
      setForm(f => ({
        ...f,
        siteName: site.name ?? '',
        tagline: site.tagline ?? bc.tagline ?? '',
        description: bc.description ?? site.description ?? '',
        primaryColor: bc.primary_color ?? f.primaryColor,
        secondaryColor: bc.secondary_color ?? f.secondaryColor,
        accentColor: bc.accent_color ?? f.accentColor,
        backgroundColor: bc.background_color ?? f.backgroundColor,
        surfaceColor: bc.surface_color ?? f.surfaceColor,
        textColor: bc.text_color ?? f.textColor,
        mutedColor: bc.muted_color ?? f.mutedColor,
        fontHeading: bc.font_heading ?? f.fontHeading,
        fontBody: bc.font_body ?? f.fontBody,
        logoUrl: bc.logo_url ?? '',
        faviconUrl: bc.favicon_url ?? '',
        contactEmail: site.contact_email ?? bc.contact_email ?? '',
        targetAudience: site.target_audience ?? '',
        voiceAndTone: site.voice_and_tone ?? '',
        mission: site.mission ?? '',
      }));
      setLoading(false);
    }
    load();
  }, [brandSlug]);

  function set(key) {
    return e => setForm(f => ({ ...f, [key]: e.target.value }));
  }

  async function handleSave() {
    setSaving(true);
    const { error } = await updateBrandProfile(brandSlug, form);
    setSaving(false);
    if (error) showToast(error, 'error');
    else showToast('Brand profile saved!', 'success');
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" className="text-accent" /></div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-primary text-2xl font-semibold">Brand Profile</h1>
          <p className="text-muted text-sm mt-1">Identity and voice settings applied to all content.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors"
        >
          {saving && <Spinner />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <Section title="Identity">
        <Field label="Brand Name"><input className={inputCls} value={form.siteName} onChange={set('siteName')} /></Field>
        <Field label="Tagline"><input className={inputCls} value={form.tagline} onChange={set('tagline')} placeholder="One-line description" /></Field>
        <Field label="Description"><textarea className={textareaCls} rows={3} value={form.description} onChange={set('description')} placeholder="What the brand is and who it's for" /></Field>
        <Field label="Logo URL"><input className={inputCls} value={form.logoUrl} onChange={set('logoUrl')} /></Field>
        <Field label="Favicon URL"><input className={inputCls} value={form.faviconUrl} onChange={set('faviconUrl')} /></Field>
        <Field label="Contact Email"><input className={inputCls} value={form.contactEmail} onChange={set('contactEmail')} /></Field>
      </Section>

      <Section title="Target Audience">
        <Field label="Ideal Customer / Reader">
          <textarea className={textareaCls} rows={4} value={form.targetAudience} onChange={set('targetAudience')} placeholder="Who they are, what they care about, what problem they have. Fed into AI content generation." />
        </Field>
      </Section>

      <Section title="Voice and Tone">
        <Field label="Writing Style and Personality">
          <textarea className={textareaCls} rows={4} value={form.voiceAndTone} onChange={set('voiceAndTone')} placeholder="Personality, tone, words to use, words to avoid. Applied as a prefix to all AI generation." />
        </Field>
      </Section>

      <Section title="Mission">
        <Field label="Brand Values / Mission Statement">
          <textarea className={textareaCls} rows={3} value={form.mission} onChange={set('mission')} placeholder="What the brand stands for and why it exists (optional)." />
        </Field>
      </Section>

      <Section title="Colors">
        <div className="grid grid-cols-2 gap-4">
          {[
            ['primaryColor', 'Primary'], ['secondaryColor', 'Secondary'], ['accentColor', 'Accent'],
            ['backgroundColor', 'Background'], ['surfaceColor', 'Surface'], ['textColor', 'Text'],
            ['mutedColor', 'Muted'],
          ].map(([key, label]) => (
            <Field key={key} label={label}>
              <ColorInput value={form[key]} onChange={val => setForm(f => ({ ...f, [key]: val }))} />
            </Field>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        {[['fontHeading', 'Heading Font'], ['fontBody', 'Body Font']].map(([key, label]) => (
          <Field key={key} label={label}>
            <select className={inputCls} value={form[key]} onChange={set(key)}>
              {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>
        ))}
      </Section>
    </div>
  );
}
