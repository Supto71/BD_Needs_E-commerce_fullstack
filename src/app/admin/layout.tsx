'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, isModerator, isAuthenticated, isAuthLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  useEffect(() => {
    // Auth load হওয়া পর্যন্ত অপেক্ষা করো
    if (isAuthLoading) return;
    // Login page এ কোনো check দরকার নেই
    if (pathname === '/admin/login') return;

    if (!isAuthenticated) {
      router.replace('/admin/login');
      return;
    }

    if (!isAdmin && !isModerator) {
      router.replace('/');
    }
  }, [isAuthLoading, isAuthenticated, isAdmin, isModerator, pathname, router]);

  // Close sidebar on navigation on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Login page — sidebar/header ছাড়া
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-slate-100">{children}</div>;
  }

  // Auth এখনো load হচ্ছে — spinner দেখাও
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm font-semibold">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Auth load হয়েছে, কিন্তু admin ba moderator না
  if (!isAuthenticated || (!isAdmin && !isModerator)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm font-semibold">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-800">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar with slide effect */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition duration-200 ease-in-out z-50 md:z-0 h-full flex flex-col shrink-0`}>
        <AdminSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-full">
        <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
