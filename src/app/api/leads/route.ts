import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/components/lib/supabaseClient';

// GET - جلب جميع العملاء
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');
    const search = searchParams.get('search');

    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' });

    // تطبيق الفلاتر
    if (status) {
      query = query.eq('status', status);
    }

    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // تطبيق الصفحات
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: leads, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching leads:', error);
      return NextResponse.json({ error: 'فشل في جلب البيانات' }, { status: 500 });
    }

    return NextResponse.json({
      leads,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });

  } catch (error) {
    console.error('Error in leads API:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// POST - إضافة عميل جديد
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();

    const { name, phone, email, source, status, assignedTo, notes, campaignId } = body;

    // التحقق من البيانات المطلوبة
    if (!name || !phone) {
      return NextResponse.json({ error: 'الاسم ورقم الهاتف مطلوبان' }, { status: 400 });
    }

    // التحقق من عدم تكرار رقم الهاتف
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('phone', phone)
    if (existingLead) {
      return NextResponse.json({ error: 'رقم الهاتف مسجل مسبقاً' }, { status: 400 });
    }

    const { data: newLead, error } = await supabase
      .from('leads')
      .insert([{
        full_name: name,
        phone,
        email,
        source,
        status: status || 'جديد',
        assigned_to: assignedTo,
        notes,
        campaign_id: campaignId,
        company_id: '11111111-1111-1111-1111-111111111111' // Temporary hardcoded company_id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating lead:', error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    return NextResponse.json({ lead: newLead, message: 'تم إضافة العميل بنجاح' });

  } catch (error: any) {
    console.error('Error in leads POST API:', error);
    return NextResponse.json({ error: error.message || 'خطأ في الخادم' }, { status: 500 });
  }
}