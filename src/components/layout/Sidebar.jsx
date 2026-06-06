import { useState, useEffect } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useBrands } from '../../context/BrandsContext';
import CreateSiteModal from '../sites/CreateSiteModal';

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
  const { brands, setActiveBrandId, isLoading } = useBrands();
  const [expandedId, setExpandedId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const match = location.pathname.match(/^\/brand\/([^/]+)/);
    if (match) {
      const id = isNaN(match[1]) ? match[1] : Number(match[1]);
      setExpandedId(id);
    }
  }, [location.pathname]);

  function handleBrandClick(brand) {
    setActiveBrandId(brand.id);
    setExpandedId(prev => prev === brand.id ? null : brand.id);
    navigate(`/brand/${brand.id}`);
  }

  const subLinks = (id) => [
    { to: `/brand/${id}`, label: 'Overview', end: true },
    { to: `/brand/${id}/profile`, label: 'Brand' },
    { to: `/brand/${id}/sites`, label: 'Sites' },
    { to: `/brand/${id}/social`, label: 'Social' },
    { to: `/brand/${id}/audience`, label: 'Audience' },
    { to: `/brand/${id}/products`, label: 'Products' },
    { to: `/brand/${id}/finance`, label: 'Finance' },
  ];

  return (
    <>
      <aside className="w-60 flex-shrink-0 bg-surface border-r border-border flex flex-col h-screen fixed left-0 top-0">
        <div className="py-3 border-b border-border">
          <NavLink to="/" end className={navLinkCls}>
            <span className="text-base leading-none">▣</span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/settings" className={navLinkCls}>
            <span className="text-base leading-none">◈</span>
            <span>Settings</span>
          </NavLink>
          <NavLink to="/websites" className={navLinkCls}>
            <span className="text-base leading-none">⬡</span>
            <span>Websites</span>
          </NavLink>
        </div>

        <div className="py-3 border-b border-border">
          <p className="text-muted text-xs font-semibold uppercase tracking-widest px-4 mb-1.5">All Brands</p>
          <NavLink to="/social" className={navLinkCls}>
            <span className="text-base leading-none">◎</span>
            <span>Social</span>
          </NavLink>
          <NavLink to="/audience" className={navLinkCls}>
            <span className="text-base leading-none">◉</span>
            <span>Audience</span>
          </NavLink>
          <NavLink to="/products" className={navLinkCls}>
            <span className="text-base leading-none">◈</span>
            <span>Products</span>
          </NavLink>
          <NavLink to="/finance" className={navLinkCls}>
            <span className="text-base leading-none">◇</span>
            <span>Finance</span>
          </NavLink>
        </div>

        <div className="flex-1 overflow-y-auto py-3">
          <div className="flex items-center justify-between px-4 mb-1.5">
            <p className="text-muted text-xs font-semibold uppercase tracking-widest">Brands</p>
            <button
              onClick={() => setModalOpen(true)}
              className="text-muted hover:text-accent transition-colors text-lg leading-none"
              title="New Brand"
            >+</button>
          </div>

          {isLoading ? (
            <div className="px-4 flex flex-col gap-2">
              {[1,2,3].map(i => (
                <div key={i} className="h-8 bg-elevated rounded animate-pulse" />
              ))}
            </div>
          ) : brands.length === 0 ? (
            <p className="text-muted text-xs text-center py-8">No brands yet.<br />Click + to create one.</p>
          ) : (
            brands.map(brand => {
              const isExpanded = expandedId === brand.id || expandedId === String(brand.id);
              return (
                <div key={brand.id}>
                  <button
                    onClick={() => handleBrandClick(brand)}
                    className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-elevated text-sm text-primary transition-colors text-left"
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot(brand.status)}`} />
                    <span className="truncate flex-1">{brand.name}</span>
                    <span className="text-muted text-xs">{isExpanded ? '▴' : '▾'}</span>
                  </button>
                  {isExpanded && (
                    <div className="pb-1">
                      {subLinks(brand.id).map(link => (
                        <NavLink
                          key={link.to}
                          to={link.to}
                          end={link.end}
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

        <div className="p-4 border-t border-border">
          <p className="text-muted text-xs text-center">Project Umbra v5.0</p>
        </div>
      </aside>

      <CreateSiteModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
