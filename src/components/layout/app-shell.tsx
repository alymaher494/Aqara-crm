"use client";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import MobileSidebar from "@/components/layout/mobile-sidebar";
import { SidebarProvider } from "@/components/providers/sidebar-provider";
import QueryProvider from "@/components/providers/query-provider";
import AuthGuard from "@/components/auth/auth-guard";
import { usePathname } from "next/navigation";

const AUTH_ROUTES = ["/", "/login", "/signup", "/auth/login", "/auth/register"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.includes(pathname);

  if (isAuthPage) {
    return <QueryProvider>{children}</QueryProvider>;
  }

  return (
    <QueryProvider>
      <SidebarProvider>
        <AuthGuard>
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <MobileSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Topbar />
              <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
          </div>
        </AuthGuard>
      </SidebarProvider>
    </QueryProvider>
  );
} 