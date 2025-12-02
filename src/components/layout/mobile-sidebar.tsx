"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/lib/utils";
import {
  Building,
  LayoutDashboard,
  Users,
  CheckSquare,
  MessageSquare,
  BarChart3,
  Settings,
  Calendar,
  Home,
  X
} from "lucide-react";
import { useSidebar } from "@/components/providers/sidebar-provider";

const navigation = [
  { name: "لوحة التحكم", href: "/", icon: LayoutDashboard },
  { name: "العملاء المحتملين", href: "/leads", icon: Users },
  { name: "العقارات", href: "/properties", icon: Home },
  { name: "المشاريع العقارية", href: "/projects", icon: Building },
  { name: "المواعيد", href: "/appointments", icon: Calendar },
  { name: "المهام والمتابعة", href: "/tasks", icon: CheckSquare },
  { name: "حملات الواتساب", href: "/campaigns", icon: MessageSquare },
  { name: "التقارير", href: "/reports", icon: BarChart3 },
  { name: "الإعدادات", href: "/settings", icon: Settings },
];

export default function MobileSidebar() {
  const pathname = usePathname();
  const { isMobileOpen, toggleMobile } = useSidebar();

  return (
    <>
      {/* Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden",
          isMobileOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-reverse space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">عقارة بلس</h1>
              <p className="text-sm text-gray-500">نظام إدارة العملاء</p>
            </div>
          </div>
          <button
            onClick={toggleMobile}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="إغلاق القائمة"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex-1 overflow-y-auto">
          <div className="px-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={toggleMobile} // إغلاق القائمة عند النقر
                  className={cn(
                    "group flex items-center py-3 px-4 rounded-lg transition-all duration-200 font-medium",
                    isActive
                      ? "bg-primary text-white shadow-md"
                      : "text-gray-900 hover:bg-gray-100 hover:text-primary"
                  )}
                >
                  <Icon className={cn("w-5 h-5 ml-3", isActive ? "text-white" : "text-primary")}/>
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <p>عقارة بلس CRM</p>
            <p>الإصدار 1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
} 