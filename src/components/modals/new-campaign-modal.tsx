import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/components/lib/queryClient";
import { useToast } from "@/components/hooks/use-toast";
import { isUnauthorizedError } from "@/components/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface NewCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewCampaignModal({ isOpen, onClose }: NewCampaignModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    type: "whatsapp",
    description: "",
    message: "",
    selectedLeads: [] as number[],
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/campaigns", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء الحملة بنجاح",
      });
      handleClose();
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
        description: "فشل في إنشاء الحملة",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setFormData({
      name: "",
      type: "whatsapp",
      description: "",
      message: "",
      selectedLeads: [],
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم الحملة",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.message.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال نص الرسالة",
        variant: "destructive",
      });
      return;
    }

    createCampaignMutation.mutate(formData);
  };

  const handleLeadToggle = (leadId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedLeads: prev.selectedLeads.includes(leadId)
        ? prev.selectedLeads.filter(id => id !== leadId)
        : [...prev.selectedLeads, leadId]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="font-cairo">إنشاء حملة تسويقية جديدة</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campaign Name */}
            <div className="space-y-2">
              <Label htmlFor="name">اسم الحملة *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="أدخل اسم الحملة"
                required
              />
            </div>

            {/* Campaign Type */}
            <div className="space-y-2">
              <Label htmlFor="type">نوع الحملة</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">واتساب</SelectItem>
                  <SelectItem value="email">بريد إلكتروني</SelectItem>
                  <SelectItem value="sms">رسائل نصية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">وصف الحملة</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="أدخل وصف الحملة (اختياري)"
              rows={3}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">نص الرسالة *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="أدخل نص الرسالة التي سيتم إرسالها"
              rows={4}
              required
            />
            <p className="text-xs text-gray-500">
              يمكنك استخدام المتغيرات: {"{name}"}, {"{phone}"}, {"{email}"}
            </p>
          </div>

          {/* Lead Selection */}
          <div className="space-y-2">
            <Label>اختيار العملاء</Label>
            <div className="border rounded-lg p-4">
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {/* Mock leads data - replace with actual data */}
                  {[
                    { id: 1, name: "أحمد محمد", phone: "+966501234567", email: "ahmed@example.com" },
                    { id: 2, name: "فاطمة علي", phone: "+966507654321", email: "fatima@example.com" },
                    { id: 3, name: "محمد عبدالله", phone: "+966509876543", email: "mohammed@example.com" },
                    { id: 4, name: "سارة أحمد", phone: "+966501112223", email: "sara@example.com" },
                    { id: 5, name: "علي حسن", phone: "+966504445556", email: "ali@example.com" },
                  ].map((lead) => (
                    <div key={lead.id} className="flex items-center space-x-reverse space-x-3 p-2 hover:bg-gray-50 rounded">
                      <Checkbox
                        checked={formData.selectedLeads.includes(lead.id)}
                        onCheckedChange={() => handleLeadToggle(lead.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{lead.name}</p>
                        <p className="text-xs text-gray-500">{lead.phone} • {lead.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <p className="text-xs text-gray-500">
              تم اختيار {formData.selectedLeads.length} عميل
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-reverse space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              إلغاء
            </Button>
            <Button 
              type="submit" 
              disabled={createCampaignMutation.isPending}
            >
              {createCampaignMutation.isPending ? "جاري الإنشاء..." : "إنشاء الحملة"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 