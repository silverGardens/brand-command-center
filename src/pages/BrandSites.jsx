import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBrandDetail, triggerDeploy, setTemplatePref, getPages, getTemplateRegistry, generateIdeas, researchPost, writeDraft, agentReviewPost } from '../lib/n8n';
import { useBrands } from '../context/BrandsContext';
import { useToast } from '../hooks/useToast';
import { TEMPLATES } from '../lib/templates';
import Spinner from '../components/ui/Spinner';
import StatusBadge from '../components/ui/StatusBadge';
import { normalizePost } from '../lib/normalize';

const STAGES = [
  { key: 'idea',         label: 'Ideas',        color: 'text-yellow-400',  bg: 'bg-yellow-400/10' },
  { key: 'research',     label: 'Research',     color: 'text-blue-400',    bg: 'bg-blue-400/10' },
  { key: 'draft',        label: 'Draft',        color: 'text-purple-400',  bg: 'bg-purple-400/10' },
  { key: 'agent_review', label: 'Agent Review', color: 'text-orange-400',  bg: 'bg-orange-400/10' },
  { key: 'human_review', label: 'Review',       color: 'text-red-400',     bg: 'bg-red-400/10' },
  { key: 'ready',        label: 'Ready',        color: 'text-green-400',   bg: 'bg-green-400/10' },
  { key: 'published',    label: 'Published',    color: 'text-accent',      bg: 'bg-accent/10' },
];

function inferStage(post) {
  if (post.stage) return post.stage;
  if (post.status) return post.status;
  return post.is_published ? 'published' : 'draft';
}

const NEXT_ACTION = {
  idea:         { label: 'Research',     fn: (brandId, postId, fns) => fns.research(brandId, postId),    loading: 'Researching…' },
  research:     { label: 'Write Draft',  fn: (brandId, postId, fns) => fns.writeDraft(brandId, postId),  loading: 'Writing…' },
  draft:        { label: 'Agent Review', fn: (brandId, postId, fns) => fns.agentReview(brandId, postId), loading: 'Reviewing…' },
  agent_review: { label: 'Review',       fn: null },
  human_review: { label: 'Review',       fn: null },
  ready:        { label: 'View',         fn: null },
  published:    { label: 'View',         fn: null },
};

function StageBadge({ stage }) {
  const s = STAGES.find(x => x.key === stage) ?? STAGES[2];
  return <span className={`text-xs font-medium px-2 py-0.5 rounded ${s.color} ${s.bg}`}>{s.label}</span>;
}

export default function BrandSites() {
  const { brandId } = useParams();
  const { brands } = useBrands();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [detail, setDetail] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [activeStage, setActiveStage] = useState('all');
  const [generatingIdeas, setGeneratingIdeas] = useState(false);
  const [advancingPost, setAdvancingPost] = useState(null);

  const brand = brands.find(b => String(b.id) === brandId);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [detailRes, pagesRes] = await Promise.all([
        getBrandDetail(brandId),
        getPages(brandId),
      ]);
      if (!detailRes.error) setDetail(detailRes.data);
      if (!pagesRes.error) setPages(pagesRes.data?.pages ?? []);
      setLoading(false);
    }
    load();
  }, [brandId]);

  async function handleDeploy() {
    setDeploying(true);
    const { error } = await triggerDeploy(brandId);
    setDeploying(false);
    if (error) showToast(error, 'error');
    else showToast('Deploy triggered!', 'success');
  }

  async function handleGenerateIdeas() {
    setGeneratingIdeas(true);
    const { error } = await generateIdeas(brandId);
    setGeneratingIdeas(false);
    if (error) { showToast(error, 'error'); return; }
    showToast('Ideas generated!', 'success');
    setLoading(true);
    const [detailRes, pagesRes] = await Promise.all([getBrandDetail(brandId), getPages(brandId)]);
    if (!detailRes.error) setDetail(detailRes.data);
    if (!pagesRes.error) setPages(pagesRes.data?.pages ?? []);
    setLoading(false);
  }

  async function handleAdvance(post, action) {
    if (!action.fn) { navigate(`/brand/${brandId}/sites/blog/${post.id}/review`); return; }
    setAdvancingPost(post.id);
    const fns = { research: researchPost, writeDraft, agentReview: agentReviewPost };
    const { error } = await action.fn(brandId, post.id, fns);
    setAdvancingPost(null);
    if (error) { showToast(error, 'error'); return; }
    showToast('Done!', 'success');
    const { data } = await getBrandDetail(brandId);
    if (data) setDetail(data);
  }

  const posts = (detail?.posts ?? []).map(normalizePost);
  const site = detail?.site ?? {};

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" className="text-accent" /></div>;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      <h1 className="text-primary text-2xl font-semibold">Sites</h1>

      <section>
        <h2 className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Main Site</h2>
        <div className="bg-surface border border-border rounded-md p-5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-primary font-medium">{brand?.name ?? 'Site'}</p>
              <p className="text-muted text-xs">{site.domain ?? brand?.domain ?? '—'}</p>
              <div className="mt-2"><StatusBadge status={brand?.status ?? 'inactive'} /></div>
            </div>
            <div className="flex items-center gap-3">
              {(site.domain ?? brand?.domain) && (
                <a href={`https://${site.domain ?? brand?.domain}`} target="_blank" rel="noreferrer"
                  className="text-xs text-accent border border-accent/30 hover:border-accent px-3 py-1.5 rounded-md transition-colors">
                  Open Live Site ↗
                </a>
              )}
              <button
                onClick={handleDeploy}
                disabled={deploying}
                className="flex items-center gap-1.5 text-xs bg-elevated hover:bg-border border border-border px-3 py-1.5 rounded-md transition-colors disabled:opacity-60"
              >
                {deploying && <Spinner />}
                {deploying ? 'Deploying...' : 'Trigger Deploy'}
              </button>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-muted text-xs uppercase tracking-wide mb-2">Site Template — click to switch</p>
            <div className="flex items-center gap-2 flex-wrap">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTemplatePref(brandId, t.id).then(r => r.error ? showToast(r.error, 'error') : showToast('Template saved', 'success'))}
                  className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                    (brand?.template_id ?? 'default') === t.id
                      ? 'bg-accent text-white border-accent'
                      : 'text-muted border-border hover:text-primary'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-primary text-sm font-semibold uppercase tracking-widest">Blog Pipeline</h2>
          <div className="flex items-center gap-2">
            <button onClick={handleGenerateIdeas} disabled={generatingIdeas}
              className="bg-elevated hover:bg-border border border-border rounded-md px-3 py-1.5 text-xs text-primary flex items-center gap-1.5 transition-colors disabled:opacity-60">
              {generatingIdeas && <Spinner />}
              {generatingIdeas ? 'Generating…' : 'Generate Ideas'}
            </button>
            <button
              onClick={() => navigate(`/brand/${brandId}/sites/blog/new`)}
              className="bg-accent hover:bg-accent-hover text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors">
              + New Post
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1">
          <button onClick={() => setActiveStage('all')}
            className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${activeStage === 'all' ? 'bg-elevated text-primary' : 'text-muted hover:text-primary'}`}>
            All ({posts.length})
          </button>
          {STAGES.map(s => {
            const count = posts.filter(p => inferStage(p) === s.key).length;
            return (
              <button key={s.key} onClick={() => setActiveStage(s.key)}
                className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${activeStage === s.key ? 'bg-elevated text-primary' : 'text-muted hover:text-primary'}`}>
                {s.label}{count > 0 ? ` (${count})` : ''}
              </button>
            );
          })}
        </div>

        <div className="bg-surface border border-border rounded-md overflow-hidden">
          {(() => {
            const visible = activeStage === 'all' ? posts : posts.filter(p => inferStage(p) === activeStage);
            if (visible.length === 0) {
              return (
                <div className="text-center py-12">
                  <p className="text-muted text-sm mb-4">No posts {activeStage !== 'all' ? `in ${activeStage} stage` : 'yet'}.</p>
                  {activeStage === 'all' && (
                    <button onClick={handleGenerateIdeas} disabled={generatingIdeas}
                      className="bg-elevated border border-border rounded-md px-4 py-2 text-sm text-primary transition-colors">
                      Generate Ideas to Get Started
                    </button>
                  )}
                </div>
              );
            }
            return (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Title</th>
                    <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Stage</th>
                    <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Date</th>
                    <th className="text-right px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(post => {
                    const stage = inferStage(post);
                    const action = NEXT_ACTION[stage];
                    const isAdvancing = advancingPost === post.id;
                    const isReview = ['human_review', 'agent_review', 'ready', 'published'].includes(stage);
                    return (
                      <tr key={post.id} className="border-b border-border last:border-0 hover:bg-elevated transition-colors">
                        <td className="px-5 py-3">
                          <Link to={isReview ? `/brand/${brandId}/sites/blog/${post.id}/review` : `/brand/${brandId}/sites/blog/${post.id}`}
                            className="text-primary text-sm hover:text-accent transition-colors font-medium">
                            {post.title || 'Untitled'}
                          </Link>
                        </td>
                        <td className="px-5 py-3"><StageBadge stage={stage} /></td>
                        <td className="px-5 py-3 text-muted text-sm">
                          {post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {action && (
                            <button onClick={() => handleAdvance(post, action)} disabled={isAdvancing || !!advancingPost}
                              className="text-xs font-medium text-accent hover:text-accent-hover disabled:opacity-40 transition-colors flex items-center gap-1 ml-auto">
                              {isAdvancing && <Spinner />}
                              {isAdvancing ? action.loading : action.label} →
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            );
          })()}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-primary text-sm font-semibold uppercase tracking-widest">Landing Pages</h2>
          <Link
            to="/page-builder"
            className="bg-accent hover:bg-accent-hover text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
          >
            + Build Page
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {pages.length === 0 ? (
            <div className="col-span-3 bg-surface border border-border rounded-md p-8 text-center">
              <p className="text-muted text-sm mb-3">No landing pages yet.</p>
              <Link to="/page-builder" className="text-accent text-sm hover:underline">Build your first page →</Link>
            </div>
          ) : (
            pages.map(page => (
              <div key={page.slug} className="bg-surface border border-border rounded-md p-4">
                <p className="text-primary text-sm font-medium truncate">{page.slug}</p>
                <p className="text-muted text-xs mt-0.5">{page.template_id}</p>
                <Link
                  to={`/brand/${brandId}/sites/pages/${page.slug}/edit`}
                  className="text-accent text-xs mt-3 block hover:underline"
                >
                  Edit Content →
                </Link>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Product Pages</h2>
        <div className="bg-surface border border-border rounded-md p-6 text-center">
          <p className="text-muted text-sm">Product pages are created automatically when products exist.</p>
          <Link to={`/brand/${brandId}/products`} className="text-accent text-xs mt-2 block hover:underline">Go to Products →</Link>
        </div>
      </section>
    </div>
  );
}
