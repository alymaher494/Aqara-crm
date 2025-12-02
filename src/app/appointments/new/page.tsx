'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/components/lib/supabaseClient';

interface Lead {
  id: string;
  name: string;
  phone: string;
}

interface Property {
  id: string;
  title: string;
  location: string;
}

export default function NewAppointmentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    lead_id: '',
    property_id: '',
    appointment_date: '',
    appointment_time: '',
    appointment_type: '',
    status: 'في الانتظار',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    // جلب العملاء والعقارات عند تحميل الصفحة
    const fetchData = async () => {
      const supabase = getSupabaseClient();

      // جلب العملاء
      const { data: leadsData } = await supabase
        .from('leads')
        .select('id, name, phone')
        .order('name');

      // جلب العقارات
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('id, title, location')
        .order('title');

      if (leadsData) setLeads(leadsData);
      if (propertiesData) setProperties(propertiesData);
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = getSupabaseClient();

      // دمج التاريخ والوقت
      const appointmentDateTime = `${formData.appointment_date}T${formData.appointment_time}`;

      const { error } = await supabase
        .from('appointments')
        .insert([{
          lead_id: formData.lead_id,
          property_id: formData.property_id,
          appointment_date: appointmentDateTime,
          appointment_type: formData.appointment_type,
          status: formData.status,
          notes: formData.notes
        }]);

      if (!error) {
        router.push('/appointments');
        router.refresh();
      } else {
        alert('حصل خطأ أثناء إضافة الموعد! \n' + error.message);
      }
    } catch (error) {
      console.error('Error adding appointment:', error);
      alert('حصل خطأ أثناء إضافة الموعد!');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إضافة موعد جديد</h1>
              <p className="text-gray-600">جدولة موعد جديد مع العميل</p>
            </div>
            <button
              onClick={() => router.back()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              رجوع
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* العميل والعقار */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="lead_id" className="block text-sm font-medium text-gray-700">
                    العميل *
                  </label>
                  <select
                    name="lead_id"
                    id="lead_id"
                    required
                    value={formData.lead_id}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">اختر العميل</option>
                    {leads.map((lead) => (
                      <option key={lead.id} value={lead.id}>
                        {lead.name} - {lead.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="property_id" className="block text-sm font-medium text-gray-700">
                    العقار *
                  </label>
                  <select
                    name="property_id"
                    id="property_id"
                    required
                    value={formData.property_id}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">اختر العقار</option>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.title} - {property.location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* التاريخ والوقت */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="appointment_date" className="block text-sm font-medium text-gray-700">
                    التاريخ *
                  </label>
                  <input
                    type="date"
                    name="appointment_date"
                    id="appointment_date"
                    required
                    value={formData.appointment_date}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="appointment_time" className="block text-sm font-medium text-gray-700">
                    الوقت *
                  </label>
                  <input
                    type="time"
                    name="appointment_time"
                    id="appointment_time"
                    required
                    value={formData.appointment_time}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* نوع الموعد والحالة */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="appointment_type" className="block text-sm font-medium text-gray-700">
                    نوع الموعد *
                  </label>
                  <select
                    name="appointment_type"
                    id="appointment_type"
                    required
                    value={formData.appointment_type}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">اختر نوع الموعد</option>
                    <option value="عرض عقار">عرض عقار</option>
                    <option value="مفاوضات">مفاوضات</option>
                    <option value="توقيع عقد">توقيع عقد</option>
                    <option value="استلام مفاتيح">استلام مفاتيح</option>
                    <option value="متابعة">متابعة</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    حالة الموعد
                  </label>
                  <select
                    name="status"
                    id="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="في الانتظار">في الانتظار</option>
                    <option value="مؤكد">مؤكد</option>
                    <option value="ملغي">ملغي</option>
                    <option value="مكتمل">مكتمل</option>
                  </select>
                </div>
              </div>

              {/* الملاحظات */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  الملاحظات
                </label>
                <textarea
                  name="notes"
                  id="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="أي ملاحظات إضافية حول الموعد..."
                />
              </div>

              {/* أزرار الحفظ والإلغاء */}
              <div className="flex justify-end space-x-3 space-x-reverse">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'جاري الحفظ...' : 'حفظ الموعد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 