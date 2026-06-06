import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getBrandDetail, generateIdeas, researchPost, writeDraft, agentReviewPost } from '../lib/n8n';
import { useToast } from '../hooks/useToast';
import Spinner from '../components/ui/Spinner';
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
  idea:         { label: 'Research',     fn: (brandId, postId, fns) => fns.research(brandId, postId),     loading: 'Researching…' },
  research:     { label: 'Write Draft',  fn: (brandId, postId, fns) => fns.writeDraft(brandId, postId),   loading: 'Writing…' },
  draft:        { label: 'Agent Review', fn: (brandId, postId, fns) => fns.agentReview(brandId, postId),  loading: 'Reviewing…' },
  agent_review: { label: 'Review',       fn: null },
  human_review: { label: 'Review',       fn: null },
  ready:        { label: 'View',         fn: null },
  published:    { label: 'View',         fn: null },
};

function StageBadge({ stage }) {
  const s = STAGES.find(x => x.key === stage) ?? STAGES[2];
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${s.color} ${s.bg}`}>
      {s.label}
    </span>
  );
}

export default function BlogManager() {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState('all');
  const [generatingIdeas, setGeneratingIdeas] = useState(false);
  const [advancingPost, setAdvancingPost] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await getBrandDetail(brandId);
    if (error) { showToast(error, 'error'); setLoading(false); return; }
    setPosts((data?.posts ?? []).map(normalizePost));
    setLoading(false);
  }, [brandId]);

  useEffect(() => { load(); }, [load]);

  async function handleGenerateIdeas() {
    setGeneratingIdeas(true);
    const { error } = await generateIdeas(brandId);
    setGeneratingIdeas(false);
    if (error) { showToast(error, 'error'); return; }
    showToast('Ideas generated!', 'success');
    load();
  }

  async function handleAdvance(post, action) {
    if (!action.fn) {
      navigate(`/brand/${brandId}/sites/blog/${post.id}/review`);
      return;
    }
    setAdvancingPost(post.id);
    const fns = { research: researchPost, writeDraft, agentReview: agentReviewPost };
    const { error } = await action.fn(brandId, post.id, fns);
    setAdvancingPost(null);
    if (error) { showToast(error, 'error'); return; }
    showToast('Done!', 'success');
    load();
  }

  const visiblePosts = activeStage === 'all'
    ? posts
    : posts.filter(p => inferStage(p) === activeStage);

  const countByStage = {};
  posts.forEach(p => {
    const s = inferStage(p);
    countByStage[s] = (countByStage[s] ?? 0) + 1;
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-primary text-2xl font-semibold">Blog Pipeline</h1>
        <div className="flex items-center gap-3">
          <button onClick={handleGenerateIdeas} disabled={generatingIdeas}
            className="bg-elevated hover:bg-border border border-border rounded-md px-4 py-2 text-sm text-primary flex items-center gap-2 transition-colors disabled:opacity-60">
            {generatingIdeas && <Spinner />}
            {generatingIdeas ? 'Generating…' : 'Generate Ideas'}
          </button>
          <Link to={`/brand/${brandId}/sites/blog/new`}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-md transition-colors">
            + New Post
          </Link>
        </div>
      </div>

      {/* Stage tabs */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveStage('all')}
          className={`px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-colors ${activeStage === 'all' ? 'bg-elevated text-primary' : 'text-muted hover:text-primary'}`}>
          All ({posts.length})
        </button>
        {STAGES.map(s => (
          <button key={s.key}
            onClick={() => setActiveStage(s.key)}
            className={`px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-colors ${activeStage === s.key ? 'bg-elevated text-primary' : 'text-muted hover:text-primary'}`}>
            {s.label}{countByStage[s.key] ? ` (${countByStage[s.key]})` : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" className="text-accent" /></div>
      ) : visiblePosts.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-muted text-sm mb-4">No posts in this stage.</p>
          {activeStage === 'all' && (
            <div className="flex items-center justify-center gap-3">
              <button onClick={handleGenerateIdeas} disabled={generatingIdeas}
                className="bg-elevated border border-border rounded-md px-5 py-2.5 text-sm text-primary transition-colors">
                Generate Ideas
              </button>
              <Link to={`/brand/${brandId}/sites/blog/new`}
                className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors inline-block">
                + New Post
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-muted text-xs uppercase tracking-wide font-medium">Title</th>
                <th className="text-left px-6 py-3 text-muted text-xs uppercase tracking-wide font-medium">Stage</th>
                <th className="text-left px-6 py-3 text-muted text-xs uppercase tracking-wide font-medium">Created</th>
                <th className="text-right px-6 py-3 text-muted text-xs uppercase tracking-wide font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {visiblePosts.map(post => {
                const stage = inferStage(post);
                const action = NEXT_ACTION[stage];
                const isAdvancing = advancingPost === post.id;
                const isReviewStage = stage === 'human_review' || stage === 'agent_review' || stage === 'ready' || stage === 'published';
                return (
                  <tr key={post.id} className="border-b border-border last:border-0 hover:bg-elevated transition-colors">
                    <td className="px-6 py-3">
                      <Link
                        to={isReviewStage ? `/brand/${brandId}/sites/blog/${post.id}/review` : `/brand/${brandId}/sites/blog/${post.id}`}
                        className="text-primary text-sm hover:text-accent transition-colors font-medium">
                        {post.title || 'Untitled'}
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <StageBadge stage={stage} />
                    </td>
                    <td className="px-6 py-3 text-muted text-sm">
                      {post.created_at
                        ? new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {action && (
                        <button
                          onClick={() => handleAdvance(post, action)}
                          disabled={isAdvancing || !!advancingPost}
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
        </div>
      )}
    </div>
  );
}
