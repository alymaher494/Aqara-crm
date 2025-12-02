import { Card, CardContent } from "@/components/ui/card";
import { Users, UserPlus, Clock, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardsProps {
  stats?: {
    totalLeads: number;
    newLeadsToday: number;
    overdueTasks: number;
    conversionRate: number;
  };
  isLoading: boolean;
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
              <div className="mt-4">
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="p-6">
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي العملاء</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalLeads.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-success font-medium">+12% من الشهر الماضي</span>
          </div>
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">عملاء جدد اليوم</p>
              <p className="text-3xl font-bold text-gray-900">{stats.newLeadsToday}</p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-success" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-success font-medium">+8% من الأمس</span>
          </div>
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">مهام متأخرة</p>
              <p className="text-3xl font-bold text-gray-900">{stats.overdueTasks}</p>
            </div>
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-warning font-medium">تحتاج متابعة</span>
          </div>
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">معدل التحويل</p>
              <p className="text-3xl font-bold text-gray-900">{stats.conversionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-success font-medium">+2.1% من الشهر الماضي</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 