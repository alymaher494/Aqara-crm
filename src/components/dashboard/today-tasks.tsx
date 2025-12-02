import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function TodayTasks() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ["/api/tasks", { status: "pending", limit: 10 }],
    retry: false,
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PUT", `/api/tasks/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث المهمة",
        variant: "destructive",
      });
    },
  });

  const handleToggleTask = async (taskId: number, completed: boolean) => {
    await updateTaskMutation.mutateAsync({
      id: taskId,
      status: completed ? "completed" : "pending",
    });
  };

  const getTaskBadge = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return <Badge variant="destructive">متأخر</Badge>;
    } else if (diffHours < 2) {
      return <Badge className="bg-warning text-warning-foreground">مستحق</Badge>;
    } else {
      return <Badge variant="secondary">قريباً</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-cairo text-black">مهام اليوم</CardTitle>
          <Button variant="ghost" size="sm">
            عرض الكل
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-reverse space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : tasksData?.tasks && tasksData.tasks.length > 0 ? (
          <div className="space-y-3">
            {tasksData.tasks.map((task: any) => (
              <div key={task.id} className="flex items-center space-x-reverse space-x-3 p-3 bg-gray-50 rounded-lg">
                <Checkbox
                  checked={task.status === "completed"}
                  onCheckedChange={(checked) => handleToggleTask(task.id, checked as boolean)}
                  disabled={updateTaskMutation.isPending}
                />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${task.status === "completed" ? "text-gray-500 line-through" : "text-gray-900"}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center space-x-reverse space-x-2 mt-1">
                    {task.dueDate && (
                      <span className="text-xs text-gray-500">
                        <Clock className="w-3 h-3 inline ml-1" />
                        {format(new Date(task.dueDate), "p", { locale: ar })}
                      </span>
                    )}
                    {task.dueDate && task.status !== "completed" && getTaskBadge(task.dueDate)}
                    {task.status === "completed" && (
                      <Badge className="bg-success text-success-foreground">
                        <CheckCircle className="w-3 h-3 ml-1" />
                        مكتمل
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد مهام لليوم</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 