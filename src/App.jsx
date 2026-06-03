import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { SitesProvider } from './context/SitesContext';
import { ToastProvider } from './hooks/useToast';
import AdminGate from './components/ui/AdminGate';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import SiteOverview from './pages/SiteOverview';
import BrandSettings from './pages/BrandSettings';
import BlogManager from './pages/BlogManager';
import BlogPostEditor from './pages/BlogPostEditor';
import Subscribers from './pages/Subscribers';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'site/:siteId', element: <SiteOverview /> },
      { path: 'site/:siteId/brand', element: <BrandSettings /> },
      { path: 'site/:siteId/blog', element: <BlogManager /> },
      { path: 'site/:siteId/blog/new', element: <BlogPostEditor /> },
      { path: 'site/:siteId/blog/:postId', element: <BlogPostEditor /> },
      { path: 'site/:siteId/subscribers', element: <Subscribers /> },
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
