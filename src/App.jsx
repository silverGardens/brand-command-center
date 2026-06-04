import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { SitesProvider } from './context/SitesContext';
import { ToastProvider } from './hooks/useToast';
import AdminGate from './components/ui/AdminGate';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import SiteOverview from './pages/SiteOverview';
import BrandSettings from './pages/BrandSettings';
import BlogManager from './pages/BlogManager';
import BlogPostEditor from './pages/BlogPostEditor';
import Subscribers from './pages/Subscribers';
import HumanReview from './pages/HumanReview';
import TemplateBrandSettings from './pages/TemplateBrandSettings';
import SocialPipeline from './pages/SocialPipeline';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'settings', element: <Settings /> },
      { path: 'site/:siteId', element: <SiteOverview /> },
      { path: 'site/:siteId/brand', element: <BrandSettings /> },
      { path: 'site/:siteId/blog', element: <BlogManager /> },
      { path: 'site/:siteId/blog/new', element: <BlogPostEditor /> },
      { path: 'site/:siteId/blog/:postId', element: <BlogPostEditor /> },
      { path: 'site/:siteId/blog/:postId/review', element: <HumanReview /> },
      { path: 'site/:siteId/subscribers', element: <Subscribers /> },
      { path: 'site/:siteId/social', element: <SocialPipeline /> },
      { path: 'template/:templateId', element: <TemplateBrandSettings /> },
    ],
  },
]);

export default function App() {
  return (
    <SitesProvider>
      <AdminGate>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AdminGate>
    </SitesProvider>
  );
}
