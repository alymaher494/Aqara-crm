import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/components/lib/queryClient";

export default function LeadsStatusChart() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: () => apiRequest("GET", "/api/stats").then(res => res as any),
    retry: false,
  });

  const statusColors = {
    new: "var(--status-new)",
    contacted: "var(--status-pending)",
    interested: "var(--status-in-progress)",
    not_interested: "var(--status-cancelled)",
    converted: "var(--status-completed)",
  };

  const statusLabels = {
    new: "جديد",
    contacted: "تم التواصل",
    interested: "مهتم",
    not_interested: "غير مهتم",
    converted: "تم التحويل",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-cairo">توزيع العملاء حسب الحالة</CardTitle>
          <Button variant="ghost" size="sm">
            عرض التفاصيل
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-reverse space-x-2">
                  <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : stats?.leads?.byStatus ? (
          <div className="space-y-3">
            {Object.entries(stats.leads.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-reverse space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: statusColors[status as keyof typeof statusColors] || "#6b7280" }}
                  ></div>
                  <span className="text-sm text-gray-700">
                    {statusLabels[status as keyof typeof statusLabels] || status}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">{count as number}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">لا توجد بيانات لعرضها</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}