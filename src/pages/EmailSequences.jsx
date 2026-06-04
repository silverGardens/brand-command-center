import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  getEmailSequences, saveEmailSequence,
  getNewsletterIssues, saveNewsletterIssue, generateNewsletterIssue,
} from '../lib/n8n';
import { useToast } from '../hooks/useToast';
import Spinner from '../components/ui/Spinner';

const inputCls = "w-full bg-elevated border border-border rounded-md px-3 py-2.5 text-primary text-sm placeholder-muted focus:outline-none focus:border-accent";

const ISSUE_STATUS_STYLES = {
  draft: 'text-muted bg-elevated border-border',
  scheduled: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  sent: 'text-status-green bg-status-green/10 border-status-green/20',
};

function EmailEditor({ email, title, onSave, onClose }) {
  const [form, setForm] = useState({
    subject: email?.subject ?? '',
    body: email?.body ?? '',
    delay_days: email?.delay_days ?? 0,
  });
  const [saving, setSaving] = useState(false);

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  async function handleSave() {
    setSaving(true);
    await onSave({ ...email, ...form });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-surface border border-border rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h3 className="text-primary font-semibold mb-4">{title}</h3>

        <div className="flex flex-col gap-4 mb-6">
          <div>
            <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">Subject</label>
            <input className={inputCls} value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="Email subject line..." />
          </div>

          {email?.sequence_id !== undefined && (
            <div>
              <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">Send Delay (days after previous)</label>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={form.delay_days}
                onChange={e => set('delay_days', Number(e.target.value))}
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">Body (Markdown)</label>
            <textarea
              className={inputCls + " resize-y min-h-[240px] font-mono text-xs"}
              value={form.body}
              onChange={e => set('body', e.target.value)}
              placeholder="Write the email body in Markdown..."
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted hover:text-primary transition-colors">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || !form.subject.trim()}
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

function SequencesTab({ siteId }) {
  const { showToast } = useToast();
  const [sequences, setSequences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [editingEmail, setEditingEmail] = useState(null);
  const [newSequenceName, setNewSequenceName] = useState('');
  const [creatingSequence, setCreatingSequence] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await getEmailSequences(siteId);
    if (error) showToast(error, 'error');
    else setSequences(data?.sequences ?? []);
    setLoading(false);
  }, [siteId]);

  useEffect(() => { load(); }, [load]);

  async function handleCreateSequence() {
    if (!newSequenceName.trim()) return;
    setCreatingSequence(true);
    const { error } = await saveEmailSequence(siteId, { name: newSequenceName.trim(), emails: [] });
    setCreatingSequence(false);
    if (error) { showToast(error, 'error'); return; }
    setNewSequenceName('');
    showToast('Sequence created!', 'success');
    load();
  }

  async function handleSaveEmail(sequenceId, emailData) {
    const sequence = sequences.find(s => s.id === sequenceId);
    if (!sequence) return;
    const emails = emailData.id
      ? sequence.emails.map(e => e.id === emailData.id ? emailData : e)
      : [...sequence.emails, { ...emailData, sequence_id: sequenceId, position: sequence.emails.length + 1 }];
    const { error } = await saveEmailSequence(siteId, { ...sequence, emails });
    if (error) { showToast(error, 'error'); return; }
    setEditingEmail(null);
    showToast('Saved!', 'success');
    load();
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" className="text-accent" /></div>;

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <input
          className="flex-1 bg-elevated border border-border rounded-md px-3 py-2.5 text-primary text-sm placeholder-muted focus:outline-none focus:border-accent"
          value={newSequenceName}
          onChange={e => setNewSequenceName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreateSequence()}
          placeholder="New sequence name (e.g. Welcome Series)..."
        />
        <button
          onClick={handleCreateSequence}
          disabled={creatingSequence || !newSequenceName.trim()}
          className="bg-accent hover:bg-accent-hover disabled:opacity-60 text-white px-4 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
        >
          {creatingSequence && <Spinner />}
          Create
        </button>
      </div>

      {sequences.length === 0 ? (
        <p className="text-muted text-sm text-center py-16">No sequences yet. Create one above.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {sequences.map(seq => (
            <div key={seq.id} className="bg-surface border border-border rounded-md overflow-hidden">
              <button
                onClick={() => setExpandedId(prev => prev === seq.id ? null : seq.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-elevated transition-colors text-left"
              >
                <div>
                  <p className="text-primary font-medium text-sm">{seq.name}</p>
                  <p className="text-muted text-xs mt-0.5">{seq.emails?.length ?? 0} email{(seq.emails?.length ?? 0) !== 1 ? 's' : ''}</p>
                </div>
                <span className="text-muted text-xs">{expandedId === seq.id ? '▴' : '▾'}</span>
              </button>

              {expandedId === seq.id && (
                <div className="border-t border-border">
                  {(seq.emails ?? []).length === 0 ? (
                    <p className="text-muted text-sm text-center py-6">No emails yet.</p>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left px-5 py-2.5 text-muted text-xs uppercase tracking-wide font-medium">#</th>
                          <th className="text-left px-5 py-2.5 text-muted text-xs uppercase tracking-wide font-medium">Subject</th>
                          <th className="text-left px-5 py-2.5 text-muted text-xs uppercase tracking-wide font-medium">Delay</th>
                          <th className="text-right px-5 py-2.5 text-muted text-xs uppercase tracking-wide font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seq.emails.map((email, i) => (
                          <tr key={email.id ?? i} className="border-b border-border last:border-0 hover:bg-elevated transition-colors">
                            <td className="px-5 py-3 text-muted text-sm">{i + 1}</td>
                            <td className="px-5 py-3 text-primary text-sm">{email.subject || 'Untitled'}</td>
                            <td className="px-5 py-3 text-muted text-sm">Day {email.delay_days ?? 0}</td>
                            <td className="px-5 py-3 text-right">
                              <button
                                onClick={() => setEditingEmail({ sequenceId: seq.id, email })}
                                className="text-xs text-accent hover:text-accent-hover transition-colors"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  <div className="px-5 py-3 border-t border-border">
                    <button
                      onClick={() => setEditingEmail({ sequenceId: seq.id, email: { sequence_id: seq.id, delay_days: 0 } })}
                      className="text-sm text-accent hover:text-accent-hover transition-colors"
                    >
                      + Add Email
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {editingEmail && (
        <EmailEditor
          email={editingEmail.email}
          title={editingEmail.email?.id ? 'Edit Email' : 'New Email'}
          onSave={emailData => handleSaveEmail(editingEmail.sequenceId, emailData)}
          onClose={() => setEditingEmail(null)}
        />
      )}
    </div>
  );
}

function NewsletterTab({ siteId }) {
  const { showToast } = useToast();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await getNewsletterIssues(siteId);
    if (error) showToast(error, 'error');
    else setIssues(data?.issues ?? []);
    setLoading(false);
  }, [siteId]);

  useEffect(() => { load(); }, [load]);

  async function handleGenerate() {
    setGenerating(true);
    const { data, error } = await generateNewsletterIssue(siteId);
    setGenerating(false);
    if (error) { showToast(error, 'error'); return; }
    showToast('Issue drafted!', 'success');
    if (data?.issue) setEditingIssue(data.issue);
    else load();
  }

  async function handleSaveIssue(issueData) {
    const { error } = await saveNewsletterIssue(siteId, issueData);
    if (error) { showToast(error, 'error'); return; }
    setEditingIssue(null);
    showToast('Issue saved!', 'success');
    load();
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" className="text-accent" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted text-sm">{issues.length} issue{issues.length !== 1 ? 's' : ''}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-elevated hover:bg-border border border-border rounded-md px-4 py-2 text-sm text-primary flex items-center gap-2 transition-colors disabled:opacity-60"
          >
            {generating && <Spinner />}
            {generating ? 'Generating...' : 'Generate from Posts'}
          </button>
          <button
            onClick={() => setEditingIssue({})}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            + New Issue
          </button>
        </div>
      </div>

      {issues.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-muted text-sm mb-4">No newsletter issues yet.</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={handleGenerate} disabled={generating} className="bg-elevated border border-border rounded-md px-5 py-2.5 text-sm text-primary transition-colors flex items-center gap-2">
              {generating && <Spinner />}
              Generate from Posts
            </button>
            <button onClick={() => setEditingIssue({})} className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors">
              + New Issue
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-muted text-xs uppercase tracking-wide font-medium">Subject</th>
                <th className="text-left px-6 py-3 text-muted text-xs uppercase tracking-wide font-medium">Status</th>
                <th className="text-left px-6 py-3 text-muted text-xs uppercase tracking-wide font-medium">Date</th>
                <th className="text-right px-6 py-3 text-muted text-xs uppercase tracking-wide font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {issues.map(issue => (
                <tr key={issue.id} className="border-b border-border last:border-0 hover:bg-elevated transition-colors">
                  <td className="px-6 py-3 text-primary text-sm">{issue.subject || 'Untitled'}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${ISSUE_STATUS_STYLES[issue.status] ?? ISSUE_STATUS_STYLES.draft}`}>
                      {issue.status ?? 'draft'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-muted text-sm">
                    {issue.sent_at
                      ? new Date(issue.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : issue.scheduled_for
                      ? new Date(issue.scheduled_for).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—'}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button onClick={() => setEditingIssue(issue)} className="text-xs text-accent hover:text-accent-hover transition-colors">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingIssue !== null && (
        <EmailEditor
          email={editingIssue}
          title={editingIssue?.id ? 'Edit Issue' : 'New Issue'}
          onSave={handleSaveIssue}
          onClose={() => setEditingIssue(null)}
        />
      )}
    </div>
  );
}

export default function EmailSequences() {
  const [activeTab, setActiveTab] = useState('sequences');
  const { siteId } = useParams();

  const tabs = [
    { id: 'sequences', label: 'Sequences' },
    { id: 'newsletter', label: 'Newsletter' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-primary text-2xl font-semibold mb-6">Email</h1>

      <div className="flex items-center gap-1 mb-6 border-b border-border pb-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'text-primary border-accent'
                : 'text-muted border-transparent hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'sequences' && <SequencesTab siteId={siteId} />}
      {activeTab === 'newsletter' && <NewsletterTab siteId={siteId} />}
    </div>
  );
}
