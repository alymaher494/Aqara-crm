import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/components/lib/supabaseClient';

// GET - جلب جميع الحملات
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    let query = supabase
      .from('campaigns')
      .select('*', { count: 'exact' });
    
    // تطبيق الفلاتر
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    // تطبيق الصفحات
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data: campaigns, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) {
      console.error('Error fetching campaigns:', error);
      return NextResponse.json({ error: 'فشل في جلب البيانات' }, { status: 500 });
    }
    
    return NextResponse.json({
      campaigns,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
    
  } catch (error) {
    console.error('Error in campaigns API:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// POST - إضافة حملة جديدة
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    
    const { 
      name, 
      type, 
      description, 
      message, 
      status, 
      launchDate 
    } = body;
    
    // التحقق من البيانات المطلوبة
    if (!name || !type) {
      return NextResponse.json({ error: 'اسم الحملة ونوعها مطلوبان' }, { status: 400 });
    }
    
    // التحقق من صحة نوع الحملة
    const validTypes = ['whatsapp', 'email', 'sms'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'نوع الحملة غير صحيح' }, { status: 400 });
    }
    
    const { data: newCampaign, error } = await supabase
      .from('campaigns')
      .insert([{
        name,
        type,
        description,
        message,
        status: status || 'مخططة',
        launch_date: launchDate
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating campaign:', error);
      return NextResponse.json({ error: 'فشل في إضافة الحملة' }, { status: 500 });
    }
    
    return NextResponse.json({ campaign: newCampaign, message: 'تم إضافة الحملة بنجاح' });
    
  } catch (error) {
    console.error('Error in campaigns POST API:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
} 