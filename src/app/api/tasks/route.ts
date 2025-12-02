import { NextRequest, NextResponse } from 'next/server';

interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  due_date: string;
  due_time: string;
  status: string;
  priority: string;
  assigned_to: string;
  notes?: string;
}

// Simple in-memory data for testing
const mockTasks: Task[] = [
  {
    id: "1",
    title: "متابعة العميل أحمد علي",
    description: "اتصال بالعميل لمناقشة تفاصيل الشقة",
    type: "مكالمة",
    due_date: "2025-11-08",
    due_time: "09:00",
    status: "مكتمل",
    priority: "عالية",
    assigned_to: "أحمد محمد",
    notes: "تم الاتصال بنجاح"
  },
  {
    id: "2",
    title: "معاينة العقار في المعادي",
    description: "زيارة الموقع مع العميل سارة",
    type: "زيارة",
    due_date: "2025-11-08",
    due_time: "10:30",
    status: "قيد التنفيذ",
    priority: "متوسطة",
    assigned_to: "فاطمة علي",
    notes: "العميل وافق على الموعد"
  },
  {
    id: "3",
    title: "تحديث قائمة العقارات",
    description: "إضافة عقارات جديدة في التجمع الخامس",
    type: "مهمة إدارية",
    due_date: "2025-11-09",
    due_time: "14:00",
    status: "معلق",
    priority: "منخفضة",
    assigned_to: "محمد حسن",
    notes: "في انتظار موافقة الإدارة"
  },
  {
    id: "4",
    title: "مقابلة مع مستثمر",
    description: "مناقشة استثمار في مشروع العاصمة الجديدة",
    type: "مقابلة",
    due_date: "2025-11-10",
    due_time: "11:00",
    status: "مجدول",
    priority: "عالية",
    assigned_to: "أحمد محمد",
    notes: "مستثمر كبير محتمل"
  },
  {
    id: "5",
    title: "تحضير تقرير المبيعات",
    description: "إعداد تقرير شهري لأداء المبيعات",
    type: "تقرير",
    due_date: "2025-11-08",
    due_time: "16:00",
    status: "مكتمل",
    priority: "متوسطة",
    assigned_to: "فاطمة علي",
    notes: "تم إرسال التقرير للإدارة"
  },
  {
    id: "6",
    title: "التواصل مع شركة الديكور",
    description: "التفاوض حول تكاليف تجهيز الشقق",
    type: "مكالمة",
    due_date: "2025-11-11",
    due_time: "10:00",
    status: "قيد التنفيذ",
    priority: "متوسطة",
    assigned_to: "سارة أحمد",
    notes: "في انتظار عرض السعر"
  }
];

// GET - جلب جميع المهام
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assignedTo');
    const date = searchParams.get('date');
    const search = searchParams.get('search');
    
    let filteredTasks = [...mockTasks];
    
    // تطبيق الفلاتر
    if (status && status !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }
    
    if (priority && priority !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === priority);
    }
    
    if (assignedTo && assignedTo !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.assigned_to === assignedTo);
    }
    
    if (date) {
      filteredTasks = filteredTasks.filter(task => task.due_date === date);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower) ||
        task.type.toLowerCase().includes(searchLower) ||
        task.assigned_to.toLowerCase().includes(searchLower)
      );
    }
    
    // تطبيق الصفحات
    const from = (page - 1) * limit;
    const to = from + limit;
    const paginatedTasks = filteredTasks.slice(from, to);
    
    return NextResponse.json({
      tasks: paginatedTasks,
      total: filteredTasks.length,
      page,
      limit,
      totalPages: Math.ceil(filteredTasks.length / limit)
    });
    
  } catch (error) {
    console.error('Error in tasks API:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// POST - إضافة مهمة جديدة
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { 
      title, 
      description, 
      type, 
      dueDate, 
      dueTime, 
      status, 
      priority, 
      assignedTo, 
      notes 
    } = body;
    
    // التحقق من البيانات المطلوبة
    if (!title || !type) {
      return NextResponse.json({ error: 'عنوان ونوع المهمة مطلوبان' }, { status: 400 });
    }
    
    // إنشاء مهمة جديدة
    const newTask: Task = {
      id: (mockTasks.length + 1).toString(),
      title: title || '',
      description: description || '',
      type: type || 'عام',
      due_date: dueDate || '',
      due_time: dueTime || '',
      status: status || 'معلق',
      priority: priority || 'متوسط',
      assigned_to: assignedTo || 'غير محدد',
      notes: notes || ''
    };
    
    // إضافة المهمة الجديدة (في الذاكرة فقط للـ testing)
    mockTasks.unshift(newTask);
    
    return NextResponse.json({ 
      task: newTask, 
      message: 'تم إضافة المهمة بنجاح' 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error in tasks POST API:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}