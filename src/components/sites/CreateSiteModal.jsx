import { useState } from 'react';
import { createBrand, researchBrand } from '../../lib/n8n';
import { useBrands } from '../../context/BrandsContext';
import { useToast } from '../../hooks/useToast';
import Spinner from '../ui/Spinner';

const STEPS = ['Basics', 'Research', 'Create'];

export default function CreateSiteModal({ isOpen, onClose }) {
  const { refresh } = useBrands();
  const { showToast } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: '', niche: '', keywords: '', domain: '' });
  const [research, setResearch] = useState(null);
  const [researching, setResearching] = useState(false);
  const [creating, setCreating] = useState(false);

  function reset() {
    setStep(0);
    setForm({ name: '', niche: '', keywords: '', domain: '' });
    setResearch(null);
  }

  function handleClose() { reset(); onClose(); }

  async function handleResearch() {
    setResearching(true);
    const { data, error } = await researchBrand(form.niche, form.keywords);
    setResearching(false);
    if (error) showToast('Research failed — you can proceed to Create', 'error');
    else setResearch(data);
    setStep(2);
  }

  async function handleCreate() {
    if (!form.name.trim()) { showToast('Brand name is required', 'error'); return; }
    setCreating(true);
    const { error } = await createBrand({
      name: form.name.trim(),
      domain: form.domain.trim() || null,
      niche: form.niche.trim() || null,
      research_notes: research ? JSON.stringify(research) : null,
    });
    setCreating(false);
    if (error) { showToast(error, 'error'); return; }
    showToast('Brand created!', 'success');
    refresh();
    handleClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-surface border border-border rounded-lg w-full max-w-lg mx-4 shadow-xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-primary font-semibold">New Brand</h2>
            <p className="text-muted text-xs mt-0.5">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
          </div>
          <button onClick={handleClose} className="text-muted hover:text-primary text-xl leading-none">×</button>
        </div>

        {/* Step indicators */}
        <div className="flex px-6 pt-4 gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                i < step ? 'bg-accent text-white' : i === step ? 'bg-accent/20 text-accent border border-accent' : 'bg-elevated text-muted'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs ${i === step ? 'text-primary' : 'text-muted'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border ml-1" />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="px-6 py-5">
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <Field label="Brand Name *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="e.g. Dink Daily" />
              <Field label="Niche / Topic" value={form.niche} onChange={v => setForm(f => ({ ...f, niche: v }))} placeholder="e.g. Pickleball for beginners" />
              <Field label="Target Keywords" value={form.keywords} onChange={v => setForm(f => ({ ...f, keywords: v }))} placeholder="e.g. pickleball tips, beginner paddle" />
              <Field label="Domain (optional)" value={form.domain} onChange={v => setForm(f => ({ ...f, domain: v }))} placeholder="e.g. dinkdaily.com" />
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <p className="text-muted text-sm">Use AI to research your niche — audience insights, content angles, and monetization ideas. You can skip this step.</p>
              <div className="bg-elevated border border-border rounded-md p-4">
                <p className="text-primary text-sm font-medium mb-1">{form.niche || 'Your niche'}</p>
                <p className="text-muted text-xs">Keywords: {form.keywords || '(none provided)'}</p>
              </div>
              {researching && (
                <div className="flex items-center gap-2 text-muted text-sm">
                  <Spinner /> Researching niche…
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="bg-elevated border border-border rounded-md p-4">
                <p className="text-primary text-sm font-semibold mb-2">{form.name || 'Unnamed Brand'}</p>
                {form.niche && <p className="text-muted text-xs mb-1">Niche: {form.niche}</p>}
                {form.domain && <p className="text-muted text-xs mb-1">Domain: {form.domain}</p>}
                {form.keywords && <p className="text-muted text-xs">Keywords: {form.keywords}</p>}
              </div>
              {research ? (
                <div className="bg-surface border border-border rounded-md p-4 max-h-48 overflow-y-auto">
                  <p className="text-muted text-xs font-semibold uppercase tracking-wide mb-2">Research Notes</p>
                  <p className="text-primary text-sm whitespace-pre-wrap">{typeof research === 'string' ? research : JSON.stringify(research, null, 2)}</p>
                </div>
              ) : (
                <p className="text-muted text-xs">No research data — brand will be created with basic info.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <button onClick={step === 0 ? handleClose : () => setStep(s => s - 1)}
            className="text-muted text-sm hover:text-primary transition-colors">
            {step === 0 ? 'Cancel' : '← Back'}
          </button>
          <div className="flex gap-2">
            {step === 1 && (
              <button onClick={() => setStep(2)}
                className="text-muted text-sm border border-border rounded-md px-3 py-1.5 hover:text-primary transition-colors">
                Skip Research
              </button>
            )}
            {step === 0 && (
              <button onClick={() => setStep(1)} disabled={!form.name.trim()}
                className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-1.5 rounded-md transition-colors disabled:opacity-50">
                Next →
              </button>
            )}
            {step === 1 && (
              <button onClick={handleResearch} disabled={researching}
                className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-1.5 rounded-md transition-colors disabled:opacity-50 flex items-center gap-1.5">
                {researching && <Spinner />} Research with AI →
              </button>
            )}
            {step === 2 && (
              <button onClick={handleCreate} disabled={creating}
                className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-1.5 rounded-md transition-colors disabled:opacity-50 flex items-center gap-1.5">
                {creating && <Spinner />} Create Brand
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-muted text-xs font-medium mb-1.5">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-elevated border border-border rounded-md px-3 py-2 text-primary text-sm placeholder:text-muted focus:outline-none focus:border-accent" />
    </div>
  );
}
