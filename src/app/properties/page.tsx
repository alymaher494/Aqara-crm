"use client";

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/components/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Property {
  id: string;
  title: string;
  description: string;
  type: string;
  price: number;
  location: string;
  status: string;
  created_at: string;
}

export default function PropertiesPage() {
  const supabase = getSupabaseClient();
  const [properties, setProperties] = useState<Property[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: '',
    price: '',
    location: '',
    status: 'متاح',
  });

  // جلب العقارات
  const fetchProperties = useCallback(async () => {
    const { data } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
    setProperties(data || []);
  }, [supabase]);

  useEffect(() => { fetchProperties(); }, [fetchProperties, showModal]);

  // حفظ عقار جديد أو تعديل
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await supabase.from('properties').update(form).eq('id', editing.id);
    } else {
      await supabase.from('properties').insert([form]);
    }
    setShowModal(false);
    setEditing(null);
    setForm({ title: '', description: '', type: '', price: '', location: '', status: 'متاح' });
  };

  // فتح المودال للتعديل
  const handleEdit = (property: Property) => {
    setEditing(property);
    setForm({
      title: property.title || '',
      description: property.description || '',
      type: property.type || '',
      price: property.price.toString() || '',
      location: property.location || '',
      status: property.status || 'متاح',
    });
    setShowModal(true);
  };

  // حذف عقار
  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العقار؟')) return;
    await supabase.from('properties').delete().eq('id', id);
    setProperties(props => props.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-heading">إدارة العقارات</h1>
          <p className="text-muted-foreground">عرض وإدارة جميع العقارات المتاحة</p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => { setShowModal(true); setEditing(null); setForm({ title: '', description: '', type: '', price: '', location: '', status: 'متاح' }); }}
        >
          إضافة عقار جديد
        </Button>
      </div>

      {/* Main Content */}
      <div className="bg-card shadow rounded-lg border border-border">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h3 className="text-lg leading-6 font-medium text-heading">العقارات المتاحة</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                قائمة بجميع العقارات المسجلة في النظام
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">العقار</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">النوع</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">السعر</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">الموقع</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">الحالة</th>
                        <th className="relative px-6 py-3"><span className="sr-only">إجراءات</span></th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {properties && properties.length > 0 ? (
                        properties.map((property) => (
                          <tr key={property.id} className="hover:bg-muted/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                    <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                  </div>
                                </div>
                                <div className="mr-4">
                                  <div className="text-sm font-medium text-heading">{property.title || 'عقار بدون عنوان'}</div>
                                  <div className="text-sm text-muted-foreground">{property.description || 'لا يوجد وصف'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{property.type || 'غير محدد'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{property.price ? `${property.price} جنيه` : 'غير محدد'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{property.location || 'غير محدد'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${property.status === 'متاح' ? 'bg-success/10 text-success' : property.status === 'مؤجر' ? 'bg-error/10 text-error' : 'bg-muted text-muted-foreground'}`}>{property.status || 'غير محدد'}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(property)}>تعديل</Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(property.id)}>حذف</Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <div className="text-muted-foreground">
                              <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <h3 className="mt-2 text-sm font-medium text-heading">لا توجد عقارات</h3>
                              <p className="mt-1 text-sm text-muted-foreground">ابدأ بإضافة عقار جديد</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal إضافة/تعديل عقار */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-6 w-full max-w-xl shadow-lg relative border border-border">
            <h2 className="text-xl font-bold mb-4">{editing ? "تعديل عقار" : "إضافة عقار جديد"}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block mb-1">العنوان *</label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div>
                <label className="block mb-1">الوصف</label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="block mb-1">النوع</label>
                <Input value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} />
              </div>
              <div>
                <label className="block mb-1">السعر</label>
                <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
              </div>
              <div>
                <label className="block mb-1">الموقع</label>
                <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div>
                <label className="block mb-1">الحالة</label>
                <select className="w-full border border-border rounded px-2 py-1 bg-background text-foreground" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="متاح">متاح</option>
                  <option value="مؤجر">مؤجر</option>
                  <option value="غير محدد">غير محدد</option>
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