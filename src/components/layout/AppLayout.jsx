import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Toast from '../ui/Toast';

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-app overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-60 overflow-y-auto p-8 bg-app min-h-screen">
        <Outlet />
      </main>
      <Toast />
    </div>
  );
}
