# 🏠 Aqara Plus CRM

## 📋 نظرة عامة

**Aqara Plus CRM** هو نظام إدارة علاقات العملاء للعقارات، مصمم خصيصاً لفريق مبيعات مكون من 5 أشخاص. النظام يساعد في تنظيم متابعة العملاء المحتملين وتحسين أداء حملات التسويق عبر واتساب.

## 🎯 الميزات الرئيسية

### ✅ إدارة العملاء
- إضافة عملاء جدد (يدوي أو استيراد من Excel)
- عرض قائمة منظمة للعملاء
- البحث والتصفية حسب الحالة
- تعيين العملاء لموظفين معينين
- تتبع حالة كل عميل

### ✅ إدارة المهام
- إنشاء مهام جديدة
- جدولة المهام المستقبلية
- عرض المهام اليومية والمتأخرة
- تمييز المهام كمنجزة
- ربط المهام بالعملاء

### ✅ إدارة الحملات
- تسجيل حملات واتساب
- ربط العملاء بالحملات
- عرض إحصائيات الحملات
- مقارنة أداء الحملات

### ✅ لوحة التحكم
- إحصائيات سريعة
- رسوم بيانية لحالات العملاء
- تنبيهات المهام المتأخرة
- عرض أفضل الموظفين أداءً

## 🛠️ التقنيات المستخدمة

### Frontend
- **Next.js** - إطار العمل الرئيسي
- **React** - مكتبة الواجهة
- **Tailwind CSS** - التصميم
- **Chart.js** - الرسوم البيانية

### Backend
- **Next.js API Routes** - الخادم
- **Supabase** - قاعدة البيانات
- **PostgreSQL** - قاعدة البيانات

### Deployment
- **Vercel** - استضافة التطبيق
- **GitHub** - تخزين الكود
- **Supabase** - استضافة قاعدة البيانات

## 🚀 التثبيت والتشغيل

### المتطلبات
- Node.js (الإصدار 18 أو أحدث)
- Git
- حساب GitHub
- حساب Supabase
- حساب Vercel

### خطوات التثبيت

#### 1. استنساخ المشروع
```bash
git clone https://github.com/your-username/aqara-plus-crm.git
cd aqara-plus-crm
```

#### 2. تثبيت التبعيات
```bash
npm install
```

#### 3. إعداد متغيرات البيئة
```bash
cp .env.example .env.local
```

أضف متغيرات البيئة التالية:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

#### 4. تشغيل المشروع محلياً
```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

## 📁 هيكل المشروع

```
aqara-plus-crm/
├── pages/                    # صفحات Next.js
│   ├── api/                 # API Routes
│   ├── leads/               # صفحات العملاء
│   ├── tasks/               # صفحات المهام
│   └── campaigns/           # صفحات الحملات
├── components/              # مكونات React
├── styles/                  # ملفات CSS
├── utils/                   # دوال مساعدة
├── public/                  # الملفات الثابتة
└── docs/                    # الوثائق
```

## 🗄️ قاعدة البيانات

### الجداول الرئيسية

#### جدول العملاء (leads)
```sql
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  source VARCHAR(100),
  status VARCHAR(50) DEFAULT 'new',
  assigned_to INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### جدول المهام (tasks)
```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id),
  type VARCHAR(100) NOT NULL,
  description TEXT,
  due_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  assigned_to INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### جدول الحملات (campaigns)
```sql
CREATE TABLE campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  message_text TEXT,
  launch_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 📱 الاستخدام

### إضافة عميل جديد
1. اذهب إلى صفحة "العملاء"
2. اضغط على "إضافة عميل جديد"
3. املأ البيانات المطلوبة
4. اضغط "حفظ"

### استيراد عملاء من Excel
1. اذهب إلى صفحة "العملاء"
2. اضغط على "استيراد من Excel"
3. اختر ملف Excel
4. راجع البيانات
5. اضغط "استيراد"

### إنشاء مهمة جديدة
1. اذهب إلى صفحة "المهام"
2. اضغط على "إضافة مهمة جديدة"
3. اختر نوع المهمة
4. حدد التاريخ والوقت
5. اضغط "حفظ"

## 🔧 التطوير

### تشغيل في وضع التطوير
```bash
npm run dev
```

### بناء المشروع
```bash
npm run build
```

### تشغيل الاختبارات
```bash
npm test
```

### فحص الكود
```bash
npm run lint
```

## 🚀 النشر

### النشر على Vercel
1. ارفع الكود على GitHub
2. اربط Vercel بـ GitHub
3. أضف متغيرات البيئة في Vercel
4. اضغط "Deploy"

### إعداد قاعدة البيانات
1. أنشئ مشروع جديد في Supabase
2. ارفع الجداول
3. احصل على API Keys
4. أضف المتغيرات في Vercel

## 📊 الإحصائيات

- **عدد العملاء**: عرض إجمالي العملاء في النظام
- **العملاء الجدد**: العملاء المضافين اليوم/الأسبوع
- **معدل التحويل**: نسبة العملاء المحولين
- **المهام المتأخرة**: المهام التي تجاوزت موعدها
- **أداء الموظفين**: إحصائيات كل موظف

## 🔐 الأمان

- تشفير كلمات المرور
- التحقق من صحة البيانات
- حماية من الهجمات الشائعة
- نسخ احتياطي تلقائي للبيانات

## 📞 الدعم

### الوثائق
- [الشرح النظري الشامل](docs/الشرح_النظري_الشامل.md)
- [الخطة العملية المفصلة](docs/الخطة_العملية_المفصلة.md)

### التواصل
- 📧 الإيميل: support@aqara-plus.com
- 💬 مجموعة واتساب: [رابط المجموعة]
- 📱 تليجرام: [رابط القناة]

## 🤝 المساهمة

نرحب بمساهماتكم! يرجى:

1. عمل Fork للمشروع
2. إنشاء branch جديد للميزة
3. عمل Commit للتغييرات
4. عمل Push للـ branch
5. إنشاء Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT. راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 🙏 الشكر

شكر خاص لجميع المساهمين والمطورين الذين ساعدوا في تطوير هذا المشروع.

---

**Aqara Plus CRM** - نظام إدارة علاقات العملاء للعقارات 🏠

*تم تطويره بـ ❤️ في مصر* 