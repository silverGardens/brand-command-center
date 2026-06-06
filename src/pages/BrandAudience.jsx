import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSubscribers, getAudienceMetrics, getEmailSequences, getNewsletterIssues } from '../lib/n8n';
import { normalizeSubscriber } from '../lib/normalize';
import { useToast } from '../hooks/useToast';
import Spinner from '../components/ui/Spinner';

const TYPE_STYLES = {
  lead: 'text-muted bg-elevated border-border',
  subscriber: 'text-accent bg-accent/10 border-accent/20',
  customer: 'text-status-green bg-status-green/10 border-status-green/20',
};

const SECTIONS = ['crm', 'sequences', 'newsletters'];
const SECTION_LABELS = { crm: 'Contacts', sequences: 'Email Sequences', newsletters: 'Newsletters' };

function StatCard({ label, value, loading }) {
  return (
    <div className="bg-surface border border-border rounded-md p-4">
      <p className="text-muted text-xs uppercase tracking-wide mb-1">{label}</p>
      {loading ? <div className="h-7 w-12 bg-elevated rounded animate-pulse" /> : (
        <p className="text-primary text-xl font-semibold">{value ?? '—'}</p>
      )}
    </div>
  );
}

export default function BrandAudience() {
  const { brandId } = useParams();
  const { showToast } = useToast();
  const [section, setSection] = useState('crm');
  const [subscribers, setSubscribers] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [sequences, setSequences] = useState([]);
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [subRes, metricsRes, seqRes, newsRes] = await Promise.all([
        getSubscribers(brandId),
        getAudienceMetrics(brandId),
        getEmailSequences(brandId),
        getNewsletterIssues(brandId),
      ]);
      if (subRes.error) showToast(subRes.error, 'error');
      else setSubscribers((subRes.data?.subscribers ?? []).map(normalizeSubscriber));
      if (!metricsRes.error) setMetrics(metricsRes.data);
      if (!seqRes.error) setSequences(seqRes.data?.sequences ?? []);
      if (!newsRes.error) setNewsletters(newsRes.data?.issues ?? newsRes.data?.newsletters ?? []);
      setLoading(false);
    }
    load();
  }, [brandId]);

  const filtered = typeFilter === 'all' ? subscribers : subscribers.filter(s => s.type === typeFilter);

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-primary text-2xl font-semibold mb-6">Audience</h1>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Leads" value={metrics?.leads} loading={loading} />
        <StatCard label="Subscribers" value={metrics?.subscribers} loading={loading} />
        <StatCard label="Customers" value={metrics?.customers} loading={loading} />
        <StatCard label="Total" value={metrics?.total} loading={loading} />
      </div>

      <div className="flex items-center gap-1 mb-6 border-b border-border">
        {SECTIONS.map(s => (
          <button key={s} onClick={() => setSection(s)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${section === s ? 'text-primary border-accent' : 'text-muted border-transparent hover:text-primary'}`}>
            {SECTION_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" className="text-accent" /></div> : (
        <>
          {section === 'crm' && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                {['all', 'lead', 'subscriber', 'customer'].map(t => (
                  <button key={t} onClick={() => setTypeFilter(t)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${typeFilter === t ? 'bg-accent text-white border-accent' : 'text-muted border-border hover:text-primary'}`}>
                    {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              {filtered.length === 0 ? (
                <p className="text-muted text-sm text-center py-12">No contacts yet.</p>
              ) : (
                <div className="bg-surface border border-border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Contact</th>
                        <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Type</th>
                        <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Source</th>
                        <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Spend</th>
                        <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(sub => (
                        <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-elevated transition-colors">
                          <td className="px-5 py-3">
                            <p className="text-primary text-sm">{sub.name ?? sub.email}</p>
                            {sub.name && <p className="text-muted text-xs">{sub.email}</p>}
                          </td>
                          <td className="px-5 py-3">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded border ${TYPE_STYLES[sub.type] ?? TYPE_STYLES.lead}`}>
                              {sub.type}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-muted text-sm">{sub.lead_source ?? '—'}</td>
                          <td className="px-5 py-3 text-muted text-sm">
                            {sub.total_spend > 0 ? `$${sub.total_spend.toFixed(2)}` : '—'}
                          </td>
                          <td className="px-5 py-3 text-muted text-sm">
                            {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {section === 'sequences' && (
            <div>
              {sequences.length === 0 ? (
                <p className="text-muted text-sm text-center py-12">No email sequences yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {sequences.map(seq => (
                    <div key={seq.id} className="bg-surface border border-border rounded-md p-4">
                      <p className="text-primary font-medium">{seq.name}</p>
                      <p className="text-muted text-xs mt-0.5">{seq.emails?.length ?? 0} emails</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {section === 'newsletters' && (
            <div>
              {newsletters.length === 0 ? (
                <p className="text-muted text-sm text-center py-12">No newsletter issues yet.</p>
              ) : (
                <div className="bg-surface border border-border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Subject</th>
                        <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Status</th>
                        <th className="text-left px-5 py-3 text-muted text-xs uppercase tracking-wide font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newsletters.map(n => (
                        <tr key={n.id} className="border-b border-border last:border-0 hover:bg-elevated transition-colors">
                          <td className="px-5 py-3 text-primary text-sm">{n.subject ?? n.title ?? 'Untitled'}</td>
                          <td className="px-5 py-3 text-muted text-sm">{n.status ?? 'draft'}</td>
                          <td className="px-5 py-3 text-muted text-sm">{n.created_at ? new Date(n.created_at).toLocaleDateString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
