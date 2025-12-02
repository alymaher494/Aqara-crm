'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/hooks/useAuth';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // الصفحات العامة (لا تحتاج تسجيل دخول)
  const publicPages = ['/', '/login', '/signup'];

  // الصفحات التي لا تحتاج حماية (مثل API routes)
  const unprotectedPaths = ['/api/'];

  useEffect(() => {
    // console.log('AuthGuard: Checking auth for path:', pathname);
    // console.log('AuthGuard: User state:', user ? 'Logged In' : 'Logged Out');
  }, [pathname, user]);

  // إذا كان المسار لا يحتاج حماية (API routes)
  if (unprotectedPaths.some(path => pathname.startsWith(path))) {
    return <>{children}</>;
  }

  // إذا كان في صفحة عامة
  if (publicPages.includes(pathname)) {
    return <>{children}</>;
  }

  // إذا كان المستخدم مسجل دخوله
  if (user && !loading) {
    return <>{children}</>;
  }

  // إذا انتهى التحميل ولم يتم العثور على مستخدم (وليس في صفحة عامة)، نوجه لصفحة الدخول
  if (!loading && !user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  // شاشة التحميل - تظهر فقط إذا كان التحميل مستمراً لفترة
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center animate-in fade-in duration-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg font-medium text-heading">جاري التحميل و تفعيل النظام...</p>
      </div>
    </div>
  );
}