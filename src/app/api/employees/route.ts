import { NextRequest, NextResponse } from 'next/server';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hire_date: string;
  salary: number;
  status: string;
  avatar_url?: string;
}

// Simple in-memory data for testing
const mockEmployees: Employee[] = [
  {
    id: "1",
    first_name: "أحمد",
    last_name: "محمد",
    email: "ahmed@aqara.com",
    phone: "+201234567890",
    position: "مدير مبيعات",
    department: "المبيعات",
    hire_date: "2024-01-15",
    salary: 8000,
    status: "نشط"
  },
  {
    id: "2",
    first_name: "فاطمة",
    last_name: "علي",
    email: "fatima@aqara.com",
    phone: "+201234567891",
    position: "مندوب مبيعات",
    department: "المبيعات",
    hire_date: "2024-02-01",
    salary: 5000,
    status: "نشط"
  },
  {
    id: "3",
    first_name: "محمد",
    last_name: "حسن",
    email: "mohamed@aqara.com",
    phone: "+201234567892",
    position: "مدير تسويق",
    department: "التسويق",
    hire_date: "2024-01-20",
    salary: 7500,
    status: "نشط"
  },
  {
    id: "4",
    first_name: "سارة",
    last_name: "أحمد",
    email: "sara@aqara.com",
    phone: "+201234567893",
    position: "مندوب تسويق",
    department: "التسويق",
    hire_date: "2024-03-10",
    salary: 4500,
    status: "نشط"
  },
  {
    id: "5",
    first_name: "عمر",
    last_name: "السعيد",
    email: "omar@aqara.com",
    phone: "+201234567894",
    position: "مندوب عقاري",
    department: "المبيعات",
    hire_date: "2024-04-05",
    salary: 4000,
    status: "نشط"
  },
  {
    id: "6",
    first_name: "مريم",
    last_name: "الخطيب",
    email: "mariam@aqara.com",
    phone: "+201234567895",
    position: "أخصائي خدمة عملاء",
    department: "خدمة العملاء",
    hire_date: "2024-05-01",
    salary: 3500,
    status: "نشط"
  }
];

// GET - جلب جميع الموظفين
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const position = searchParams.get('position');
    const search = searchParams.get('search');

    let filteredEmployees = [...mockEmployees];

    // تطبيق الفلاتر
    if (status && status !== 'all') {
      filteredEmployees = filteredEmployees.filter(emp => emp.status === status);
    }

    if (department && department !== 'all') {
      filteredEmployees = filteredEmployees.filter(emp => emp.department === department);
    }

    if (position && position !== 'all') {
      filteredEmployees = filteredEmployees.filter(emp => emp.position === position);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredEmployees = filteredEmployees.filter(emp =>
        emp.first_name.toLowerCase().includes(searchLower) ||
        emp.last_name.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower) ||
        emp.phone.includes(search)
      );
    }

    // تطبيق الصفحات
    const from = (page - 1) * limit;
    const to = from + limit;
    const paginatedEmployees = filteredEmployees.slice(from, to);

    return NextResponse.json({
      employees: paginatedEmployees,
      total: filteredEmployees.length,
      page,
      limit,
      totalPages: Math.ceil(filteredEmployees.length / limit)
    });

  } catch (error) {
    console.error('Error in employees API:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// POST - إضافة موظف جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      position,
      department,
      hireDate,
      salary,
      status
    } = body;

    // التحقق من البيانات المطلوبة
    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json({ error: 'الاسم واللقب والبريد الإلكتروني والهاتف مطلوبون' }, { status: 400 });
    }

    // التحقق من عدم تكرار البريد الإلكتروني
    const existingEmployee = mockEmployees.find(emp => emp.email === email);
    if (existingEmployee) {
      return NextResponse.json({ error: 'البريد الإلكتروني مسجل مسبقاً' }, { status: 400 });
    }

    // إنشاء موظف جديد
    const newEmployee: Employee = {
      id: (mockEmployees.length + 1).toString(),
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      position: position || 'غير محدد',
      department: department || 'غير محدد',
      hire_date: hireDate || new Date().toISOString().split('T')[0],
      salary: salary || 0,
      status: status || 'نشط'
    };

    // إضافة الموظف الجديد (في الذاكرة فقط للـ testing)
    mockEmployees.unshift(newEmployee);

    return NextResponse.json({
      employee: newEmployee,
      message: 'تم إضافة الموظف بنجاح'
    }, { status: 201 });

  } catch (error) {
    console.error('Error in employees POST API:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}