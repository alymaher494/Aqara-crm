"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/components/lib/queryClient";
import { useToast } from "@/components/hooks/use-toast";
import { isUnauthorizedError } from "@/components/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  MoreHorizontal,
  MessageSquare,
  Mail,
  MessageCircle,
  Eye,
  Edit,
  Trash2,
  BarChart3
} from "lucide-react";
import { formatDate } from "@/components/lib/date-utils";
import NewCampaignModal from "@/components/modals/new-campaign-modal";

interface Lead {
  id: number;
  campaignId: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface LeadsData {
  leads: Lead[];
  total: number;
}

interface Campaign {
  id: number;
  name: string;
  type: string;
  description?: string;
  message?: string;
  createdAt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface CampaignsData {
  campaigns: Campaign[];
  total: number;
}

export default function CampaignsList() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: campaignsData, isLoading } = useQuery<CampaignsData>({
    queryKey: ["/api/campaigns", { page, type: typeFilter, limit: 20 }],
    queryFn: () => apiRequest("GET", `/api/campaigns?page=${page}&type=${typeFilter}&limit=20`) as Promise<CampaignsData>,
    retry: false,
  });

  const { data: leadsData } = useQuery<LeadsData>({
    queryKey: ["/api/leads", { limit: 1000 }],
    queryFn: () => apiRequest("GET", "/api/leads?limit=1000") as Promise<LeadsData>,
    retry: false,
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/campaigns/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "تم بنجاح",
        description: "تم حذف الحملة بنجاح",
        variant: "default",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "غير مصرح",
          description: "تم تسجيل الخروج. جاري تسجيل الدخول مرة أخرى...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }

      toast({
        title: "خطأ",
        description: "فشل في حذف الحملة",
        variant: "destructive",
      });
    },
  });

  const getCampaignIcon = (type: string) => {
    switch (type) {
      case "whatsapp":
        return <MessageSquare className="w-5 h-5 text-success" />;
      case "email":
        return <Mail className="w-5 h-5 text-primary" />;
      case "sms":
        return <MessageCircle className="w-5 h-5 text-warning" />;
      default:
        return <MessageSquare className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getCampaignTypeBadge = (type: string) => {
    switch (type) {
      case "whatsapp":
        return <Badge className="badge-success">واتساب</Badge>;
      case "email":
        return <Badge className="badge-primary">بريد إلكتروني</Badge>;
      case "sms":
        return <Badge className="badge-warning">رسائل نصية</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getCampaignLeadsCount = (campaignId: number) => {
    if (!leadsData || !leadsData.leads) return 0;
    return leadsData.leads.filter((lead) => lead.campaignId === campaignId).length;
  };

  const handleDeleteCampaign = (campaignId: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الحملة؟")) {
      deleteCampaignMutation.mutate(campaignId);
    }
  };

  const totalPages = campaignsData?.total ? Math.ceil(campaignsData.total / 20) : 1;

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-cairo text-black">حملات الواتساب والتسويق</CardTitle>
            <Button
              onClick={() => setIsNewCampaignModalOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            >
              <Plus className="w-4 h-4 ml-2" />
              إنشاء حملة جديدة
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center space-x-reverse space-x-4 mb-6">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="تصفية حسب النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="whatsapp">واتساب</SelectItem>
                <SelectItem value="email">بريد إلكتروني</SelectItem>
                <SelectItem value="sms">رسائل نصية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campaigns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-reverse space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3 mt-2 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                      <div className="flex justify-between">
                        <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : campaignsData?.campaigns && campaignsData.campaigns.length > 0 ? (
              campaignsData.campaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Campaign Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-reverse space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            {getCampaignIcon(campaign.type)}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                            <p className="text-sm text-gray-500">{formatDate(campaign.createdAt)}</p>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 ml-2" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart3 className="w-4 h-4 ml-2" />
                              تقرير الحملة
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteCampaign(campaign.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 ml-2" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Campaign Type */}
                      <div>
                        {getCampaignTypeBadge(campaign.type)}
                      </div>

                      {/* Campaign Description */}
                      {campaign.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {campaign.description}
                        </p>
                      )}

                      {/* Campaign Message Preview */}
                      {campaign.message && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">نص الرسالة:</p>
                          <p className="text-sm text-gray-700 line-clamp-3">
                            {campaign.message}
                          </p>
                        </div>
                      )}

                      {/* Campaign Stats */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">{getCampaignLeadsCount(campaign.id)}</span> عميل
                        </div>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="w-4 h-4 ml-2" />
                          التقرير
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-black">لا توجد حملات تسويقية</p>
                    <Button
                      onClick={() => setIsNewCampaignModalOpen(true)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm mt-4"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      إنشاء حملة جديدة
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Pagination */}
          {campaignsData?.total && campaignsData.total > 20 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                عرض {((page - 1) * 20) + 1} إلى {Math.min(page * 20, campaignsData.total)} من {campaignsData.total} نتيجة
              </div>
              <div className="flex items-center space-x-reverse space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  السابق
                </Button>
                <div className="flex items-center space-x-reverse space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <Button
                        key={pageNumber}
                        variant={page === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNumber)}
                      >
                        {String(pageNumber)}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <NewCampaignModal
        isOpen={isNewCampaignModalOpen}
        onClose={() => setIsNewCampaignModalOpen(false)}
      />
    </div>
  );
}