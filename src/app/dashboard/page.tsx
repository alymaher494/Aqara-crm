'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { useAuth } from '@/components/hooks/useAuth';
import {
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Building,
  Target,
  Calendar,
  MapPin,
  Activity,
  DollarSign,
  UserCheck
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import RecentLeads from '@/components/dashboard/recent-leads';
import RecentTasks from '@/components/dashboard/recent-tasks';

interface DashboardStats {
  totalLeads: number;
  activeLeads: number;
  totalProperties: number;
  availableProperties: number;
  todayTasks: number;
  completedTasks: number;
  attendanceToday: number;
  workingHours: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

const leadStatusData = [
  { name: 'جديد', value: 12, color: '#0F766E' },
  { name: 'متواصل', value: 8, color: '#F59E0B' },
  { name: 'مغلق', value: 5, color: '#64748B' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats] = useState<DashboardStats>({
    totalLeads: 25,
    activeLeads: 8,
    totalProperties: 14,
    availableProperties: 6,
    todayTasks: 7,
    completedTasks: 3,
    attendanceToday: 5,
    workingHours: 6,
    totalRevenue: 1250000,
    monthlyGrowth: 15.3
  });
  const [loading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header - Enhanced */}
      <div className="dashboard-header">
        <div className="relative z-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">مرحباً، {user?.name}</h1>
              <p className="text-primary-foreground/90 mt-2">مرحباً بك في لوحة تحكم Aqara Plus CRM</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatTime(currentTime)}</div>
              <div className="text-primary-foreground/80">{formatDate(currentTime)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button className="quick-action-btn success">
          <CheckCircle className="w-6 h-6 text-success mx-auto mb-2" />
          <div className="text-center">
            <div className="font-semibold text-heading">تسجيل الحضور</div>
            <div className="text-sm text-muted-foreground">بدء يوم العمل</div>
          </div>
        </button>

        <button className="quick-action-btn error">
          <XCircle className="w-6 h-6 text-error mx-auto mb-2" />
          <div className="text-center">
            <div className="font-semibold text-heading">تسجيل الانصراف</div>
            <div className="text-sm text-muted-foreground">إنهاء يوم العمل</div>
          </div>
        </button>

        <button className="quick-action-btn primary">
          <MapPin className="w-6 h-6 text-primary mx-auto mb-2" />
          <div className="text-center">
            <div className="font-semibold text-heading">تحديد الموقع</div>
            <div className="text-sm text-muted-foreground">تحديث موقعي</div>
          </div>
        </button>

        <button className="quick-action-btn">
          <Activity className="w-6 h-6 text-secondary mx-auto mb-2" />
          <div className="text-center">
            <div className="font-semibold text-heading">الأنشطة</div>
            <div className="text-sm text-muted-foreground">عرض الأنشطة الأخيرة</div>
          </div>
        </button>
      </div>

      {/* Stats Cards - Enhanced with 6 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="stat-card primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">العملاء المحتملين</p>
                <p className="text-3xl font-bold text-heading">{stats.totalLeads}</p>
                <p className="text-xs text-success font-medium mt-1">
                  +{stats.activeLeads} نشط
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-muted rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card success">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">العقارات</p>
                <p className="text-3xl font-bold text-heading">{stats.totalProperties}</p>
                <p className="text-xs text-success font-medium mt-1">
                  {stats.availableProperties} متاح
                </p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card warning">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">المهام اليوم</p>
                <p className="text-3xl font-bold text-heading">{stats.todayTasks}</p>
                <p className="text-xs text-success font-medium mt-1">
                  {stats.completedTasks} مكتمل
                </p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">الحضور اليوم</p>
                <p className="text-3xl font-bold text-heading">{stats.attendanceToday}</p>
                <p className="text-xs text-success font-medium mt-1">
                  {stats.workingHours}h ساعات العمل
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary-muted rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الإيرادات</p>
                <p className="text-3xl font-bold text-heading">
                  {(stats.totalRevenue / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-success font-medium mt-1">
                  +{stats.monthlyGrowth}% هذا الشهر
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">الموظفين النشطين</p>
                <p className="text-3xl font-bold text-heading">12</p>
                <p className="text-xs text-success font-medium mt-1">
                  جميع الموظفين حاضرون
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-muted rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-heading">توزيع حالات العملاء</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>

                  <Pie
                    data={leadStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={{
                      fill: 'var(--heading)',
                      fontWeight: 'bold',
                      fontSize: 14
                    }}
                  >
                    {leadStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{
                    color: 'var(--foreground)',
                    background: 'var(--card)',
                    border: '1px solid var(--border)'
                  }} />
                  <Legend wrapperStyle={{
                    color: 'var(--heading)',
                    fontWeight: 'bold'
                  }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tables */}
        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <RecentLeads />
          <RecentTasks />
        </div>
      </div>

      {/* Today's Schedule - Enhanced */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <Calendar className="w-5 h-5 text-primary" />
            <span>جدول اليوم</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-success/5 border border-success/20 rounded-lg">
              <div className="icon-text-group">
                <Calendar className="w-5 h-5 text-success icon" />
                <div className="text">
                  <p className="font-medium text-heading">موعد مع عميل جديد</p>
                  <p className="text-sm text-muted-foreground">الساعة 10:00 صباحاً</p>
                </div>
              </div>
              <Badge className="badge-success">قريب</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-warning/5 border border-warning/20 rounded-lg">
              <div className="icon-text-group">
                <Target className="w-5 h-5 text-warning icon" />
                <div className="text">
                  <p className="font-medium text-heading">متابعة المبيعات</p>
                  <p className="text-sm text-muted-foreground">الساعة 2:00 مساءً</p>
                </div>
              </div>
              <Badge className="badge-warning">مجدول</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/5 border border-secondary/20 rounded-lg">
              <div className="icon-text-group">
                <Users className="w-5 h-5 text-secondary icon" />
                <div className="text">
                  <p className="font-medium text-heading">اجتماع الفريق</p>
                  <p className="text-sm text-muted-foreground">الساعة 4:00 مساءً</p>
                </div>
              </div>
              <Badge className="badge-new">مهم</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}