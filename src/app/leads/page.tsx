'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Users, Plus, Search, Filter, AlertCircle } from 'lucide-react';
import { useAuth } from '@/components/hooks/useAuth';
import { toast } from 'sonner';

interface Lead {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  status: string;
  source: string;
  notes: string;
  assigned_to?: string;
  created_at: string;
}

export default function LeadsTable() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLeads = useCallback(async () => {
    try {
      console.log('Fetching leads...');
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/leads?${params}`);
      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Leads data:', data);
      setLeads(data.leads || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError(err instanceof Error ? err.message : 'خطأ غير معروف');
      setLeads([]); // في حالة الخطأ، اجعل المصفوفة فارغة
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    console.log('LeadsTable mounted, user:', user);
    fetchLeads();
  }, [user, searchTerm, statusFilter, fetchLeads]);

  const openAddModal = () => {
    setNewLeadName('');
    setNewLeadPhone('');
    setNewLeadEmail('');
    setShowAddModal(true);
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName || !newLeadPhone) {
      toast.error('يرجى إدخال الاسم ورقم الهاتف');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newLeadName,
          phone: newLeadPhone,
          email: newLeadEmail,
          status: 'جديد',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في إضافة العميل');
      }

      const data = await response.json();
      setLeads([data.lead, ...leads]);
      setShowAddModal(false);
      toast.success('تم إضافة العميل بنجاح!');
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'حدث خطأ غير معروف');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'جديد': return 'badge-new';
      case 'مهتم': return 'badge-in-progress';
      case 'مغلق': return 'badge-cancelled';
      default: return 'badge-pending';
    }
  };

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-heading">جاري التحميل...</h2>
          <p className="text-muted-foreground">يرجى الانتظار حتى يتم تفعيل النظام</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-heading">خطأ في تحميل البيانات</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchLeads} className="btn-primary">
            إعادة المحاولة
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            يمكنك أيضاً زيارة: <a href="/api/test-db" className="text-primary underline">اختبار قاعدة البيانات</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-heading">العملاء المحتملين</h1>
          <p className="text-muted-foreground mt-1">
            إدارة وتتبع العملاء المحتملين - {user.name}
          </p>
        </div>
        <Button onClick={openAddModal} className="btn-primary">
          <Plus className="w-4 h-4 ml-2" />
          إضافة عميل جديد
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="البحث في العملاء..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full pl-10 pr-4"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="select pl-10 pr-8"
              >
                <option value="all">جميع الحالات</option>
                <option value="جديد">جديد</option>
                <option value="مهتم">مهتم</option>
                <option value="مغلق">مغلق</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي العملاء</p>
                <p className="text-2xl font-bold text-heading">{leads.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">عملاء جدد</p>
                <p className="text-2xl font-bold text-primary">
                  {leads.filter(l => l.status === 'جديد').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-sm">ج</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مهتم</p>
                <p className="text-2xl font-bold text-success">
                  {leads.filter(l => l.status === 'مهتم').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                <span className="text-success font-bold text-sm">م</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مغلق</p>
                <p className="text-2xl font-bold text-muted-foreground">
                  {leads.filter(l => l.status === 'مغلق').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <span className="text-muted-foreground font-bold text-sm">غ</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة العملاء ({leads.length} عميل)</CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا يوجد عملاء حتى الآن</p>
              <Button onClick={openAddModal} className="mt-4 btn-outline">
                إضافة أول عميل
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="text-right p-3 font-semibold">الاسم</th>
                    <th className="text-right p-3 font-semibold">الهاتف</th>
                    <th className="text-right p-3 font-semibold">البريد الإلكتروني</th>
                    <th className="text-right p-3 font-semibold">الحالة</th>
                    <th className="text-right p-3 font-semibold">المصدر</th>
                    <th className="text-right p-3 font-semibold">تاريخ الإنشاء</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td className="p-3">
                        <div className="font-medium text-heading">{lead.full_name}</div>
                        {lead.notes && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {lead.notes}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-text">{lead.phone}</td>
                      <td className="p-3 text-text">{lead.email || 'غير محدد'}</td>
                      <td className="p-3">
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-text">{lead.source || 'غير محدد'}</td>
                      <td className="p-3 text-text">
                        {new Date(lead.created_at).toLocaleDateString('ar-EG')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Lead Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إضافة عميل جديد</DialogTitle>
            <div className="text-sm text-muted-foreground">
              أدخل بيانات العميل الجديد أدناه. الحقول المميزة بعلامة * مطلوبة.
            </div>
          </DialogHeader>
          <form onSubmit={handleSaveLead} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">اسم العميل *</label>
              <Input
                id="name"
                value={newLeadName}
                onChange={(e) => setNewLeadName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">رقم الهاتف *</label>
              <Input
                id="phone"
                value={newLeadPhone}
                onChange={(e) => setNewLeadPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">البريد الإلكتروني</label>
              <Input
                id="email"
                type="email"
                value={newLeadEmail}
                onChange={(e) => setNewLeadEmail(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Debug info (will be removed later) */}
      <div className="text-center text-sm text-muted-foreground">
        <p>آخر تحديث: {new Date().toLocaleTimeString('ar-EG')}</p>
        <p>عدد العملاء: {leads.length}</p>
      </div>
    </div>
  );
}