import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// دالة لحساب المسافة بين نقطتين
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // نصف قطر الأرض بالمتر
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // المسافة بالمتر
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employee_id');
    const date = searchParams.get('date');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = supabase
      .from('attendance')
      .select(`
        *,
        employees (
          id,
          first_name,
          last_name,
          email
        )
      `, { count: 'exact' });

    // تطبيق الفلاتر
    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      query = query.gte('check_in_time', startDate.toISOString())
                   .lt('check_in_time', endDate.toISOString());
    }

    // تطبيق الصفحات
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: attendance, error, count } = await query
      .order('check_in_time', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching attendance:', error);
      return NextResponse.json(
        { error: 'فشل في جلب بيانات الحضور والانصراف' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      attendance,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in attendance API:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employee_id, action, latitude, longitude, ip_address, notes } = body;

    // التحقق من البيانات المطلوبة
    if (!employee_id || !action || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'معرف الموظف والإجراء والموقع مطلوبة' },
        { status: 400 }
      );
    }

    // التحقق من وجود الموظف
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('id, status')
      .eq('id', employee_id)
      .single();

    if (employeeError || !employee) {
      return NextResponse.json(
        { error: 'الموظف غير موجود' },
        { status: 404 }
      );
    }

    if (employee.status !== 'active') {
      return NextResponse.json(
        { error: 'الموظف غير نشط' },
        { status: 400 }
      );
    }

    // الحصول على موقع الشركة (مؤقتاً نستخدم موقع افتراضي)
    const companyLocation = {
      latitude: 30.0444,
      longitude: 31.2357,
      radius: 15 // 15 متر
    };

    // حساب المسافة من مقر الشركة
    const distance = calculateDistance(
      latitude,
      longitude,
      companyLocation.latitude,
      companyLocation.longitude
    );

    // التحقق من المسافة
    if (distance > companyLocation.radius) {
      return NextResponse.json(
        { 
          error: 'أنت خارج نطاق الحضور المسموح به',
          distance: Math.round(distance),
          maxDistance: companyLocation.radius
        },
        { status: 400 }
      );
    }

    const currentTime = new Date().toISOString();
    const today = new Date().toISOString().split('T')[0];

    if (action === 'check_in') {
      // التحقق من عدم وجود تسجيل حضور اليوم
      const { data: existingAttendance } = await supabase
        .from('attendance')
        .select('id')
        .eq('employee_id', employee_id)
        .gte('check_in_time', `${today}T00:00:00`)
        .lt('check_in_time', `${today}T23:59:59`)
        .is('check_out_time', null)
        .single();

      if (existingAttendance) {
        return NextResponse.json(
          { error: 'تم تسجيل الحضور بالفعل اليوم' },
          { status: 400 }
        );
      }

      // تسجيل الحضور
      const { data: newAttendance, error } = await supabase
        .from('attendance')
        .insert({
          employee_id,
          check_in_time: currentTime,
          check_in_location: `(${latitude},${longitude})`,
          check_in_ip: ip_address,
          notes
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating attendance:', error);
        return NextResponse.json(
          { error: 'فشل في تسجيل الحضور' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'تم تسجيل الحضور بنجاح',
        attendance: newAttendance
      }, { status: 201 });

    } else if (action === 'check_out') {
      // البحث عن تسجيل الحضور اليوم
      const { data: existingAttendance } = await supabase
        .from('attendance')
        .select('id')
        .eq('employee_id', employee_id)
        .gte('check_in_time', `${today}T00:00:00`)
        .lt('check_in_time', `${today}T23:59:59`)
        .is('check_out_time', null)
        .single();

      if (!existingAttendance) {
        return NextResponse.json(
          { error: 'لم يتم العثور على تسجيل حضور اليوم' },
          { status: 400 }
        );
      }

      // تسجيل الانصراف
      const { data: updatedAttendance, error } = await supabase
        .from('attendance')
        .update({
          check_out_time: currentTime,
          check_out_location: `(${latitude},${longitude})`,
          check_out_ip: ip_address
        })
        .eq('id', existingAttendance.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating attendance:', error);
        return NextResponse.json(
          { error: 'فشل في تسجيل الانصراف' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'تم تسجيل الانصراف بنجاح',
        attendance: updatedAttendance
      });

    } else {
      return NextResponse.json(
        { error: 'إجراء غير صحيح' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error in attendance API:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
} 