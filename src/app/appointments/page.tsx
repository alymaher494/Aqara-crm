'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Calendar, MapPin, User, Clock, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Appointment {
  id: string;
  title: string;
  description: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  assigned_to: string;
  lead_id: string | null;
  lead: { name: string; phone: string } | null;
  property_id: string | null;
  property: { title: string; location: string } | null;
  notes?: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    appointmentDate: '',
    appointmentTime: '',
    status: 'مجدول',
    assignedTo: '',
    leadId: '',
    propertyId: '',
    notes: ''
  });

  const fetchAppointments = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (dateFilter) params.append('date', dateFilter);

      const response = await fetch(`/api/appointments?${params}`);
      const data = await response.json();

      if (response.ok) {
        setAppointments(data.appointments || []);
      } else {
        console.error('Error fetching appointments:', data.error);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, dateFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('add appointment result:', { data });

      if (response.ok) {
        setShowAddModal(false);
        setFormData({
          title: '',
          description: '',
          appointmentDate: '',
          appointmentTime: '',
          status: 'مجدول',
          assignedTo: '',
          leadId: '',
          propertyId: '',
          notes: ''
        });
        fetchAppointments();
      } else {
        alert(data.error || 'حدث خطأ أثناء إضافة الموعد');
      }
    } catch (error) {
      console.error('Error adding appointment:', error);
      alert('حدث خطأ في الاتصال بالخادم');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'مجدول':
        return 'bg-blue-100 text-blue-800';
      case 'مكتمل':
        return 'bg-green-100 text-green-800';
      case 'ملغي':
        return 'bg-red-100 text-red-800';
      case 'قيد التنفيذ':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    return status;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة المواعيد</h1>
          <p className="text-gray-600 mt-2">إدارة مواعيد العملاء والمعاينات</p>
        </div>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 ml-2" />
              إضافة موعد جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إضافة موعد جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAppointment} className="space-y-4">
              <div>
                <Label htmlFor="title">عنوان الموعد</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">الوصف</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appointmentDate">التاريخ</Label>
                  <Input
                    id="appointmentDate"
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="appointmentTime">الوقت</Label>
                  <Input
                    id="appointmentTime"
                    type="time"
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">الحالة</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="مجدول">مجدول</SelectItem>
                    <SelectItem value="قيد التنفيذ">قيد التنفيذ</SelectItem>
                    <SelectItem value="مكتمل">مكتمل</SelectItem>
                    <SelectItem value="ملغي">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="assignedTo">المسؤول</Label>
                <Input
                  id="assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2 space-x-reverse">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  إلغاء
                </Button>
                <Button type="submit">إضافة الموعد</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث في المواعيد..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="مجدول">مجدول</SelectItem>
                <SelectItem value="قيد التنفيذ">قيد التنفيذ</SelectItem>
                <SelectItem value="مكتمل">مكتمل</SelectItem>
                <SelectItem value="ملغي">ملغي</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="فلترة بالتاريخ"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المواعيد ({appointments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-3 px-4 font-medium text-gray-700">العنوان</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">العميل</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">العقار</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">التاريخ والوقت</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">الحالة</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">المسؤول</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{appointment.title}</div>
                        <div className="text-sm text-gray-500">{appointment.description}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{appointment.lead?.name || 'غير محدد'}</div>
                          <div className="text-sm text-gray-500">{appointment.lead?.phone || 'لا يوجد رقم'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{appointment.property?.title || 'غير محدد'}</div>
                          <div className="text-sm text-gray-500">{appointment.property?.location || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{formatDate(appointment.appointment_date)}</div>
                          <div className="text-sm text-gray-500">{formatTime(appointment.appointment_time)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(appointment.status)}>
                        {getStatusText(appointment.status)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-gray-900">{appointment.assigned_to}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Button
                          onClick={() => { }}
                          className="hover:bg-gray-100 p-2"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => { }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">مواعيد اليوم</h3>
                <p className="text-sm text-gray-600">{appointments.filter(apt => apt.appointment_date === new Date().toISOString().split('T')[0]).length} مواعيد</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">مواعيد مكتملة</h3>
                <p className="text-sm text-gray-600">{appointments.filter(apt => apt.status === 'مكتمل').length} مواعيد</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">مواعيد معلقة</h3>
                <p className="text-sm text-gray-600">{appointments.filter(apt => apt.status === 'مجدول').length} مواعيد</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}