import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getBrands } from '../lib/n8n';
import { normalizeBrand } from '../lib/normalize';

const BrandsContext = createContext(null);

export function BrandsProvider({ children }) {
  const [brands, setBrands] = useState([]);
  const [activeBrandId, setActiveBrandId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshBrands = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: err } = await getBrands();
    if (err) {
      setError(err);
    } else {
      setBrands((data?.sites ?? data?.brands ?? []).map(normalizeBrand));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshBrands();
  }, [refreshBrands]);

  return (
    <BrandsContext.Provider value={{ brands, activeBrandId, setActiveBrandId, refreshBrands, refresh: refreshBrands, isLoading, error }}>
      {children}
    </BrandsContext.Provider>
  );
}

export function useBrands() {
  return useContext(BrandsContext);
}

export default BrandsContext;
