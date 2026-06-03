export default function Settings() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-primary text-2xl font-semibold">Settings</h1>
        <p className="text-muted text-sm mt-1">Global configuration for Project Umbra</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="bg-surface border border-border rounded-md p-5">
          <h3 className="text-primary text-sm font-semibold mb-1">n8n Integration</h3>
          <p className="text-muted text-xs">Webhook endpoints are configured via environment variables on Netlify.</p>
          <p className="text-muted text-xs mt-1">To update webhooks, set <code className="bg-elevated px-1 rounded text-accent">VITE_WEBHOOK_*</code> vars in your Netlify site settings.</p>
        </div>

        <div className="bg-surface border border-border rounded-md p-5">
          <h3 className="text-primary text-sm font-semibold mb-1">Adding a New Niche Site</h3>
          <ol className="text-muted text-xs space-y-1 list-decimal list-inside mt-2">
            <li>Click <strong className="text-primary">+</strong> next to Sites in the sidebar</li>
            <li>Fill in the site name, slug, niche, tagline, and brand colors</li>
            <li>Submit — n8n creates the GitHub repo, Netlify site, and registers everything</li>
            <li>The new site appears in the sidebar within seconds</li>
          </ol>
        </div>

        <div className="bg-surface border border-border rounded-md p-5">
          <h3 className="text-primary text-sm font-semibold mb-1">n8n Credential Setup</h3>
          <p className="text-muted text-xs mb-2">For site creation and content publishing to work, configure these in your n8n instance:</p>
          <ul className="text-muted text-xs space-y-1">
            <li><span className="text-accent font-mono">GitHub API</span> — Header Auth: Authorization: Bearer &lt;token&gt;</li>
            <li><span className="text-accent font-mono">Netlify API</span> — Header Auth: Authorization: Bearer &lt;token&gt;</li>
            <li><span className="text-accent font-mono">Umbra Admin Key</span> — Header Auth: x-admin-key: excalibur</li>
          </ul>
          <p className="text-muted text-xs mt-2">Then open each HTTP Request node in the Umbra workflows and assign the correct credential.</p>
        </div>
      </div>
    </div>
  );
}
