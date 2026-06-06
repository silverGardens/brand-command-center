import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageBuilder from './PageBuilder';
import { TEMPLATES } from '../lib/templates';

const TABS = ['Page Builder', 'Templates'];

export default function Websites() {
  const [tab, setTab] = useState('Page Builder');

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-primary text-2xl font-semibold">Websites</h1>
      </div>

      <div className="flex gap-1 border-b border-border mb-6">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-accent text-primary' : 'border-transparent text-muted hover:text-primary'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Page Builder' && <PageBuilderTab />}
      {tab === 'Templates' && <TemplateLibrary />}
    </div>
  );
}

function PageBuilderTab() {
  return <PageBuilder embedded />;
}

function TemplateLibrary() {
  return (
    <div>
      <p className="text-muted text-sm mb-6">Choose a template to configure its default settings. Templates apply when building landing pages for any brand.</p>
      <div className="grid grid-cols-3 gap-4">
        {TEMPLATES.map(t => (
          <div key={t.id} className="bg-surface border border-border rounded-md p-5 hover:border-accent/50 transition-colors">
            <p className="text-primary text-sm font-medium mb-1">{t.name}</p>
            <p className="text-muted text-xs mb-4">{t.description ?? 'Astro landing page template'}</p>
            <Link to={`/template/${t.id}`}
              className="text-accent text-xs hover:underline">
              Configure defaults →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
