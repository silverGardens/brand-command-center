import { useState, useRef } from 'react';
import { buildPageFromDescription, buildPageFromScreenshot } from '../lib/n8n';
import { useToast } from '../hooks/useToast';
import Spinner from '../components/ui/Spinner';

export default function PageBuilder() {
  const { showToast } = useToast();
  const [mode, setMode] = useState('text');
  const [description, setDescription] = useState('');
  const [building, setBuilding] = useState(false);
  const [result, setResult] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageData, setImageData] = useState(null);
  const fileRef = useRef(null);

  async function handleBuildFromText() {
    if (!description.trim()) return;
    setBuilding(true);
    setResult(null);
    const { data, error } = await buildPageFromDescription(description);
    setBuilding(false);
    if (error) { showToast(error, 'error'); return; }
    setResult(data);
    showToast('Template built and saved to library!', 'success');
  }

  async function handleBuildFromScreenshot() {
    if (!imageData) return;
    setBuilding(true);
    setResult(null);
    const { data, error } = await buildPageFromScreenshot(imageData);
    setBuilding(false);
    if (error) { showToast(error, 'error'); return; }
    setResult(data);
    showToast('Template built and saved to library!', 'success');
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target.result;
      setImagePreview(dataUrl);
      setImageData(dataUrl.split(',')[1]);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-primary text-2xl font-semibold mb-1">Page Builder</h1>
        <p className="text-muted text-sm">Describe a page layout in text or upload a screenshot — AI builds an Astro template and adds it to your library.</p>
      </div>

      <div className="flex border-b border-border mb-6">
        {[{ id: 'text', label: 'Text Description' }, { id: 'screenshot', label: 'Screenshot' }].map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              mode === m.id ? 'text-primary border-accent' : 'text-muted border-transparent hover:text-primary'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'text' ? (
        <div>
          <label className="text-xs text-muted uppercase tracking-wide block mb-2">Describe your page layout</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={10}
            placeholder={"Example:\n40px top navigation bar with logo on the left and a Get Started button on the right.\n\nHero section: large headline, subheadline, two CTA buttons side by side.\n\nA features section with three cards in a row, each with an icon, title, and description.\n\nFooter with three columns: links, social icons, copyright text."}
            className="w-full bg-surface border border-border rounded-md px-4 py-3 text-primary text-sm resize-y focus:outline-none focus:border-accent mb-4"
          />
          <button
            onClick={handleBuildFromText}
            disabled={building || !description.trim()}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-medium px-6 py-2.5 rounded-md disabled:opacity-60 transition-colors"
          >
            {building && <Spinner />}
            {building ? 'Building Template...' : 'Build Template'}
          </button>
        </div>
      ) : (
        <div>
          <label className="text-xs text-muted uppercase tracking-wide block mb-2">Upload a page screenshot</label>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-accent rounded-md p-8 text-center cursor-pointer transition-colors mb-4"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Screenshot preview" className="max-h-64 mx-auto rounded-md" />
            ) : (
              <div>
                <p className="text-muted text-sm mb-1">Click to upload or drag and drop</p>
                <p className="text-muted text-xs">PNG, JPG, WEBP — max 10MB</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <button
            onClick={handleBuildFromScreenshot}
            disabled={building || !imageData}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-medium px-6 py-2.5 rounded-md disabled:opacity-60 transition-colors"
          >
            {building && <Spinner />}
            {building ? 'Analyzing Screenshot...' : 'Build from Screenshot'}
          </button>
        </div>
      )}

      {result && (
        <div className="mt-8 bg-surface border border-border rounded-md p-5">
          <p className="text-status-green text-sm font-medium mb-3">Template created: {result.name}</p>
          <div className="flex flex-col gap-1.5 text-xs text-muted">
            <p>Type: <span className="text-primary">{result.type}</span></p>
            <p>Sections: <span className="text-primary">{Array.isArray(result.section_schema) ? result.section_schema.length : '—'}</span></p>
          </div>
          <p className="text-muted text-xs mt-3">The template is now available in the Template Library on any site Pages section.</p>
        </div>
      )}
    </div>
  );
}
