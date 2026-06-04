import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getSiteDetail, getSocialPosts, generateSocialContent, saveSocialPost, deleteSocialPost } from '../lib/n8n';
import { useToast } from '../hooks/useToast';
import Spinner from '../components/ui/Spinner';

const PLATFORMS = [
  { id: 'twitter', label: 'Twitter / X', icon: '𝕏', limit: 280 },
  { id: 'instagram', label: 'Instagram', icon: '◎', limit: 2200 },
  { id: 'youtube', label: 'YouTube', icon: '▶', limit: 5000 },
];

const STATUS_STYLES = {
  draft: 'text-muted bg-elevated border-border',
  scheduled: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  published: 'text-status-green bg-status-green/10 border-status-green/20',
};

function GenerateModal({ posts, platform, onGenerate, onClose }) {
  const [selectedPostId, setSelectedPostId] = useState('');
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    if (!selectedPostId) return;
    setGenerating(true);
    await onGenerate(selectedPostId);
    setGenerating(false);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-surface border border-border rounded-lg p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-primary font-semibold mb-1">Generate from Blog Post</h3>
        <p className="text-muted text-sm mb-4">Select a post to generate {platform.label} content from.</p>
        <select
          value={selectedPostId}
          onChange={e => setSelectedPostId(e.target.value)}
          className="w-full bg-elevated border border-border rounded-md px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-accent mb-4"
        >
          <option value="">Select a post...</option>
          {posts.map(p => (
            <option key={p.id} value={p.id}>{p.title || 'Untitled'}</option>
          ))}
        </select>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted hover:text-primary transition-colors">Cancel</button>
          <button
            onClick={handleGenerate}
            disabled={!selectedPostId || generating}
            className="bg-accent hover:bg-accent-hover disabled:opacity-60 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
          >
            {generating && <Spinner />}
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ post, platform, onSave, onClose }) {
  const [content, setContent] = useState(post?.content ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave({ ...post, content, status: post?.status ?? 'draft' });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-surface border border-border rounded-lg p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-primary font-semibold mb-4">{post?.id ? 'Edit Post' : 'New Post'}</h3>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={8}
          className="w-full bg-elevated border border-border rounded-md px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-accent resize-y mb-1"
          placeholder={`Write your ${platform.label} post...`}
        />
        <p className={`text-xs mb-4 text-right ${content.length > platform.limit ? 'text-status-red' : 'text-muted'}`}>
          {content.length}/{platform.limit}
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted hover:text-primary transition-colors">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || !content.trim()}
            className="bg-accent hover:bg-accent-hover disabled:opacity-60 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
          >
            {saving && <Spinner />}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SocialPipeline() {
  const { siteId } = useParams();
  const { showToast } = useToast();
  const [activePlatform, setActivePlatform] = useState('twitter');
  const [posts, setPosts] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generateModal, setGenerateModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const platform = PLATFORMS.find(p => p.id === activePlatform);

  const loadSocial = useCallback(async () => {
    setLoading(true);
    const { data, error } = await getSocialPosts(siteId, activePlatform);
    if (error) showToast(error, 'error');
    else setPosts(data?.posts ?? []);
    setLoading(false);
  }, [siteId, activePlatform]);

  useEffect(() => {
    loadSocial();
  }, [loadSocial]);

  useEffect(() => {
    async function loadBlog() {
      const { data } = await getSiteDetail(siteId);
      setBlogPosts(data?.posts ?? []);
    }
    loadBlog();
  }, [siteId]);

  async function handleGenerate(postId) {
    const { data, error } = await generateSocialContent(siteId, activePlatform, postId);
    if (error) { showToast(error, 'error'); return; }
    setGenerateModal(false);
    showToast('Content generated!', 'success');
    if (data?.post) setEditModal(data.post);
    else loadSocial();
  }

  async function handleSavePost(postData) {
    const { error } = await saveSocialPost(siteId, activePlatform, postData);
    if (error) { showToast(error, 'error'); return; }
    setEditModal(null);
    showToast('Post saved!', 'success');
    loadSocial();
  }

  async function handleDelete(id) {
    setDeleting(id);
    const { error } = await deleteSocialPost(siteId, id);
    setDeleting(null);
    if (error) { showToast(error, 'error'); return; }
    showToast('Deleted.', 'success');
    loadSocial();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-primary text-2xl font-semibold">Social Pipeline</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setGenerateModal(true)}
            className="bg-elevated hover:bg-border border border-border rounded-md px-4 py-2 text-sm text-primary transition-colors"
          >
            Generate from Post
          </button>
          <button
            onClick={() => setEditModal({})}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            + New Post
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-6 border-b border-border pb-0">
        {PLATFORMS.map(p => (
          <button
            key={p.id}
            onClick={() => setActivePlatform(p.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activePlatform === p.id
                ? 'text-primary border-accent'
                : 'text-muted border-transparent hover:text-primary'
            }`}
          >
            <span className="mr-1.5">{p.icon}</span>{p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" className="text-accent" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-muted text-sm mb-4">No {platform.label} posts yet.</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setGenerateModal(true)} className="bg-elevated border border-border rounded-md px-5 py-2.5 text-sm text-primary transition-colors">
              Generate from Post
            </button>
            <button onClick={() => setEditModal({})} className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors">
              + New Post
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-muted text-xs uppercase tracking-wide font-medium">Content</th>
                <th className="text-left px-6 py-3 text-muted text-xs uppercase tracking-wide font-medium">Status</th>
                <th className="text-left px-6 py-3 text-muted text-xs uppercase tracking-wide font-medium">Created</th>
                <th className="text-right px-6 py-3 text-muted text-xs uppercase tracking-wide font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id} className="border-b border-border last:border-0 hover:bg-elevated transition-colors">
                  <td className="px-6 py-3 max-w-sm">
                    <p className="text-primary text-sm truncate">{post.content}</p>
                    {post.linked_post_title && (
                      <p className="text-muted text-xs mt-0.5">from: {post.linked_post_title}</p>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${STATUS_STYLES[post.status] ?? STATUS_STYLES.draft}`}>
                      {post.status ?? 'draft'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-muted text-sm">
                    {post.created_at
                      ? new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : '—'}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center gap-3 justify-end">
                      <button onClick={() => setEditModal(post)} className="text-xs text-accent hover:text-accent-hover transition-colors">Edit</button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        disabled={deleting === post.id}
                        className="text-xs text-status-red/70 hover:text-status-red transition-colors disabled:opacity-40 flex items-center gap-1"
                      >
                        {deleting === post.id && <Spinner />}
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {generateModal && (
        <GenerateModal
          posts={blogPosts}
          platform={platform}
          onGenerate={handleGenerate}
          onClose={() => setGenerateModal(false)}
        />
      )}

      {editModal !== null && (
        <EditModal
          post={editModal}
          platform={platform}
          onSave={handleSavePost}
          onClose={() => setEditModal(null)}
        />
      )}
    </div>
  );
}
