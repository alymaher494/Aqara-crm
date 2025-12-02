'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, MapPin, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';


interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hire_date: string;
  salary: number;
  status: string;
  avatar_url?: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  // const [showEditModal, setShowEditModal] = useState(false);
  // const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    salary: ''
  });

  const fetchEmployees = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (departmentFilter) params.append('department', departmentFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/employees?${params}`);
      const data = await response.json();

      if (response.ok) {
        setEmployees(data.employees || []);
      } else {
        console.error('Error fetching employees:', data.error);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, departmentFilter, statusFilter]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('add employee result:', { data });

      if (response.ok) {
        setShowAddModal(false);
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          position: '',
          department: '',
          salary: ''
        });
        fetchEmployees();
      } else {
        alert(data.error || 'حدث خطأ أثناء إضافة الموظف');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('حدث خطأ في الاتصال بالخادم');
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    // setSelectedEmployee(employee);
    setFormData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      phone: employee.phone || '',
      position: employee.position || '',
      department: employee.department || '',
      salary: employee.salary?.toString() || ''
    });
    // setShowEditModal(true);
    alert("تعديل الموظف غير متاح حالياً");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'badge-success';
      case 'inactive':
        return 'badge-error';
      case 'suspended':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'inactive':
        return 'غير نشط';
      case 'suspended':
        return 'معلق';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-heading">إدارة الموظفين</h1>
          <p className="text-muted-foreground mt-2">إدارة موظفي الشركة والصلاحيات</p>
        </div>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button className="btn-primary">
              <Plus className="w-4 h-4 ml-2" />
              إضافة موظف جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-heading">إضافة موظف جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name" className="text-text">الاسم الأول</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                    className="input"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name" className="text-text">الاسم الأخير</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                    className="input"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="text-text">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="input"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-text">رقم الهاتف</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position" className="text-text">المنصب</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <Label htmlFor="department" className="text-text">القسم</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                    <SelectTrigger className="select">
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="المبيعات">المبيعات</SelectItem>
                      <SelectItem value="التسويق">التسويق</SelectItem>
                      <SelectItem value="الإدارة">الإدارة</SelectItem>
                      <SelectItem value="المالية">المالية</SelectItem>
                      <SelectItem value="الموارد البشرية">الموارد البشرية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="salary" className="text-text">الراتب</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  className="input"
                />
              </div>
              <div className="flex justify-end space-x-2 space-x-reverse">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="btn-ghost">
                  إلغاء
                </Button>
                <Button type="submit" className="btn-primary">إضافة الموظف</Button>
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
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="البحث في الموظفين..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 input"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="select">
                <SelectValue placeholder="جميع الأقسام" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">جميع الأقسام</SelectItem>
                <SelectItem value="المبيعات">المبيعات</SelectItem>
                <SelectItem value="التسويق">التسويق</SelectItem>
                <SelectItem value="الإدارة">الإدارة</SelectItem>
                <SelectItem value="المالية">المالية</SelectItem>
                <SelectItem value="الموارد البشرية">الموارد البشرية</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="select">
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
                <SelectItem value="suspended">معلق</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الموظفين ({employees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-right py-3 px-4 font-medium text-text">الموظف</th>
                  <th className="text-right py-3 px-4 font-medium text-text">المنصب</th>
                  <th className="text-right py-3 px-4 font-medium text-text">القسم</th>
                  <th className="text-right py-3 px-4 font-medium text-text">الحالة</th>
                  <th className="text-right py-3 px-4 font-medium text-text">تاريخ التعيين</th>
                  <th className="text-right py-3 px-4 font-medium text-text">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-muted/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-heading">
                            {employee.first_name} {employee.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-text">{employee.position}</td>
                    <td className="py-4 px-4 text-text">{employee.department}</td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(employee.status)}>
                        {getStatusText(employee.status)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-text">
                      {new Date(employee.hire_date).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditEmployee(employee)}
                          className="btn-ghost"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-error hover:text-error-dark btn-ghost"
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
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-heading">الحضور والانصراف</h3>
                <p className="text-sm text-muted-foreground">إدارة سجلات الحضور</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-heading">ساعات العمل</h3>
                <p className="text-sm text-muted-foreground">تتبع ساعات العمل</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-heading">الصلاحيات</h3>
                <p className="text-sm text-muted-foreground">إدارة صلاحيات الموظفين</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}