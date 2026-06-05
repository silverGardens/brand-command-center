import { useState } from 'react';
import { generateSocialContent, saveSocialPost } from '../../lib/n8n';
import { useToast } from '../../hooks/useToast';
import Spinner from '../ui/Spinner';

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', limit: 2200 },
  { id: 'twitter', label: 'Twitter / X', limit: 280 },
  { id: 'youtube', label: 'YouTube', limit: 5000 },
];

export default function DistributePanel({ siteId, postId }) {
  const { showToast } = useToast();
  const [activePlatform, setActivePlatform] = useState('instagram');
  const [drafts, setDrafts] = useState({ instagram: '', twitter: '', youtube: '' });
  const [generating, setGenerating] = useState({});
  const [saving, setSaving] = useState({});

  const platform = PLATFORMS.find(p => p.id === activePlatform);

  async function handleGenerate() {
    setGenerating(g => ({ ...g, [activePlatform]: true }));
    const { data, error } = await generateSocialContent(siteId, activePlatform, postId);
    setGenerating(g => ({ ...g, [activePlatform]: false }));
    if (error) { showToast(error, 'error'); return; }
    const content = typeof data === 'string' ? data : data?.content ?? '';
    setDrafts(d => ({ ...d, [activePlatform]: content }));
  }

  async function handleSaveToQueue() {
    const content = drafts[activePlatform];
    if (!content.trim()) return;
    setSaving(s => ({ ...s, [activePlatform]: true }));
    const { error } = await saveSocialPost(siteId, activePlatform, {
      content,
      status: 'draft',
      linked_post_id: postId,
    });
    setSaving(s => ({ ...s, [activePlatform]: false }));
    if (error) { showToast(error, 'error'); return; }
    showToast(`Saved to ${platform.label} queue`, 'success');
    setDrafts(d => ({ ...d, [activePlatform]: '' }));
  }

  const charCount = drafts[activePlatform].length;
  const overLimit = charCount > platform.limit;

  return (
    <div className="border border-border rounded-md overflow-hidden mt-2">
      <div className="flex border-b border-border bg-elevated">
        <span className="px-3 py-2.5 text-xs font-semibold text-muted uppercase tracking-wide self-center">Distribute</span>
        {PLATFORMS.map(p => (
          <button
            key={p.id}
            onClick={() => setActivePlatform(p.id)}
            className={`px-3 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
              activePlatform === p.id
                ? 'text-primary border-accent'
                : 'text-muted border-transparent hover:text-primary'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="p-3 bg-surface">
        <textarea
          value={drafts[activePlatform]}
          onChange={e => setDrafts(d => ({ ...d, [activePlatform]: e.target.value }))}
          placeholder={`${platform.label} content...`}
          rows={4}
          className="w-full bg-elevated border border-border rounded-md px-3 py-2 text-primary text-xs resize-none focus:outline-none focus:border-accent mb-1"
        />
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs ${overLimit ? 'text-status-red' : 'text-muted'}`}>
            {charCount}/{platform.limit}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerate}
            disabled={!!generating[activePlatform]}
            className="flex items-center gap-1.5 bg-elevated hover:bg-border border border-border rounded-md px-3 py-1.5 text-xs text-primary disabled:opacity-60 transition-colors flex-1"
          >
            {generating[activePlatform] && <Spinner />}
            Generate with AI
          </button>
          <button
            onClick={handleSaveToQueue}
            disabled={!!saving[activePlatform] || !drafts[activePlatform].trim() || overLimit}
            className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white rounded-md px-3 py-1.5 text-xs disabled:opacity-60 transition-colors flex-1 justify-center"
          >
            {saving[activePlatform] && <Spinner />}
            Save to Queue
          </button>
        </div>
      </div>
    </div>
  );
}
