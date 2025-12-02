import { NextRequest, NextResponse } from 'next/server';

interface Appointment {
  id: string;
  title: string;
  description: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  assigned_to: string;
  lead_id: string | null;
  lead: { name: string; phone: string } | null;
  property_id: string | null;
  property: { title: string; location: string } | null;
  notes?: string;
}

// Simple in-memory data for testing
const mockAppointments: Appointment[] = [
  {
    id: "1",
    title: "معاينة شقة في المعادي",
    description: "موعد معاينة الشقة مع العميل أحمد علي",
    appointment_date: "2025-11-08",
    appointment_time: "10:00",
    status: "مجدول",
    assigned_to: "أحمد محمد",
    lead_id: "1",
    lead: { name: "أحمد علي", phone: "01012345678" },
    property_id: "1",
    property: { title: "شقة مميزة في المعادي", location: "المعادي، القاهرة" }
  },
  {
    id: "2",
    title: "مقابلة مع مستثمر",
    description: "مناقشة مشروع جديد في العاصمة الجديدة",
    appointment_date: "2025-11-08",
    appointment_time: "14:00",
    status: "مجدول",
    assigned_to: "فاطمة علي",
    lead_id: "2",
    lead: { name: "سارة محمد", phone: "01123456789" },
    property_id: null,
    property: null
  },
  {
    id: "3",
    title: "معاينة فيلا في التجمع",
    description: "معاينة فيلا للتوريد",
    appointment_date: "2025-11-09",
    appointment_time: "11:00",
    status: "مكتمل",
    assigned_to: "محمد حسن",
    lead_id: "1",
    lead: { name: "أحمد علي", phone: "01012345678" },
    property_id: "2",
    property: { title: "فيلا فاخرة في التجمع", location: "التجمع الخامس، القاهرة" }
  }
];

// GET - جلب جميع المواعيد
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');
    const date = searchParams.get('date');
    const search = searchParams.get('search');
    
    let filteredAppointments = [...mockAppointments];
    
    // تطبيق الفلاتر
    if (status && status !== 'all') {
      filteredAppointments = filteredAppointments.filter(apt => apt.status === status);
    }
    
    if (assignedTo && assignedTo !== 'all') {
      filteredAppointments = filteredAppointments.filter(apt => apt.assigned_to === assignedTo);
    }
    
    if (date) {
      filteredAppointments = filteredAppointments.filter(apt => apt.appointment_date === date);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredAppointments = filteredAppointments.filter(apt => 
        apt.title.toLowerCase().includes(searchLower) ||
        apt.description.toLowerCase().includes(searchLower) ||
        (apt.lead?.name?.toLowerCase().includes(searchLower)) ||
        (apt.property?.title?.toLowerCase().includes(searchLower))
      );
    }
    
    // تطبيق الصفحات
    const from = (page - 1) * limit;
    const to = from + limit;
    const paginatedAppointments = filteredAppointments.slice(from, to);
    
    return NextResponse.json({
      appointments: paginatedAppointments,
      total: filteredAppointments.length,
      page,
      limit,
      totalPages: Math.ceil(filteredAppointments.length / limit)
    });
    
  } catch (error) {
    console.error('Error in appointments API:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// POST - إضافة موعد جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { 
      leadId, 
      propertyId, 
      title, 
      description, 
      appointmentDate, 
      appointmentTime, 
      status, 
      assignedTo, 
      notes 
    } = body;
    
    // التحقق من البيانات المطلوبة
    if (!title || !appointmentDate || !appointmentTime) {
      return NextResponse.json({ error: 'العنوان والتاريخ والوقت مطلوبان' }, { status: 400 });
    }
    
    // إنشاء موعد جديد
    const newAppointment: Appointment = {
      id: (mockAppointments.length + 1).toString(),
      title: title || '',
      description: description || '',
      appointment_date: appointmentDate || '',
      appointment_time: appointmentTime || '',
      status: status || 'مجدول',
      assigned_to: assignedTo || 'غير محدد',
      lead_id: leadId || null,
      lead: leadId ? { name: "عميل جديد", phone: "غير محدد" } : null,
      property_id: propertyId || null,
      property: propertyId ? { title: "عقار جديد", location: "غير محدد" } : null,
      notes: notes || ''
    };
    
    // إضافة الموعد الجديد (في الذاكرة فقط للـ testing)
    mockAppointments.unshift(newAppointment);
    
    return NextResponse.json({ 
      appointment: newAppointment, 
      message: 'تم إضافة الموعد بنجاح' 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error in appointments POST API:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}