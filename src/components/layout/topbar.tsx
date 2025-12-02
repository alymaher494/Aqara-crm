'use client';

import { useState } from 'react';
import { Bell, Search, User, Moon, Sun, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/components/hooks/useAuth';

export default function Topbar() {
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    const html = document.documentElement;
    if (!isDarkMode) {
      html.classList.add('dark-mode');
    } else {
      html.classList.remove('dark-mode');
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="البحث..."
              className="input w-full pl-10"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4 space-x-reverse">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title={isDarkMode ? 'الوضع الفاتح' : 'الوضع المظلم'}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-muted transition-colors relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full"></span>
          </button>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 space-x-reverse p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-heading hidden sm:block">
                {user?.name || 'المستخدم'}
              </span>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-medium py-2 z-50">
                <div className="px-4 py-2 border-b border-border">
                  <div className="font-medium text-heading text-sm">{user?.name || 'المستخدم'}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </div>

                <button className="w-full text-right px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-text flex items-center space-x-2 space-x-reverse">
                  <Settings className="w-4 h-4" />
                  <span>الإعدادات</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-right px-4 py-2 text-sm text-error hover:bg-error-light flex items-center space-x-2 space-x-reverse"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}