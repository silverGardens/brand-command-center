import { useToast } from '../hooks/useToast';

const WEBHOOKS = [
  'VITE_WEBHOOK_GET_SITES', 'VITE_WEBHOOK_CREATE_SITE', 'VITE_WEBHOOK_GET_SITE_DETAIL',
  'VITE_WEBHOOK_UPDATE_BRAND', 'VITE_WEBHOOK_SAVE_POST', 'VITE_WEBHOOK_GET_SUBSCRIBERS',
  'VITE_WEBHOOK_TRIGGER_DEPLOY', 'VITE_WEBHOOK_GET_ANALYTICS', 'VITE_WEBHOOK_GENERATE_IDEAS',
  'VITE_WEBHOOK_RESEARCH_POST', 'VITE_WEBHOOK_WRITE_DRAFT', 'VITE_WEBHOOK_AGENT_REVIEW',
  'VITE_WEBHOOK_PLAN_EDIT', 'VITE_WEBHOOK_EXECUTE_EDIT', 'VITE_WEBHOOK_APPROVE_POST',
  'VITE_WEBHOOK_SET_TEMPLATE', 'VITE_WEBHOOK_ANALYZE_SEO',
  'VITE_WEBHOOK_GET_SOCIAL_POSTS', 'VITE_WEBHOOK_GENERATE_SOCIAL', 'VITE_WEBHOOK_SAVE_SOCIAL_POST',
  'VITE_WEBHOOK_DELETE_SOCIAL_POST', 'VITE_WEBHOOK_PUBLISH_SOCIAL_POST',
  'VITE_WEBHOOK_CONNECT_PLATFORM', 'VITE_WEBHOOK_DISCONNECT_PLATFORM', 'VITE_WEBHOOK_GET_CONNECTED_ACCOUNTS',
  'VITE_WEBHOOK_GET_EMAIL_SEQUENCES', 'VITE_WEBHOOK_SAVE_EMAIL_SEQUENCE',
  'VITE_WEBHOOK_GET_NEWSLETTER_ISSUES', 'VITE_WEBHOOK_SAVE_NEWSLETTER_ISSUE',
  'VITE_WEBHOOK_GENERATE_NEWSLETTER',
  'VITE_WEBHOOK_GET_PRODUCTS', 'VITE_WEBHOOK_SAVE_PRODUCT',
  'VITE_WEBHOOK_GET_PURCHASES', 'VITE_WEBHOOK_SAVE_PURCHASE',
  'VITE_WEBHOOK_GET_REVENUE_SUMMARY', 'VITE_WEBHOOK_GET_AUDIENCE_METRICS',
];

const FONTS = ['Inter', 'Merriweather', 'Playfair Display', 'Roboto', 'Lato', 'Montserrat', 'Source Sans Pro'];

export default function Settings() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-primary text-2xl font-semibold">Settings</h1>
        <p className="text-muted text-sm mt-1">Global configuration for Project Umbra</p>
      </div>

      <div className="flex flex-col gap-4">

        <div className="bg-surface border border-border rounded-md p-5">
          <h3 className="text-primary text-sm font-semibold mb-1">Connected Social Accounts</h3>
          <p className="text-muted text-xs">Social account connections have moved to each brand's <strong className="text-primary">Social</strong> tab.</p>
        </div>

        <div className="bg-surface border border-border rounded-md p-5">
          <h3 className="text-primary text-sm font-semibold mb-3">Required Environment Variables</h3>
          <p className="text-muted text-xs mb-3">Set in Netlify → Environment variables and in <code className="bg-elevated px-1 rounded text-accent">.env.local</code>.</p>
          <div className="flex flex-col gap-1.5">
            <p className="text-muted text-xs font-medium uppercase tracking-wide mb-1">Auth</p>
            <code className="text-accent text-xs bg-elevated px-2 py-1 rounded">VITE_ADMIN_KEY</code>
            <p className="text-muted text-xs font-medium uppercase tracking-wide mt-2 mb-1">Webhooks</p>
            {WEBHOOKS.map(k => (
              <code key={k} className="text-accent text-xs bg-elevated px-2 py-1 rounded">{k}</code>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-md p-5">
          <h3 className="text-primary text-sm font-semibold mb-3">Available Fonts</h3>
          <div className="flex flex-wrap gap-2">
            {FONTS.map(f => (
              <span key={f} className="text-xs bg-elevated border border-border rounded px-2 py-0.5 text-primary">{f}</span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
