"use client";

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/components/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MapPin, Search, DollarSign, Plus, Users } from 'lucide-react';

const formatNumber = (num: number) => new Intl.NumberFormat('ar-EG').format(num);

interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  developer: string;
  total_units: number;
  available_units: number;
  starting_price: number;
  status: string;
  created_at: string;
}

export default function ProjectsPage() {
  const supabase = getSupabaseClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    location: '',
    developer: '',
    total_units: '',
    available_units: '',
    starting_price: '',
    status: 'قيد الإنشاء',
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  // جلب المشاريع
  const fetchProjects = useCallback(async () => {
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    setProjects(data || []);
  }, [supabase]);

  useEffect(() => { fetchProjects(); }, [fetchProjects, showModal]);

  // حفظ مشروع جديد أو تعديل
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await supabase.from('projects').update(form).eq('id', editing.id);
    } else {
      await supabase.from('projects').insert([form]);
    }
    setShowModal(false);
    setEditing(null);
    setForm({ name: '', description: '', location: '', developer: '', total_units: '', available_units: '', starting_price: '', status: 'قيد الإنشاء' });
  };

  // فتح المودال للتعديل
  const handleEdit = (project: Project) => {
    setEditing(project);
    setForm({
      name: project.name || '',
      description: project.description || '',
      location: project.location || '',
      developer: project.developer || '',
      total_units: project.total_units || '',
      available_units: project.available_units || '',
      starting_price: project.starting_price || '',
      status: project.status || 'قيد الإنشاء',
    });
    setShowModal(true);
  };

  // حذف مشروع
  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المشروع؟')) return;
    await supabase.from('projects').delete().eq('id', id);
    setProjects(projs => projs.filter(p => p.id !== id));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'قيد الإنشاء':
        return <Badge className="bg-blue-100 text-blue-800">قيد الإنشاء</Badge>;
      case 'جاهز للتسليم':
        return <Badge className="bg-green-100 text-green-800">جاهز للتسليم</Badge>;
      case 'مكتمل':
        return <Badge className="bg-purple-100 text-purple-800">مكتمل</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredProjects = projects.filter((project: Project) => {
    const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.description?.toLowerCase().includes(search.toLowerCase()) ||
      project.location?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || project.location === locationFilter;
    return matchesSearch && matchesStatus && matchesLocation;
  });

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-heading">المشاريع العقارية</h1>
        <p className="mt-2 text-muted-foreground">إدارة المشاريع العقارية والمجمعات السكنية</p>
      </div>
      {/* Filters and Search */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="بحث في المشاريع..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 bg-background text-foreground"
          >
            <option value="all">كل الحالات</option>
            <option value="قيد الإنشاء">قيد الإنشاء</option>
            <option value="جاهز للتسليم">جاهز للتسليم</option>
            <option value="مكتمل">مكتمل</option>
          </select>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 bg-background text-foreground"
          >
            <option value="all">كل المواقع</option>
            <option value="العاصمة الجديدة">العاصمة الجديدة</option>
            <option value="المعادي، القاهرة">المعادي</option>
            <option value="الشيخ زايد، الجيزة">الشيخ زايد</option>
          </select>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => { setShowModal(true); setEditing(null); setForm({ name: '', description: '', location: '', developer: '', total_units: '', available_units: '', starting_price: '', status: 'قيد الإنشاء' }); }}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة مشروع جديد
        </Button>
      </div>
      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project: Project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-reverse space-x-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
                  </div>
                  {getStatusBadge(project.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm line-clamp-3">
                  {project.description || 'لا يوجد وصف للمشروع'}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-reverse space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{project.location}</span>
                  </div>
                  <div className="flex items-center space-x-reverse space-x-2 text-sm">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{project.developer}</span>
                  </div>
                  <div className="flex items-center space-x-reverse space-x-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">
                      {project.available_units} / {project.total_units} وحدة متاحة
                    </span>
                  </div>
                  {project.starting_price && (
                    <div className="flex items-center space-x-reverse space-x-2 text-sm">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">
                        يبدأ من {formatNumber(project.starting_price)} جنيه
                      </span>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    تم الإنشاء: {new Date(project.created_at).toLocaleDateString('ar-EG')}
                  </span>
                  <div className="flex gap-2">
                    <Button className="border border-border bg-background text-foreground hover:bg-muted px-3 py-1 text-sm" onClick={() => handleEdit(project)}>
                      تعديل
                    </Button>
                    <Button className="border border-error/30 bg-background text-error hover:bg-error/10 px-3 py-1 text-sm" onClick={() => handleDelete(project.id)}>
                      حذف
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-heading mb-2">لا توجد مشاريع</h3>
          <p className="text-muted-foreground mb-6">
            {search || statusFilter !== 'all' || locationFilter !== 'all'
              ? 'لا توجد مشاريع تطابق معايير البحث المحددة'
              : 'ابدأ بإضافة مشروع جديد'
            }
          </p>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => { setShowModal(true); setEditing(null); setForm({ name: '', description: '', location: '', developer: '', total_units: '', available_units: '', starting_price: '', status: 'قيد الإنشاء' }); }}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة مشروع جديد
          </Button>
        </div>
      )}
      {/* Modal إضافة/تعديل مشروع */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-6 w-full max-w-xl shadow-lg relative border border-border">
            <h2 className="text-xl font-bold mb-4">{editing ? "تعديل مشروع" : "إضافة مشروع جديد"}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block mb-1">اسم المشروع *</label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="block mb-1">الوصف</label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="block mb-1">الموقع</label>
                <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div>
                <label className="block mb-1">المطور</label>
                <Input value={form.developer} onChange={e => setForm(f => ({ ...f, developer: e.target.value }))} />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block mb-1">إجمالي الوحدات</label>
                  <Input type="number" value={form.total_units} onChange={e => setForm(f => ({ ...f, total_units: e.target.value }))} />
                </div>
                <div className="flex-1">
                  <label className="block mb-1">الوحدات المتاحة</label>
                  <Input type="number" value={form.available_units} onChange={e => setForm(f => ({ ...f, available_units: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block mb-1">سعر البداية</label>
                <Input type="number" value={form.starting_price} onChange={e => setForm(f => ({ ...f, starting_price: e.target.value }))} />
              </div>
              <div>
                <label className="block mb-1">الحالة</label>
                <select className="w-full border border-border rounded px-2 py-1 bg-background text-foreground" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="قيد الإنشاء">قيد الإنشاء</option>
                  <option value="جاهز للتسليم">جاهز للتسليم</option>
                  <option value="مكتمل">مكتمل</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button type="submit" className="bg-primary text-primary-foreground">حفظ</Button>
                <Button type="button" variant="ghost" onClick={() => { setShowModal(false); setEditing(null); }}>إلغاء</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 