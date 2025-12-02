import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/components/lib/supabaseClient';

// GET - جلب جميع المشاريع
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const location = searchParams.get('location');
    const search = searchParams.get('search');
    
    let query = supabase
      .from('projects')
      .select('*', { count: 'exact' });
    
    // تطبيق الفلاتر
    if (status) {
      query = query.eq('status', status);
    }
    
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,developer.ilike.%${search}%`);
    }
    
    // تطبيق الصفحات
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data: projects, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json({ error: 'فشل في جلب البيانات' }, { status: 500 });
    }
    
    return NextResponse.json({
      projects,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
    
  } catch (error) {
    console.error('Error in projects API:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// POST - إضافة مشروع جديد
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    
    const { 
      name, 
      description, 
      location, 
      developer, 
      totalUnits, 
      availableUnits, 
      startingPrice, 
      status, 
      images 
    } = body;
    
    // التحقق من البيانات المطلوبة
    if (!name || !location || !developer) {
      return NextResponse.json({ error: 'اسم المشروع والموقع والمطور مطلوبون' }, { status: 400 });
    }
    
    const { data: newProject, error } = await supabase
      .from('projects')
      .insert([{
        name,
        description,
        location,
        developer,
        total_units: totalUnits ? parseInt(totalUnits) : null,
        available_units: availableUnits ? parseInt(availableUnits) : null,
        starting_price: startingPrice ? parseFloat(startingPrice) : null,
        status: status || 'قيد الإنشاء',
        images: images || []
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating project:', error);
      return NextResponse.json({ error: 'فشل في إضافة المشروع' }, { status: 500 });
    }
    
    return NextResponse.json({ project: newProject, message: 'تم إضافة المشروع بنجاح' });
    
  } catch (error) {
    console.error('Error in projects POST API:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
} 