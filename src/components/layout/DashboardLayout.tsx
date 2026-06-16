'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { useIsMobile } from '@/hooks/use-mobile';
import { UserRole } from '@prisma/client';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string | null;
  };
  tenant?: {
    name: string;
    slug: string;
    logo?: string | null;
  };
  notificationCount?: number;
  version?: string;
}

export function DashboardLayout({
  children,
  user,
  tenant,
  notificationCount = 0,
  version = '1.0.0',
}: DashboardLayoutProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Layout Container */}
      <div className="flex-1 flex">
        {/* Sidebar - Desktop */}
        {!isMobile && (
          <Sidebar
            user={user}
            tenant={tenant}
            onLogout={handleLogout}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <Header
            user={user}
            tenant={tenant}
            notificationCount={notificationCount}
            onLogout={handleLogout}
            onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          />

          {/* Page Content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>

          {/* Footer - Sticky at bottom */}
          <Footer version={version} />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-72 bg-background shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              user={user}
              tenant={tenant}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}
    </div>
  );
}
