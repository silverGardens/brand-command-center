import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { BrandsProvider } from './context/BrandsContext';
import { ToastProvider } from './hooks/useToast';
import AdminGate from './components/ui/AdminGate';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import BrandOverview from './pages/BrandOverview';
import BrandProfile from './pages/BrandProfile';
import BrandSites from './pages/BrandSites';
import BrandSocial from './pages/BrandSocial';
import BrandAudience from './pages/BrandAudience';
import BrandProducts from './pages/BrandProducts';
import BrandFinance from './pages/BrandFinance';
import BlogPostEditor from './pages/BlogPostEditor';
import HumanReview from './pages/HumanReview';
import PageEditor from './pages/PageEditor';
import PageBuilder from './pages/PageBuilder';
import TemplateBrandSettings from './pages/TemplateBrandSettings';
import Websites from './pages/Websites';
import AllSocial from './pages/AllSocial';
import AllAudience from './pages/AllAudience';
import AllProducts from './pages/AllProducts';
import AllFinance from './pages/AllFinance';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'websites', element: <Websites /> },
      { path: 'social', element: <AllSocial /> },
      { path: 'audience', element: <AllAudience /> },
      { path: 'products', element: <AllProducts /> },
      { path: 'finance', element: <AllFinance /> },
      { path: 'settings', element: <Settings /> },
      { path: 'page-builder', element: <PageBuilder /> },
      { path: 'template/:templateId', element: <TemplateBrandSettings /> },
      { path: 'brand/:brandId', element: <BrandOverview /> },
      { path: 'brand/:brandId/profile', element: <BrandProfile /> },
      { path: 'brand/:brandId/sites', element: <BrandSites /> },
      { path: 'brand/:brandId/sites/blog/:postId', element: <BlogPostEditor /> },
      { path: 'brand/:brandId/sites/blog/:postId/review', element: <HumanReview /> },
      { path: 'brand/:brandId/sites/pages/:pageSlug/edit', element: <PageEditor /> },
      { path: 'brand/:brandId/social', element: <BrandSocial /> },
      { path: 'brand/:brandId/audience', element: <BrandAudience /> },
      { path: 'brand/:brandId/products', element: <BrandProducts /> },
      { path: 'brand/:brandId/finance', element: <BrandFinance /> },
    ],
  },
]);

export default function App() {
  return (
    <BrandsProvider>
      <AdminGate>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AdminGate>
    </BrandsProvider>
  );
}
