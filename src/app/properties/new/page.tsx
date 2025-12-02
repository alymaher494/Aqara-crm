'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/components/lib/supabaseClient';

export default function NewPropertyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    price: '',
    location: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    status: 'متاح',
    features: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from('properties')
        .insert([{
          title: formData.title,
          description: formData.description,
          type: formData.type,
          price: parseFloat(formData.price) || 0,
          location: formData.location,
          area: parseFloat(formData.area) || 0,
          bedrooms: parseInt(formData.bedrooms) || 0,
          bathrooms: parseInt(formData.bathrooms) || 0,
          status: formData.status,
          features: formData.features
        }]);

      if (!error) {
        router.push('/properties');
        router.refresh();
      } else {
        alert('حصل خطأ أثناء إضافة العقار! \n' + error.message);
      }
    } catch (error) {
      console.error('Error adding property:', error);
      alert('حصل خطأ أثناء إضافة العقار!');
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
              <h1 className="text-3xl font-bold text-gray-900">إضافة عقار جديد</h1>
              <p className="text-gray-600">إضافة عقار جديد للنظام</p>
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
              {/* العنوان والوصف */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    عنوان العقار *
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="مثال: شقة في المعادي"
                  />
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    نوع العقار *
                  </label>
                  <select
                    name="type"
                    id="type"
                    required
                    value={formData.type}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">اختر نوع العقار</option>
                    <option value="شقة">شقة</option>
                    <option value="فيلا">فيلا</option>
                    <option value="دوبلكس">دوبلكس</option>
                    <option value="مكتب">مكتب</option>
                    <option value="محل">محل</option>
                    <option value="مستودع">مستودع</option>
                    <option value="أرض">أرض</option>
                  </select>
                </div>
              </div>

              {/* الوصف */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  وصف العقار
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="وصف تفصيلي للعقار..."
                />
              </div>

              {/* السعر والموقع */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    السعر (جنيه مصري)
                  </label>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="مثال: 500000"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    الموقع
                  </label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="مثال: المعادي، القاهرة"
                  />
                </div>
              </div>

              {/* المساحة والغرف */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label htmlFor="area" className="block text-sm font-medium text-gray-700">
                    المساحة (متر مربع)
                  </label>
                  <input
                    type="number"
                    name="area"
                    id="area"
                    value={formData.area}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="مثال: 120"
                  />
                </div>

                <div>
                  <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">
                    عدد غرف النوم
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    id="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="مثال: 3"
                  />
                </div>

                <div>
                  <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">
                    عدد الحمامات
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    id="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="مثال: 2"
                  />
                </div>
              </div>

              {/* الحالة والمميزات */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    حالة العقار
                  </label>
                  <select
                    name="status"
                    id="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="متاح">متاح</option>
                    <option value="مؤجر">مؤجر</option>
                    <option value="مباع">مباع</option>
                    <option value="تحت الصيانة">تحت الصيانة</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="features" className="block text-sm font-medium text-gray-700">
                    المميزات
                  </label>
                  <input
                    type="text"
                    name="features"
                    id="features"
                    value={formData.features}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="مثال: مكيف، مصعد، جراج"
                  />
                </div>
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
                  {loading ? 'جاري الحفظ...' : 'حفظ العقار'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 