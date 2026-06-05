import { useState, useEffect } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useSites } from '../../context/SitesContext';
import CreateSiteModal from '../sites/CreateSiteModal';
import { TEMPLATES } from '../../lib/templates';

function statusDot(status) {
  if (status === 'active') return 'bg-status-green';
  if (status === 'building') return 'bg-status-yellow';
  return 'bg-muted';
}

const navLinkCls = ({ isActive }) =>
  `flex items-center gap-2.5 px-4 py-2 text-sm rounded-md mx-2 transition-colors ${
    isActive
      ? 'bg-elevated text-primary'
      : 'text-muted hover:text-primary hover:bg-elevated'
  }`;

export default function Sidebar() {
  const { sites, setActiveSiteId, isLoading } = useSites();
  const [expandedId, setExpandedId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-expand the active site based on current URL
  useEffect(() => {
    const match = location.pathname.match(/^\/site\/([^/]+)/);
    if (match) {
      const id = isNaN(match[1]) ? match[1] : Number(match[1]);
      setExpandedId(id);
    }
  }, [location.pathname]);

  function handleSiteClick(site) {
    setActiveSiteId(site.id);
    setExpandedId(prev => prev === site.id ? null : site.id);
    navigate(`/site/${site.id}`);
  }

  const subLinks = (id) => [
    { to: `/site/${id}`, label: 'Overview' },
    { to: `/site/${id}/brand`, label: 'Brand' },
    { to: `/site/${id}/pages`, label: 'Pages' },
    { to: `/site/${id}/blog`, label: 'Blog' },
    { to: `/site/${id}/social`, label: 'Social' },
    { to: `/site/${id}/email`, label: 'Email' },
    { to: `/site/${id}/subscribers`, label: 'Subscribers' },
  ];

  return (
    <>
      <aside className="w-60 flex-shrink-0 bg-surface border-r border-border flex flex-col h-screen fixed left-0 top-0">
        {/* Header */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-primary text-lg">⌘</span>
            <span className="text-primary font-semibold text-sm">Brand Command Center</span>
          </div>
        </div>

        {/* Global navigation */}
        <div className="py-3 border-b border-border">
          <p className="text-muted text-xs font-semibold uppercase tracking-widest px-4 mb-1.5">Navigation</p>
          <NavLink to="/" end className={navLinkCls}>
            <span className="text-base leading-none">▣</span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/analytics" className={navLinkCls}>
            <span className="text-base leading-none">↗</span>
            <span>Analytics</span>
          </NavLink>
          <NavLink to="/settings" className={navLinkCls}>
            <span className="text-base leading-none">◈</span>
            <span>Settings</span>
          </NavLink>
          <NavLink to="/page-builder" className={navLinkCls}>
            <span className="text-base leading-none">⬡</span>
            <span>Page Builder</span>
          </NavLink>
        </div>

        {/* Templates section */}
        <div className="py-3 border-b border-border">
          <p className="text-muted text-xs font-semibold uppercase tracking-widest px-4 mb-1.5">Templates</p>
          {TEMPLATES.map(template => (
            <div key={template.id}>
              <NavLink
                to={`/template/${template.id}`}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-4 py-2 text-sm rounded-md mx-2 transition-colors ${
                    isActive ? 'bg-elevated text-primary' : 'text-muted hover:text-primary hover:bg-elevated'
                  }`
                }
              >
                <span className="text-base leading-none">◻</span>
                <span className="truncate flex-1">{template.name}</span>
                <span className="text-muted text-xs bg-elevated border border-border px-1.5 py-0.5 rounded text-[10px]">TPL</span>
              </NavLink>
            </div>
          ))}
        </div>

        {/* Sites section */}
        <div className="flex-1 overflow-y-auto py-3">
          <div className="flex items-center justify-between px-4 mb-1.5">
            <p className="text-muted text-xs font-semibold uppercase tracking-widest">Sites</p>
            <button
              onClick={() => setModalOpen(true)}
              className="text-muted hover:text-accent transition-colors text-lg leading-none"
              title="New Site"
            >+</button>
          </div>

          {isLoading ? (
            <div className="px-4 flex flex-col gap-2">
              {[1,2,3].map(i => (
                <div key={i} className="h-8 bg-elevated rounded animate-pulse" />
              ))}
            </div>
          ) : sites.length === 0 ? (
            <p className="text-muted text-xs text-center py-8">No sites yet.<br />Click + to create one.</p>
          ) : (
            sites.map(site => {
              const isExpanded = expandedId === site.id || expandedId === String(site.id);
              return (
                <div key={site.id}>
                  <button
                    onClick={() => handleSiteClick(site)}
                    className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-elevated text-sm text-primary transition-colors text-left"
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot(site.status)}`} />
                    <span className="truncate flex-1">{site.name}</span>
                    <span className="text-muted text-xs">{isExpanded ? '▴' : '▾'}</span>
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
          <p className="text-muted text-xs text-center">Project Umbra v1.0</p>
        </div>
      </aside>

      <CreateSiteModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
