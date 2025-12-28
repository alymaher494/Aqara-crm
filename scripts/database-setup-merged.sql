-- إعداد قاعدة بيانات CRM/SaaS عقاري متكامل (تصميم حديث + بيانات تجريبية + حضور وصلاحيات متقدمة)
-- قم بتشغيل هذا الملف في Supabase SQL Editor أو أي PostgreSQL

-- جدول الشركات (SaaS)
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول مواقع الشركات (لنظام الحضور الجغرافي)
CREATE TABLE IF NOT EXISTS company_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  branch_name VARCHAR(255),
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  attendance_radius INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول المستخدمين (إدارة النظام)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول الموظفين (تفصيلي)
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  position VARCHAR(100),
  department VARCHAR(100),
  hire_date DATE DEFAULT CURRENT_DATE,
  salary DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'active',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول صلاحيات النظام
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول صلاحيات الموظفين
CREATE TABLE IF NOT EXISTS employee_permissions (
  id SERIAL PRIMARY KEY,
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, permission_id)
);

-- جدول الحضور والانصراف
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  check_in_location POINT,
  check_out_location POINT,
  check_in_ip VARCHAR(45),
  check_out_ip VARCHAR(45),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول إعدادات مطابقة الأعمدة (Excel Import Mapping)
CREATE TABLE IF NOT EXISTS column_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  mapping JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_column_mappings_company ON column_mappings(company_id);

-- جدول سجل الأنشطة
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id uuid,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول العملاء (Leads)
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  national_id VARCHAR(20),
  national_id_image_url TEXT,
  email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'جديد',
  source VARCHAR(100),
  notes TEXT,
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  campaign_id uuid,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- جدول العقارات
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(100),
  price DECIMAL(15,2),
  location VARCHAR(255),
  area DECIMAL(10,2),
  bedrooms INTEGER,
  bathrooms INTEGER,
  status VARCHAR(50) DEFAULT 'متاح',
  features TEXT,
  images TEXT[],
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location);

-- جدول المهام
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  type VARCHAR(100),
  description TEXT,
  due_date DATE,
  due_time TIME,
  status VARCHAR(50) DEFAULT 'غير مكتملة',
  priority VARCHAR(20) DEFAULT 'متوسط',
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);

-- جدول الحملات
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  description TEXT,
  message TEXT,
  status VARCHAR(50) DEFAULT 'مخططة',
  launch_date DATE,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول المواعيد
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'مجدول',
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- جدول المشاريع العقارية
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  developer VARCHAR(255),
  total_units INTEGER,
  available_units INTEGER,
  starting_price DECIMAL(15,2),
  status VARCHAR(50) DEFAULT 'قيد الإنشاء',
  images TEXT[],
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول التقارير
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  data JSONB,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- دوال وتريجر لتحديث updated_at تلقائيًا
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- بيانات تجريبية (شركات)
INSERT INTO companies (id, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Aqara Plus - القاهرة'),
  ('22222222-2222-2222-2222-222222222222', 'Aqara Plus - الإسكندرية');

-- بيانات تجريبية (مواقع الشركات)
INSERT INTO company_locations (id, company_id, branch_name, address, latitude, longitude, attendance_radius) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'القاهرة', 'شارع النيل، القاهرة، مصر', 30.0444, 31.2357, 15),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'الإسكندرية', 'شارع البحر، الإسكندرية، مصر', 31.2001, 29.9187, 15);

-- بيانات تجريبية (صلاحيات)
INSERT INTO permissions (name, description) VALUES
('manage_leads', 'إدارة العملاء المحتملين'),
('manage_properties', 'إدارة العقارات'),
('manage_tasks', 'إدارة المهام'),
('manage_campaigns', 'إدارة الحملات'),
('manage_employees', 'إدارة الموظفين'),
('view_reports', 'عرض التقارير'),
('manage_settings', 'إدارة الإعدادات'),
('admin_access', 'صلاحيات المدير');

-- بيانات تجريبية (مستخدمين)
INSERT INTO users (id, company_id, full_name, email, role) VALUES
  ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'أحمد محمد', 'ahmed@aqara.com', 'admin'),
  ('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'فاطمة علي', 'fatima@aqara.com', 'user'),
  ('aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'محمد حسن', 'mohamed@aqara.com', 'admin'),
  ('aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'سارة أحمد', 'sara@aqara.com', 'user');

-- بيانات تجريبية (موظفين)
INSERT INTO employees (id, company_id, user_id, first_name, last_name, email, phone, position, department, salary) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'أحمد', 'محمد', 'ahmed@aqara.com', '+201234567890', 'مدير مبيعات', 'المبيعات', 8000.00),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'فاطمة', 'علي', 'fatima@aqara.com', '+201234567891', 'مندوب مبيعات', 'المبيعات', 5000.00),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'محمد', 'حسن', 'mohamed@aqara.com', '+201234567892', 'مدير تسويق', 'التسويق', 7500.00),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'سارة', 'أحمد', 'sara@aqara.com', '+201234567893', 'مندوب تسويق', 'التسويق', 4500.00);

-- بيانات تجريبية (صلاحيات الموظفين)
INSERT INTO employee_permissions (employee_id, permission_id) SELECT e.id, p.id FROM employees e, permissions p WHERE e.position = 'مدير مبيعات' AND p.name IN ('manage_leads','manage_properties','manage_tasks','view_reports','manage_settings');

-- بيانات تجريبية (عملاء)
INSERT INTO leads (id, company_id, full_name, phone, email, source, status, assigned_to, notes) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'أحمد علي', '01012345678', 'ahmed@example.com', 'حملة واتساب - العاصمة الجديدة', 'جديد', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'مهتم بشقق 3 غرف'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'سارة محمد', '01123456789', 'sara@example.com', 'حملة فيسبوك', 'مهتم', 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'تبحث عن فيلا في المعادي');

-- بيانات تجريبية (عقارات)
INSERT INTO properties (id, company_id, title, description, type, price, location, area, bedrooms, bathrooms, status, features) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'شقة مميزة في المعادي', 'شقة حديثة البناء في قلب المعادي مع إطلالة رائعة', 'شقة', 2500000, 'المعادي، القاهرة', 120, 3, 2, 'متاح', 'مصعد، موقف سيارات، أمن 24 ساعة');

-- منح الصلاحيات للمستخدمين
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated; 