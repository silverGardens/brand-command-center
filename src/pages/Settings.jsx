import { useState, useEffect } from 'react';
import { getConnectedAccounts, connectPlatformAccount, disconnectPlatformAccount } from '../lib/n8n';
import { useToast } from '../hooks/useToast';
import Spinner from '../components/ui/Spinner';

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: '◎' },
  { id: 'twitter', label: 'Twitter / X', icon: '𝕏' },
  { id: 'youtube', label: 'YouTube', icon: '▶' },
];

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
];

const FONTS = ['Inter', 'Merriweather', 'Playfair Display', 'Roboto', 'Lato', 'Montserrat', 'Source Sans Pro'];

export default function Settings() {
  const { showToast } = useToast();
  const [accounts, setAccounts] = useState({});
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [connecting, setConnecting] = useState({});
  const [disconnecting, setDisconnecting] = useState({});

  useEffect(() => {
    async function load() {
      const { data, error } = await getConnectedAccounts();
      if (!error && data) setAccounts(data);
      setLoadingAccounts(false);
    }
    load();
  }, []);

  async function handleConnect(platform) {
    setConnecting(c => ({ ...c, [platform]: true }));
    const { data, error } = await connectPlatformAccount(platform);
    setConnecting(c => ({ ...c, [platform]: false }));
    if (error) { showToast(error, 'error'); return; }
    if (data?.auth_url) {
      window.open(data.auth_url, '_blank', 'width=600,height=700');
      showToast('Complete authorization in the popup, then refresh this page.', 'success');
    }
  }

  async function handleDisconnect(platform) {
    setDisconnecting(d => ({ ...d, [platform]: true }));
    const { error } = await disconnectPlatformAccount(platform);
    setDisconnecting(d => ({ ...d, [platform]: false }));
    if (error) { showToast(error, 'error'); return; }
    setAccounts(a => ({ ...a, [platform]: null }));
    showToast(`${platform} disconnected.`, 'success');
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-primary text-2xl font-semibold">Settings</h1>
        <p className="text-muted text-sm mt-1">Global configuration for Project Umbra</p>
      </div>

      <div className="flex flex-col gap-4">

        {/* Connected Accounts */}
        <div className="bg-surface border border-border rounded-md p-5">
          <h3 className="text-primary text-sm font-semibold mb-1">Connected Social Accounts</h3>
          <p className="text-muted text-xs mb-4">Connect your social platforms to enable automated publishing.</p>
          {loadingAccounts ? (
            <div className="flex justify-center py-4"><Spinner className="text-accent" /></div>
          ) : (
            <div className="flex flex-col gap-3">
              {PLATFORMS.map(p => {
                const connected = accounts[p.id];
                return (
                  <div key={p.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{p.icon}</span>
                      <div>
                        <p className="text-primary text-sm font-medium">{p.label}</p>
                        <p className="text-muted text-xs">
                          {connected ? `Connected as @${connected.username ?? connected.name ?? 'account'}` : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    {connected ? (
                      <button
                        onClick={() => handleDisconnect(p.id)}
                        disabled={!!disconnecting[p.id]}
                        className="flex items-center gap-1.5 text-xs text-status-red/70 hover:text-status-red border border-status-red/20 hover:border-status-red/40 px-3 py-1.5 rounded-md transition-colors disabled:opacity-60"
                      >
                        {disconnecting[p.id] && <Spinner />}
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(p.id)}
                        disabled={!!connecting[p.id]}
                        className="flex items-center gap-1.5 text-xs text-accent border border-accent/40 hover:border-accent px-3 py-1.5 rounded-md transition-colors disabled:opacity-60"
                      >
                        {connecting[p.id] && <Spinner />}
                        Connect
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Webhook reference */}
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

        {/* Fonts reference */}
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
