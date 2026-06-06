export default function Settings() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-primary text-2xl font-semibold">Settings</h1>
        <p className="text-muted text-sm mt-1">Integrations, appearance, and app configuration</p>
      </div>

      <div className="flex flex-col gap-6">

        <section>
          <h2 className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Integrations</h2>
          <div className="flex flex-col gap-3">
            <IntegrationCard
              name="Stripe"
              description="Accept payments and sync purchases to Finance tab"
              docsUrl="https://dashboard.stripe.com/webhooks"
              instruction="Add VITE_WEBHOOK_STRIPE_PURCHASE to env vars, then register the webhook endpoint in Stripe Dashboard."
              envKey="VITE_WEBHOOK_STRIPE_PURCHASE"
            />
            <IntegrationCard
              name="Instagram"
              description="Post to Instagram from each brand's Social tab"
              docsUrl="https://developers.facebook.com"
              instruction="Create a Meta App with Instagram Graph API, then connect via each brand's Social → Connected Accounts."
              envKey="VITE_WEBHOOK_CONNECT_PLATFORM"
            />
            <IntegrationCard
              name="Twitter / X"
              description="Post to Twitter/X from each brand's Social tab"
              docsUrl="https://developer.twitter.com"
              instruction="Create a Twitter developer app with OAuth 2.0, then connect via each brand's Social → Connected Accounts."
              envKey="VITE_WEBHOOK_CONNECT_PLATFORM"
            />
            <IntegrationCard
              name="YouTube"
              description="Post to YouTube from each brand's Social tab"
              docsUrl="https://console.cloud.google.com"
              instruction="Enable YouTube Data API v3 in Google Cloud Console, then connect via each brand's Social → Connected Accounts."
              envKey="VITE_WEBHOOK_CONNECT_PLATFORM"
            />
            <IntegrationCard
              name="GitHub"
              description="Required for Extract Template workflow to fetch Astro files"
              docsUrl="https://github.com/settings/tokens"
              instruction="Create a Personal Access Token with repo scope, then add it as a GitHub API credential in n8n and connect it to the Extract Template workflow."
              envKey={null}
            />
          </div>
        </section>

        <section>
          <h2 className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">App Appearance</h2>
          <div className="bg-surface border border-border rounded-md p-5">
            <p className="text-muted text-sm">Theme customization coming in v5.1. Brand-specific colors are set in each brand's <strong className="text-primary">Brand</strong> tab.</p>
          </div>
        </section>

        <section>
          <h2 className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Admin</h2>
          <div className="bg-surface border border-border rounded-md p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary text-sm font-medium">Admin Key</p>
                <p className="text-muted text-xs mt-0.5">Set <code className="bg-elevated px-1 rounded text-accent">VITE_ADMIN_KEY</code> in Netlify env vars and <code className="bg-elevated px-1 rounded text-accent">.env.local</code></p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${import.meta.env.VITE_ADMIN_KEY ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                {import.meta.env.VITE_ADMIN_KEY ? 'Set' : 'Missing'}
              </span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

function IntegrationCard({ name, description, instruction, envKey, docsUrl }) {
  const isConfigured = envKey ? !!import.meta.env[envKey] : false;
  return (
    <div className="bg-surface border border-border rounded-md p-5">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-primary text-sm font-medium">{name}</p>
          <p className="text-muted text-xs mt-0.5">{description}</p>
        </div>
        {envKey && (
          <span className={`text-xs px-2 py-0.5 rounded font-medium flex-shrink-0 ml-4 ${isConfigured ? 'text-green-400 bg-green-400/10' : 'text-yellow-400 bg-yellow-400/10'}`}>
            {isConfigured ? 'Configured' : 'Needs setup'}
          </span>
        )}
      </div>
      <p className="text-muted text-xs border-t border-border pt-3 mt-3">{instruction}</p>
      {docsUrl && (
        <a href={docsUrl} target="_blank" rel="noreferrer" className="text-accent text-xs mt-2 inline-block hover:underline">
          Open docs ↗
        </a>
      )}
    </div>
  );
}
