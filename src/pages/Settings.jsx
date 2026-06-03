export default function Settings() {
  const webhooks = [
    'VITE_WEBHOOK_GET_SITES',
    'VITE_WEBHOOK_CREATE_SITE',
    'VITE_WEBHOOK_GET_SITE_DETAIL',
    'VITE_WEBHOOK_UPDATE_BRAND',
    'VITE_WEBHOOK_SAVE_POST',
    'VITE_WEBHOOK_GET_SUBSCRIBERS',
    'VITE_WEBHOOK_TRIGGER_DEPLOY',
    'VITE_WEBHOOK_GET_ANALYTICS',
  ];

  const fonts = ['Inter', 'Merriweather', 'Playfair Display', 'Roboto', 'Lato', 'Montserrat', 'Source Sans Pro'];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-primary text-2xl font-semibold">Settings</h1>
        <p className="text-muted text-sm mt-1">Global configuration reference for Project Umbra</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="bg-surface border border-border rounded-md p-5">
          <h3 className="text-primary text-sm font-semibold mb-3">Required Environment Variables</h3>
          <p className="text-muted text-xs mb-3">Set these in Netlify site settings → Environment variables, and in your local <code className="bg-elevated px-1 rounded text-accent">.env.local</code> file.</p>
          <div className="flex flex-col gap-1.5">
            <p className="text-muted text-xs font-medium uppercase tracking-wide mb-1">Auth</p>
            <code className="text-accent text-xs bg-elevated px-2 py-1 rounded">VITE_ADMIN_KEY</code>
            <p className="text-muted text-xs font-medium uppercase tracking-wide mt-2 mb-1">Webhooks</p>
            {webhooks.map(k => (
              <code key={k} className="text-accent text-xs bg-elevated px-2 py-1 rounded">{k}</code>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-md p-5">
          <h3 className="text-primary text-sm font-semibold mb-3">Brand Defaults Reference</h3>
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-muted text-xs font-medium uppercase tracking-wide mb-1.5">Colors</p>
              <p className="text-muted text-xs">Use hex format: <code className="bg-elevated px-1 rounded text-accent">#RRGGBB</code>. Changes in Brand Settings commit directly to GitHub and trigger a Netlify rebuild.</p>
            </div>
            <div>
              <p className="text-muted text-xs font-medium uppercase tracking-wide mb-1.5">Available Fonts</p>
              <div className="flex flex-wrap gap-2">
                {fonts.map(f => (
                  <span key={f} className="text-xs bg-elevated border border-border rounded px-2 py-0.5 text-primary">{f}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-muted text-xs font-medium uppercase tracking-wide mb-1.5">Favicon</p>
              <p className="text-muted text-xs">Enter a publicly accessible image URL (PNG or ICO). Recommended size: 32×32px.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
