import { createClient } from '@supabase/supabase-js';

// إعداد عميل Supabase (تأكد من ضبط المفاتيح حسب مشروعك)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

// حفظ إعدادات مطابقة الأعمدة لشركة معينة
export async function saveColumnMapping(companyId: string, mapping: Record<string, string | null>) {
  // تحقق إذا كان هناك mapping سابق
  const { data: existing } = await supabase
    .from('column_mappings')
    .select('id')
    .eq('company_id', companyId)
    .single();

  if (existing) {
    // تحديث
    return supabase
      .from('column_mappings')
      .update({ mapping, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    // إضافة جديد
    return supabase
      .from('column_mappings')
      .insert([{ company_id: companyId, mapping }]);
  }
}

// جلب آخر إعدادات مطابقة الأعمدة لشركة معينة
export async function getColumnMapping(companyId: string): Promise<Record<string, string | null> | null> {
  const { data } = await supabase
    .from('column_mappings')
    .select('mapping')
    .eq('company_id', companyId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  return data?.mapping || null;
}

// مثال استخدام:
// const mapping = await getColumnMapping(companyId);
// await saveColumnMapping(companyId, { 'رقم العميل': 'full_name', 'الموبايل': 'phone' }); 