'use client';
import { useState } from 'react';
import { getSupabaseClient } from '../../../components/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function NewLeadPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('جديد');
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('leads').insert([{ name, phone, status, source }]);
    setLoading(false);
    if (!error) {
      router.push('/leads');
      router.refresh();
    } else {
      alert('حصل خطأ أثناء إضافة العميل! \n' + error.message); // اطبع رسالة الخطأ
      console.log(error); // اطبع كل تفاصيل الخطأ في الكونسول
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">إضافة عميل جديد</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block mb-1">الاسم</label>
          <input type="text" className="w-full border p-2 rounded" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1">رقم التليفون</label>
          <input type="text" className="w-full border p-2 rounded" value={phone} onChange={e => setPhone(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1">الحالة</label>
          <select className="w-full border p-2 rounded" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="جديد">جديد</option>
            <option value="متصل">متصل</option>
            <option value="مهتم">مهتم</option>
            <option value="غير مهتم">غير مهتم</option>
            <option value="محول">محول</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">المصدر</label>
          <input type="text" className="w-full border p-2 rounded" value={source} onChange={e => setSource(e.target.value)} />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" disabled={loading}>
          {loading ? 'جاري الحفظ...' : 'حفظ العميل'}
        </button>
      </form>
    </main>
  );
}
