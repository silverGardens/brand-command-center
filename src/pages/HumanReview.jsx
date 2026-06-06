import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSiteDetail, planEdit, executeEdit, approvePost } from '../lib/n8n';
import { useToast } from '../hooks/useToast';
import Spinner from '../components/ui/Spinner';

function StageBadge({ stage }) {
  const labels = {
    human_review: { label: 'Human Review', className: 'text-red-400 bg-red-400/10' },
    agent_review: { label: 'Agent Review', className: 'text-orange-400 bg-orange-400/10' },
    ready:        { label: 'Ready',        className: 'text-green-400 bg-green-400/10' },
  };
  const s = labels[stage] ?? { label: stage, className: 'text-muted bg-elevated' };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded ${s.className}`}>{s.label}</span>;
}

export default function HumanReview() {
  const { brandId, postId } = useParams();
  const { showToast } = useToast();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const [instruction, setInstruction] = useState('');
  const [plan, setPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await getSiteDetail(brandId);
      if (error) { showToast(error, 'error'); setLoading(false); return; }
      const found = (data?.posts ?? []).find(p => String(p.id) === String(postId));
      setPost(found ?? null);
      setLoading(false);
    }
    load();
  }, [brandId, postId]);

  async function handleGeneratePlan() {
    if (!instruction.trim()) return;
    setPlanLoading(true);
    setPlan(null);
    const { data, error } = await planEdit(brandId, postId, instruction);
    setPlanLoading(false);
    if (error) { showToast(error, 'error'); return; }
    const steps = data?.plan ?? data?.steps ?? data;
    setPlan(Array.isArray(steps) ? steps : []);
  }

  async function handleApplyPlan() {
    if (!plan?.length) return;
    setApplyLoading(true);
    const { data, error } = await executeEdit(brandId, postId, plan, post?.content_markdown ?? '');
    setApplyLoading(false);
    if (error) { showToast(error, 'error'); return; }
    const updatedContent = data?.content_markdown ?? data?.post?.content_markdown;
    if (updatedContent) {
      setPost(prev => ({ ...prev, content_markdown: updatedContent }));
    }
    setPlan(null);
    setInstruction('');
    showToast('Changes applied!', 'success');
  }

  async function handleApprove() {
    setApproveLoading(true);
    const { error } = await approvePost(brandId, postId);
    setApproveLoading(false);
    if (error) { showToast(error, 'error'); return; }
    setPost(prev => ({ ...prev, stage: 'ready' }));
    showToast('Post approved for publishing!', 'success');
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32"><Spinner size="lg" className="text-accent" /></div>
  );

  if (!post) return (
    <div className="flex flex-col items-center gap-4 py-32">
      <p className="text-muted text-sm">Post not found.</p>
      <Link to={`/brand/${brandId}/sites`} className="text-accent text-sm hover:underline">← Back to Pipeline</Link>
    </div>
  );

  const stage = post.stage ?? (post.is_published ? 'published' : 'draft');

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link to={`/brand/${brandId}/sites`} className="text-muted text-sm hover:text-accent transition-colors">
            ← Pipeline
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-primary text-xl font-semibold">{post.title || 'Untitled'}</h1>
            <StageBadge stage={stage} />
          </div>
          {post.author && <p className="text-muted text-xs mt-1">by {post.author}</p>}
        </div>
        {stage !== 'ready' && stage !== 'published' && (
          <button onClick={handleApprove} disabled={approveLoading}
            className="bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors flex items-center gap-2">
            {approveLoading && <Spinner />}
            {approveLoading ? 'Approving…' : 'Approve for Publishing'}
          </button>
        )}
        {stage === 'ready' && (
          <span className="bg-green-400/10 text-green-400 text-sm font-medium px-4 py-2 rounded-md">
            Queued for auto-publish (48h)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Post content */}
        <div className="bg-surface border border-border rounded-md overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-muted text-xs font-medium uppercase tracking-wide">Post Content</p>
          </div>
          <div className="p-4 overflow-auto max-h-[600px]">
            <pre className="text-primary text-sm font-mono whitespace-pre-wrap leading-relaxed">
              {post.content_markdown || '(no content yet)'}
            </pre>
          </div>
        </div>

        {/* Editing agent */}
        <div className="flex flex-col gap-4">
          <div className="bg-surface border border-border rounded-md p-4">
            <p className="text-primary text-sm font-semibold mb-1">Editing Agent</p>
            <p className="text-muted text-xs mb-3">
              Describe the change you want. The agent will show you a plan — review it, then apply.
            </p>
            <textarea
              value={instruction}
              onChange={e => setInstruction(e.target.value)}
              rows={4}
              placeholder="e.g. Add a product placement for TechPro keyboard in the conclusion. Keep it natural."
              className="w-full bg-elevated border border-border rounded-md px-3 py-2.5 text-primary text-sm placeholder-muted focus:outline-none focus:border-accent resize-none font-sans"
            />
            <button
              onClick={handleGeneratePlan}
              disabled={planLoading || !instruction.trim()}
              className="mt-2 w-full bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-md transition-colors flex items-center justify-center gap-2">
              {planLoading && <Spinner />}
              {planLoading ? 'Generating Plan…' : 'Generate Plan'}
            </button>
          </div>

          {plan !== null && (
            <div className="bg-surface border border-border rounded-md p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-primary text-sm font-semibold">Proposed Changes</p>
                <span className="text-muted text-xs">{plan.length} step{plan.length !== 1 ? 's' : ''}</span>
              </div>
              {plan.length === 0 ? (
                <p className="text-muted text-sm">No changes proposed.</p>
              ) : (
                <ol className="flex flex-col gap-2 mb-4">
                  {plan.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 bg-elevated rounded-md">
                      <span className="text-accent text-xs font-bold mt-0.5 w-4 shrink-0">{i + 1}</span>
                      <div>
                        <p className="text-primary text-xs font-medium">{step.description ?? step.step ?? String(step)}</p>
                        {step.change && <p className="text-muted text-xs mt-1">{step.change}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
              {plan.length > 0 && (
                <button
                  onClick={handleApplyPlan}
                  disabled={applyLoading}
                  className="w-full bg-elevated hover:bg-border border border-border disabled:opacity-60 text-primary text-sm font-medium py-2.5 rounded-md transition-colors flex items-center justify-center gap-2">
                  {applyLoading && <Spinner />}
                  {applyLoading ? 'Applying…' : 'Apply Changes'}
                </button>
              )}
            </div>
          )}

          {/* Edit in editor */}
          <Link
            to={`/brand/${brandId}/sites/blog/${postId}`}
            className="text-center text-muted text-sm hover:text-accent transition-colors py-2">
            Edit manually in post editor →
          </Link>
        </div>
      </div>
    </div>
  );
}
