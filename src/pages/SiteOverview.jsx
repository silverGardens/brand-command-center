import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getSiteDetail, triggerDeploy } from '../lib/n8n';
import { setTemplatePref } from '../lib/n8n';
import { normalizePost } from '../lib/normalize';
import { useToast } from '../hooks/useToast';
import { TEMPLATES } from '../lib/templates';
import StatusBadge from '../components/ui/StatusBadge';
import Spinner from '../components/ui/Spinner';

function StatCard({ label, value }) {
  return (
    <div className="bg-surface border border-border rounded-md p-5">
      <p className="text-muted text-xs uppercase tracking-wide mb-1">{label}</p>
      <p className="text-primary text-2xl font-semibold">{value ?? '—'}</p>
    </div>
  );
}

export default function SiteOverview() {
  const { siteId } = useParams();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deploying, setDeploying] = useState(false);
  const [templateId, setTemplateId] = useState('default');
  const [savingTemplate, setSavingTemplate] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    const { data, error: err } = await getSiteDetail(siteId);
    if (err) setError(err);
    else {
      setDetail(data);
      if (data?.site?.template_id) setTemplateId(data.site.template_id);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [siteId]);

  async function handleDeploy() {
    setDeploying(true);
    const { error: err } = await triggerDeploy(siteId);
    setDeploying(false);
    if (err) showToast(err, 'error');
    else showToast('Deploy triggered!', 'success');
  }

  async function handleTemplateChange(newId) {
    setSavingTemplate(true);
    const { error: err } = await setTemplatePref(siteId, newId);
    setSavingTemplate(false);
    if (err) {
      showToast(err, 'error');
    } else {
      setTemplateId(newId);
      showToast('Template preference saved.', 'success');
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32"><Spinner size="lg" className="text-accent" /></div>
  );
  if (error) return (
    <div className="flex flex-col items-center gap-4 py-32">
      <p className="text-status-red text-sm">{error}</p>
      <button onClick={load} className="text-accent text-sm hover:underline">Retry</button>
    </div>
  );

  const { site, posts: rawPosts = [], subscriber_count, page_count } = detail ?? {};
  const posts = rawPosts.map(normalizePost);
  const recentPosts = posts.slice(0, 5);

  const createdDate = site?.created_at
    ? new Date(site.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-primary text-2xl font-semibold">{site?.name ?? 'Site'}</h1>
            <StatusBadge status={site?.status ?? 'inactive'} />
          </div>
          <div className="flex items-center gap-4">
            {site?.domain && (
              <a href={`https://${site.domain}`} target="_blank" rel="noopener noreferrer"
                className="text-muted text-sm hover:text-accent transition-colors">
                {site.domain} ↗
              </a>
            )}
            {site?.github_repo && (
              <a href={site.github_repo} target="_blank" rel="noopener noreferrer"
                className="text-muted text-sm hover:text-accent transition-colors">
                GitHub ↗
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDeploy}
            disabled={deploying}
            className="bg-elevated hover:bg-border border border-border rounded-md px-4 py-2 text-sm text-primary flex items-center gap-2 transition-colors disabled:opacity-60"
          >
            {deploying && <Spinner />}
            {deploying ? 'Deploying...' : 'Trigger Deploy'}
          </button>
          {site?.domain && (
            <a href={`https://${site.domain}`} target="_blank" rel="noopener noreferrer"
              className="bg-accent hover:bg-accent-hover text-white text-sm px-4 py-2 rounded-md transition-colors">
              Open Site ↗
            </a>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Subscribers" value={subscriber_count} />
        <StatCard label="Posts" value={posts.length} />
        <StatCard label="Status" value={site?.status ?? '—'} />
        <StatCard label="Created" value={createdDate} />
      </div>

      {/* Template */}
      <div className="bg-surface border border-border rounded-md p-5 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary text-sm font-semibold mb-0.5">Site Template</p>
            <p className="text-muted text-xs">Layout structure used by this site.</p>
          </div>
          <div className="flex items-center gap-2">
            {savingTemplate && <Spinner />}
            <select
              value={templateId}
              onChange={e => handleTemplateChange(e.target.value)}
              disabled={savingTemplate}
              className="bg-elevated border border-border rounded-md px-3 py-2 text-primary text-sm focus:outline-none focus:border-accent disabled:opacity-60"
            >
              {TEMPLATES.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-surface border border-border rounded-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-primary font-semibold text-sm">Recent Posts</h2>
          <div className="flex items-center gap-3">
            <Link to={`/site/${siteId}/blog`} className="text-muted text-xs hover:text-accent transition-colors">View All</Link>
            <Link to={`/site/${siteId}/blog/new`}
              className="bg-accent hover:bg-accent-hover text-white text-xs px-3 py-1.5 rounded-md transition-colors">
              New Post
            </Link>
          </div>
        </div>
        {recentPosts.length === 0 ? (
          <p className="text-muted text-sm text-center py-10">No posts yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-muted text-xs uppercase tracking-wide font-medium">Title</th>
                <th className="text-left px-6 py-3 text-muted text-xs uppercase tracking-wide font-medium">Status</th>
                <th className="text-left px-6 py-3 text-muted text-xs uppercase tracking-wide font-medium">Published</th>
              </tr>
            </thead>
            <tbody>
              {recentPosts.map(post => (
                <tr key={post.id} className="border-b border-border last:border-0 hover:bg-elevated transition-colors">
                  <td className="px-6 py-3">
                    <Link to={`/site/${siteId}/blog/${post.id}`}
                      className="text-primary text-sm hover:text-accent transition-colors">
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge status={post.status ?? 'draft'} />
                  </td>
                  <td className="px-6 py-3 text-muted text-sm">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
