import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getSiteDetail, savePost, analyzeSEO } from '../lib/n8n';
import SeoPanel from '../components/seo/SeoPanel';
import DistributePanel from '../components/blog/DistributePanel';
import { useToast } from '../hooks/useToast';
import Spinner from '../components/ui/Spinner';

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function BlogPostEditor() {
  const { siteId, postId } = useParams();
  const isNew = postId === 'new';
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const tagInputRef = useRef(null);

  const [post, setPost] = useState({
    title: '', slug: '', content: '', excerpt: '',
    featuredImageUrl: '', author: 'Editorial Team',
    tags: [], status: 'draft', publishedAt: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [slugManuallySet, setSlugManuallySet] = useState(false);
  const [seo, setSeo] = useState({
    focusKeyword: '', metaTitle: '', metaDescription: '',
    score: null, issues: [], analyzing: false,
  });

  useEffect(() => {
    if (isNew) return;
    async function load() {
      const { data, error } = await getSiteDetail(siteId);
      if (error) { showToast(error, 'error'); setLoading(false); return; }
      const found = (data?.posts ?? []).find(p => p.id === postId);
      if (found) {
        setPost({
          title: found.title ?? '',
          slug: found.slug ?? '',
          content: found.content ?? '',
          excerpt: found.excerpt ?? '',
          featuredImageUrl: found.featured_image_url ?? '',
          author: found.author ?? 'Editorial Team',
          tags: found.tags ?? [],
          status: found.status ?? 'draft',
          publishedAt: found.published_at ? found.published_at.split('T')[0] : '',
        });
        setSlugManuallySet(true);
        setSeo(s => ({
          ...s,
          focusKeyword: found.seo_focus_keyword ?? '',
          metaTitle: found.seo_meta_title ?? '',
          metaDescription: found.seo_meta_description ?? '',
        }));
      }
      setLoading(false);
    }
    load();
  }, [postId, siteId, isNew]);

  // Auto-slug from title for new posts
  useEffect(() => {
    if (isNew && !slugManuallySet && post.title) {
      setPost(p => ({ ...p, slug: slugify(p.title) }));
    }
  }, [post.title, isNew, slugManuallySet]);

  function set(key, val) { setPost(p => ({ ...p, [key]: val })); }

  function setSeoField(key, val) { setSeo(s => ({ ...s, [key]: val })); }

  async function handleAnalyzeSEO() {
    setSeo(s => ({ ...s, analyzing: true }));
    const { data, error } = await analyzeSEO(siteId, postId, seo.focusKeyword, post.content);
    if (error) {
      showToast(error, 'error');
      setSeo(s => ({ ...s, analyzing: false }));
      return;
    }
    setSeo(s => ({
      ...s,
      analyzing: false,
      score: data?.score ?? null,
      issues: data?.issues ?? [],
    }));
  }

  function addTag(raw) {
    const tag = raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (tag && !post.tags.includes(tag)) {
      setPost(p => ({ ...p, tags: [...p.tags, tag] }));
    }
    setTagInput('');
  }

  function removeTag(tag) {
    setPost(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }));
  }

  function handleTagKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    const payload = {
      ...(isNew ? {} : { id: postId }),
      title: post.title,
      slug: post.slug,
      content_markdown: post.content,
      excerpt: post.excerpt,
      featured_image_url: post.featuredImageUrl,
      author: post.author,
      tags: post.tags,
      is_published: post.status === 'published',
      published_at: post.status === 'published' ? post.publishedAt || new Date().toISOString() : null,
      seo_focus_keyword: seo.focusKeyword,
      seo_meta_title: seo.metaTitle,
      seo_meta_description: seo.metaDescription,
    };
    const { data, error } = await savePost(siteId, payload);
    setSaving(false);
    if (error) { showToast(error, 'error'); return; }
    showToast('Post saved!', 'success');
    if (isNew && data?.post?.id) {
      navigate(`/site/${siteId}/blog/${data.post.id}`, { replace: true });
    }
  }

  const wc = wordCount(post.content);
  const readTime = Math.ceil(wc / 200);

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" className="text-accent" /></div>;

  return (
    <div className="max-w-6xl mx-auto">
      <Link to={`/site/${siteId}/blog`} className="text-muted text-sm hover:text-accent transition-colors inline-flex items-center gap-1 mb-6">
        ← Blog
      </Link>

      <div className="flex gap-6 items-start">
        {/* Editor */}
        <div className="flex-1 min-w-0">
          <input
            value={post.title}
            onChange={e => set('title', e.target.value)}
            placeholder="Post title..."
            className="w-full bg-transparent text-primary text-3xl font-bold placeholder-muted focus:outline-none mb-4 border-none"
          />
          <hr className="border-border mb-4" />
          <textarea
            value={post.content}
            onChange={e => set('content', e.target.value)}
            placeholder="Write your post in Markdown..."
            className="w-full bg-transparent text-primary font-mono text-sm placeholder-muted focus:outline-none resize-y min-h-[400px] border-none"
          />
          <p className="text-muted text-xs mt-3">{wc} words · ~{readTime} min read</p>
        </div>

        {/* Settings Panel */}
        <div className="w-72 flex-shrink-0 sticky top-4 bg-surface border border-border rounded-md p-4 flex flex-col gap-4">
          {/* Slug */}
          <div>
            <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">Slug</label>
            <input
              value={post.slug}
              onChange={e => { setSlugManuallySet(true); set('slug', slugify(e.target.value)); }}
              className="w-full bg-elevated border border-border rounded-md px-3 py-2 text-primary text-xs font-mono focus:outline-none focus:border-accent"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">Excerpt</label>
            <textarea
              value={post.excerpt}
              onChange={e => set('excerpt', e.target.value.slice(0, 160))}
              rows={3}
              maxLength={160}
              className="w-full bg-elevated border border-border rounded-md px-3 py-2 text-primary text-xs focus:outline-none focus:border-accent resize-none"
              placeholder="Short description..."
            />
            <p className="text-muted text-xs text-right mt-0.5">{post.excerpt.length}/160</p>
          </div>

          {/* Featured Image */}
          <div>
            <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">Featured Image URL</label>
            <input
              value={post.featuredImageUrl}
              onChange={e => set('featuredImageUrl', e.target.value)}
              className="w-full bg-elevated border border-border rounded-md px-3 py-2 text-primary text-xs focus:outline-none focus:border-accent"
              placeholder="https://..."
            />
            {post.featuredImageUrl && (
              <img src={post.featuredImageUrl} alt="Featured" className="mt-2 w-full h-28 object-cover rounded-md border border-border"
                onError={e => e.target.style.display='none'} />
            )}
          </div>

          {/* Author */}
          <div>
            <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">Author</label>
            <input
              value={post.author}
              onChange={e => set('author', e.target.value)}
              className="w-full bg-elevated border border-border rounded-md px-3 py-2 text-primary text-xs focus:outline-none focus:border-accent"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">Tags</label>
            <input
              ref={tagInputRef}
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={() => tagInput && addTag(tagInput)}
              className="w-full bg-elevated border border-border rounded-md px-3 py-2 text-primary text-xs focus:outline-none focus:border-accent"
              placeholder="Press Enter or comma to add"
            />
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {post.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 bg-elevated border border-border text-muted text-xs px-2 py-0.5 rounded">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-status-red leading-none">&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">Status</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => set('status', 'draft')}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                  post.status === 'draft'
                    ? 'bg-elevated border-muted text-primary'
                    : 'border-border text-muted hover:text-primary'
                }`}
              >Draft</button>
              <button
                onClick={() => set('status', 'published')}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                  post.status === 'published'
                    ? 'bg-status-green/20 border-status-green text-status-green'
                    : 'border-border text-muted hover:text-primary'
                }`}
              >Published</button>
            </div>
          </div>

          {/* Published Date (only when published) */}
          {post.status === 'published' && (
            <div>
              <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">Published Date</label>
              <input
                type="date"
                value={post.publishedAt}
                onChange={e => set('publishedAt', e.target.value)}
                className="w-full bg-elevated border border-border rounded-md px-3 py-2 text-primary text-xs focus:outline-none focus:border-accent"
              />
            </div>
          )}

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-accent hover:bg-accent-hover disabled:opacity-60 text-white py-2.5 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors mt-2"
          >
            {saving && <Spinner />}
            {saving ? 'Saving...' : 'Save Post'}
          </button>
          <SeoPanel
            siteId={siteId}
            postId={postId}
            content={post.content}
            seo={seo}
            onChange={setSeoField}
            onAnalyze={handleAnalyzeSEO}
          />
          {!isNew && (
            <DistributePanel siteId={siteId} postId={postId} />
          )}
        </div>
      </div>
    </div>
  );
}
