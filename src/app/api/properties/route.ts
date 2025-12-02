import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/components/lib/supabaseClient';

// GET - جلب جميع العقارات
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const location = searchParams.get('location');
    const search = searchParams.get('search');
    
    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' });
    
    // تطبيق الفلاتر
    if (status) {
      query = query.eq('status', status);
    }
    
    if (type) {
      query = query.eq('type', type);
    }
    
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
    }
    
    // تطبيق الصفحات
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data: properties, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) {
      console.error('Error fetching properties:', error);
      return NextResponse.json({ error: 'فشل في جلب البيانات' }, { status: 500 });
    }
    
    return NextResponse.json({
      properties,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
    
  } catch (error) {
    console.error('Error in properties API:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// POST - إضافة عقار جديد
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    
    const { 
      title, 
      description, 
      type, 
      price, 
      location, 
      area, 
      bedrooms, 
      bathrooms, 
      status, 
      features,
      images 
    } = body;
    
    // التحقق من البيانات المطلوبة
    if (!title) {
      return NextResponse.json({ error: 'عنوان العقار مطلوب' }, { status: 400 });
    }
    
    const { data: newProperty, error } = await supabase
      .from('properties')
      .insert([{
        title,
        description,
        type,
        price: price ? parseFloat(price) : null,
        location,
        area: area ? parseFloat(area) : null,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        status: status || 'متاح',
        features,
        images: images || []
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating property:', error);
      return NextResponse.json({ error: 'فشل في إضافة العقار' }, { status: 500 });
    }
    
    return NextResponse.json({ property: newProperty, message: 'تم إضافة العقار بنجاح' });
    
  } catch (error) {
    console.error('Error in properties POST API:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
} 