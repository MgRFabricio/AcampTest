import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AcampamentoProvider } from '@/lib/AcampamentoContext';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AcampamentoProvider>
      <div className="min-h-screen bg-[#f4f7f9]">
        <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="lg:ml-60 flex flex-col min-h-screen">
          <TopBar onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </AcampamentoProvider>
  );
}