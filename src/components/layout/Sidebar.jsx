import { useState } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useSites } from '../../context/SitesContext';
import CreateSiteModal from '../sites/CreateSiteModal';

function statusDot(status) {
  if (status === 'active') return 'bg-status-green';
  if (status === 'building') return 'bg-status-yellow';
  return 'bg-muted';
}

export default function Sidebar() {
  const { sites, activeSiteId, setActiveSiteId, isLoading } = useSites();
  const [expandedId, setExpandedId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  function handleSiteClick(site) {
    setActiveSiteId(site.id);
    setExpandedId(prev => prev === site.id ? null : site.id);
    navigate(`/site/${site.id}`);
  }

  const subLinks = (id) => [
    { to: `/site/${id}`, label: 'Overview' },
    { to: `/site/${id}/brand`, label: 'Brand' },
    { to: `/site/${id}/blog`, label: 'Blog' },
    { to: `/site/${id}/subscribers`, label: 'Subscribers' },
  ];

  return (
    <>
      <aside className="w-60 flex-shrink-0 bg-surface border-r border-border flex flex-col h-screen fixed left-0 top-0">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-primary text-lg">⌘</span>
            <span className="text-primary font-semibold text-sm">Command Center</span>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="w-full border border-border rounded-md py-1.5 text-muted text-sm hover:text-primary hover:border-accent transition-colors flex items-center justify-center gap-1"
          >
            <span className="text-base leading-none">+</span> New Site
          </button>
        </div>

        {/* Sites list */}
        <div className="flex-1 overflow-y-auto py-3">
          {isLoading ? (
            <div className="px-4 flex flex-col gap-2">
              {[1,2,3].map(i => (
                <div key={i} className="h-8 bg-elevated rounded animate-pulse" />
              ))}
            </div>
          ) : sites.length === 0 ? (
            <p className="text-muted text-xs text-center py-8">No sites yet</p>
          ) : (
            sites.map(site => {
              const isExpanded = expandedId === site.id;
              return (
                <div key={site.id}>
                  <button
                    onClick={() => handleSiteClick(site)}
                    className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-elevated text-sm text-primary transition-colors text-left"
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot(site.status)}`} />
                    <span className="truncate">{site.name}</span>
                  </button>
                  {isExpanded && (
                    <div className="pb-1">
                      {subLinks(site.id).map(link => (
                        <NavLink
                          key={link.to}
                          to={link.to}
                          end={link.to === `/site/${site.id}`}
                          className={({ isActive }) =>
                            `block pl-9 pr-4 py-1.5 text-xs transition-colors border-l-2 ml-4 ${
                              isActive
                                ? 'text-accent border-accent'
                                : 'text-muted border-transparent hover:text-primary'
                            }`
                          }
                        >
                          {link.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <p className="text-muted text-xs text-center">v1.0.0</p>
        </div>
      </aside>

      <CreateSiteModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
