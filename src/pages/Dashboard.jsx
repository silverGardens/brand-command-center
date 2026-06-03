import { useState } from 'react';
import { useSites } from '../context/SitesContext';
import SiteCard from '../components/dashboard/SiteCard';
import CreateSiteModal from '../components/sites/CreateSiteModal';

function StatCard({ label, value }) {
  return (
    <div className="bg-surface border border-border rounded-md p-5">
      <p className="text-muted text-xs uppercase tracking-wide mb-1">{label}</p>
      <p className="text-primary text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { sites } = useSites();
  const [modalOpen, setModalOpen] = useState(false);

  const activeSites = sites.filter(s => s.status === 'active').length;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-primary text-2xl font-semibold mb-1">Command Center</h1>
          <p className="text-muted text-sm">Manage your niche site portfolio.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-md transition-colors flex items-center gap-1.5"
        >
          <span className="text-lg leading-none">+</span> Create New Site
        </button>
      </div>

      {sites.length > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard label="Total Sites" value={sites.length} />
            <StatCard label="Active Sites" value={activeSites} />
            <StatCard label="Portfolio" value="—" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sites.map(site => (
              <SiteCard key={site.id} site={site} />
            ))}
            {/* Ghost card */}
            <button
              onClick={() => setModalOpen(true)}
              className="border border-dashed border-border rounded-md p-6 flex flex-col items-center justify-center gap-2 hover:border-accent text-muted hover:text-accent transition-colors min-h-[180px]"
            >
              <span className="text-3xl leading-none">+</span>
              <span className="text-sm">Create New Site</span>
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          {/* Placeholder graphic */}
          <div className="w-24 h-24 bg-elevated border border-border rounded-md flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect x="4" y="4" width="32" height="24" rx="3" stroke="#30363D" strokeWidth="2" />
              <rect x="8" y="32" width="24" height="4" rx="2" fill="#30363D" />
              <rect x="14" y="29" width="12" height="3" fill="#30363D" />
              <rect x="10" y="10" width="12" height="2" rx="1" fill="#8B949E" />
              <rect x="10" y="15" width="20" height="2" rx="1" fill="#30363D" />
              <rect x="10" y="19" width="16" height="2" rx="1" fill="#30363D" />
            </svg>
          </div>
          <div className="text-center">
            <h2 className="text-primary text-xl font-semibold mb-2">Welcome to Brand Command Center</h2>
            <p className="text-muted text-sm">Create your first niche site to get started</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-6 py-2.5 rounded-md transition-colors flex items-center gap-1.5"
          >
            <span className="text-lg leading-none">+</span> Create New Site
          </button>
        </div>
      )}

      <CreateSiteModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
