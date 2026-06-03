import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSiteDetail } from '../lib/n8n';
import { useToast } from '../hooks/useToast';
import StatusBadge from '../components/ui/StatusBadge';
import Spinner from '../components/ui/Spinner';

export default function BlogManager() {
  const { siteId } = useParams();
  const { showToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await getSiteDetail(siteId);
      if (error) { showToast(error, 'error'); setLoading(false); return; }
      setPosts(data?.posts ?? []);
      setLoading(false);
    }
    load();
  }, [siteId]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-primary text-2xl font-semibold">Blog Posts</h1>
        <Link to={`/site/${siteId}/blog/new`}
          className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-md transition-colors">
          + New Post
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" className="text-accent" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-muted text-sm mb-4">No posts yet. Write your first one.</p>
          <Link to={`/site/${siteId}/blog/new`}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors inline-block">
            + New Post
          </Link>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-muted text-xs uppercase tracking-wide font-medium">Title</th>
                <th className="text-left px-6 py-3 text-muted text-xs uppercase tracking-wide font-medium">Status</th>
                <th className="text-left px-6 py-3 text-muted text-xs uppercase tracking-wide font-medium">Published</th>
                <th className="text-left px-6 py-3 text-muted text-xs uppercase tracking-wide font-medium">Author</th>
                <th className="text-left px-6 py-3 text-muted text-xs uppercase tracking-wide font-medium">Tags</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => {
                const tags = post.tags ?? [];
                const visibleTags = tags.slice(0, 2);
                const extraCount = tags.length - 2;
                return (
                  <tr key={post.id} className="border-b border-border last:border-0 hover:bg-elevated transition-colors">
                    <td className="px-6 py-3">
                      <Link to={`/site/${siteId}/blog/${post.id}`}
                        className="text-primary text-sm hover:text-accent transition-colors font-medium">
                        {post.title || 'Untitled'}
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={post.status === 'published' ? 'published' : 'draft'} />
                    </td>
                    <td className="px-6 py-3 text-muted text-sm">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-6 py-3 text-muted text-sm">{post.author || '—'}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {visibleTags.map(tag => (
                          <span key={tag} className="bg-elevated border border-border text-muted text-xs px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                        {extraCount > 0 && (
                          <span className="text-muted text-xs">+{extraCount}</span>
                        )}
                      </div>
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
