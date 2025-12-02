'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/components/lib/utils';
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
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Clock
} from 'lucide-react';
import { useSidebar } from '@/components/providers/sidebar-provider';

const navigation = [
  { name: 'لوحة التحكم', href: '/dashboard', icon: LayoutDashboard },
  { name: 'العملاء المحتملين', href: '/leads', icon: Users },
  { name: 'العقارات', href: '/properties', icon: Home },
  { name: 'المشاريع العقارية', href: '/projects', icon: Building },
  { name: 'المواعيد', href: '/appointments', icon: Calendar },
  { name: 'المهام والمتابعة', href: '/tasks', icon: CheckSquare },
  { name: 'حملات الواتساب', href: '/campaigns', icon: MessageSquare },
  { name: 'الموظفين', href: '/employees', icon: UserCheck },
  { name: 'الحضور والانصراف', href: '/attendance', icon: Clock },
  { name: 'التقارير', href: '/reports', icon: BarChart3 },
  { name: 'الإعدادات', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <aside
      className={cn(
        'bg-card border-l border-border h-full flex flex-col transition-all duration-300 ease-in-out shadow-medium',
        'hidden md:flex', // إخفاء في الموبايل، إظهار في التابلت والديسكتوب
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo and Title */}
      <div className={cn(
        'p-6 border-b border-border flex items-center transition-all duration-300 relative',
        isCollapsed ? 'justify-center' : 'space-x-reverse space-x-3'
      )}
        style={{ minHeight: 80 }}
      >
        {/* Toggle Button */}
        <button
          className={cn(
            'absolute top-4 left-4 rtl:right-4 rtl:left-auto z-30 bg-muted hover:bg-muted/80 border border-border rounded-full p-1 transition-all duration-200 shadow-soft',
            isCollapsed ? 'rotate-180' : ''
          )}
          onClick={toggleSidebar}
          aria-label={isCollapsed ? 'توسيع القائمة' : 'تصغير القائمة'}
        >
          {isCollapsed ? <ChevronRight className='w-5 h-5 text-muted-foreground' /> : <ChevronLeft className='w-5 h-5 text-muted-foreground' />}
        </button>

        <div className='w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-soft'>
          <Building className='w-6 h-6 text-primary-foreground' />
        </div>
        {!isCollapsed && (
          <div>
            <h1 className='text-xl font-bold text-heading'>عقارة بلس</h1>
            <p className='text-sm text-muted-foreground'>نظام إدارة العملاء</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className='mt-6 flex-1 overflow-y-auto'>
        <div className='px-2 space-y-1'>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center py-3 rounded-lg transition-all duration-200 font-medium',
                  isCollapsed ? 'justify-center px-0 w-12 mx-auto' : 'px-4 w-full',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-medium'
                    : 'text-heading hover:bg-muted hover:text-primary'
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={cn(
                  'w-5 h-5 transition-all duration-200',
                  isCollapsed ? 'mx-auto' : 'ml-3',
                  isActive ? 'text-primary-foreground' : 'text-primary'
                )}/>
                {!isCollapsed && (
                  <span className='truncate font-medium'>{item.name}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className={cn(
        'p-4 border-t border-border',
        isCollapsed ? 'text-center' : ''
      )}>
        {!isCollapsed && (
          <div className='text-xs text-muted-foreground'>
            <p>عقارة بلس CRM</p>
            <p>الإصدار 1.0.0</p>
          </div>
        )}
      </div>
    </aside>
  );
}