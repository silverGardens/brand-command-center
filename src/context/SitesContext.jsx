import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSites } from '../lib/n8n';
import { normalizeSite } from '../lib/normalize';

const SitesContext = createContext(null);

export function SitesProvider({ children }) {
  const [sites, setSites] = useState([]);
  const [activeSiteId, setActiveSiteId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshSites = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: err } = await getSites();
    if (err) {
      setError(err);
    } else {
      setSites((data?.sites ?? []).map(normalizeSite));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshSites();
  }, [refreshSites]);

  return (
    <SitesContext.Provider value={{ sites, activeSiteId, setActiveSiteId, refreshSites, isLoading, error }}>
      {children}
    </SitesContext.Provider>
  );
}

export function useSites() {
  return useContext(SitesContext);
}

export default SitesContext;
