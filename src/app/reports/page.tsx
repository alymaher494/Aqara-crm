'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/components/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Users,
  Building,
  Calendar,
  Download,
  BarChart3
} from 'lucide-react';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('month');

  const { data: statsData } = useQuery({
    queryKey: ['/api/stats'],
    queryFn: () => apiRequest("GET", "/api/stats") as Promise<any>,
    retry: false,
  });

  const stats = statsData || {};

  const getConversionRate = () => {
    if (!stats.leads?.total) return '0%';
    const rate = (stats.leads.converted / stats.leads.total * 100).toFixed(1);
    return `${rate}%`;
  };

  const getTaskCompletionRate = () => {
    if (!stats.tasks?.total) return '0%';
    const rate = (stats.tasks.completed / stats.tasks.total * 100).toFixed(1);
    return `${rate}%`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-EG').format(num);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black">التقارير والإحصائيات</h1>
        <p className="mt-2 text-gray-900">تحليل شامل لأداء فريق المبيعات والعقارات</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="overview">نظرة عامة</option>
            <option value="leads">تقرير العملاء</option>
            <option value="properties">تقرير العقارات</option>
            <option value="tasks">تقرير المهام</option>
            <option value="campaigns">تقرير الحملات</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="week">آخر أسبوع</option>
            <option value="month">آخر شهر</option>
            <option value="quarter">آخر 3 أشهر</option>
            <option value="year">آخر سنة</option>
          </select>
        </div>

        <Button className="bg-primary text-white hover:bg-primary/90">
          <Download className="w-4 h-4 ml-2" />
          تصدير التقرير
        </Button>
      </div>

      {/* Overview Stats */}
      {reportType === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">إجمالي العملاء</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(stats.leads?.total || 0)}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    +{formatNumber(stats.leads?.new || 0)} جديد
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">العقارات المتاحة</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(stats.properties?.available || 0)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    من {formatNumber(stats.properties?.total || 0)} عقار
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">معدل التحويل</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {getConversionRate()}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {formatNumber(stats.leads?.converted || 0)} محول
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">إنجاز المهام</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {getTaskCompletionRate()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatNumber(stats.tasks?.completed || 0)} مكتملة
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              حالة العملاء
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.leads?.byStatus ? (
              <div className="space-y-4">
                {Object.entries(stats.leads.byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${status === 'جديد' ? 'bg-blue-500' :
                          status === 'مهتم' ? 'bg-green-500' :
                            status === 'تم التواصل' ? 'bg-yellow-500' :
                              status === 'محول' ? 'bg-purple-500' :
                                'bg-gray-500'
                        }`}></div>
                      <span className="text-sm text-gray-600">{status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{count as number}</span>
                      <span className="text-xs text-gray-500">
                        ({((count as number) / stats.leads.total * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                لا توجد بيانات متاحة
              </div>
            )}
          </CardContent>
        </Card>

        {/* Properties Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              حالة العقارات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.properties?.byStatus ? (
              <div className="space-y-4">
                {Object.entries(stats.properties.byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${status === 'متاح' ? 'bg-green-500' :
                          status === 'مباع' ? 'bg-blue-500' :
                            status === 'مؤجر' ? 'bg-purple-500' :
                              'bg-gray-500'
                        }`}></div>
                      <span className="text-sm text-gray-600">{status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{count as number}</span>
                      <span className="text-xs text-gray-500">
                        ({((count as number) / stats.properties.total * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                لا توجد بيانات متاحة
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leads by Source */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              العملاء حسب المصدر
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.leads?.bySource ? (
              <div className="space-y-4">
                {Object.entries(stats.leads.bySource).map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{source}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{count as number}</span>
                      <span className="text-xs text-gray-500">
                        ({((count as number) / stats.leads.total * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                لا توجد بيانات متاحة
              </div>
            )}
          </CardContent>
        </Card>

        {/* Properties by Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              العقارات حسب الموقع
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.properties?.byLocation ? (
              <div className="space-y-4">
                {Object.entries(stats.properties.byLocation).map(([location, count]) => (
                  <div key={location} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{location}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{count as number}</span>
                      <span className="text-xs text-gray-500">
                        ({((count as number) / stats.properties.total * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                لا توجد بيانات متاحة
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>ملخص الأداء</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(stats.appointments?.today || 0)}
              </div>
              <div className="text-sm text-gray-600">مواعيد اليوم</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(stats.campaigns?.active || 0)}
              </div>
              <div className="text-sm text-gray-600">حملات نشطة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatNumber(stats.projects?.total || 0)}
              </div>
              <div className="text-sm text-gray-600">مشاريع عقارية</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}