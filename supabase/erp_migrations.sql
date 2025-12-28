-- MODULE 1: SAAS CORE & SUPER ADMIN
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS max_users int DEFAULT 5,
ADD COLUMN IF NOT EXISTS expiry_date timestamptz;

CREATE TABLE IF NOT EXISTS app_admins (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now()
);

-- MODULE 2: SMART HR & GEOFENCED ATTENDANCE
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS office_lat float8,
ADD COLUMN IF NOT EXISTS office_lng float8,
ADD COLUMN IF NOT EXISTS allowed_radius int DEFAULT 100; -- in meters

CREATE TABLE IF NOT EXISTS attendance_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    check_in_time timestamptz,
    check_out_time timestamptz,
    date date DEFAULT CURRENT_DATE,
    status text, -- 'present', 'late', 'absent'
    location_lat float8,
    location_lng float8
);

CREATE TABLE IF NOT EXISTS payroll_settings (
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    base_salary numeric DEFAULT 0,
    hourly_rate numeric DEFAULT 0,
    overtime_rate numeric DEFAULT 1.5,
    work_hours_per_day int DEFAULT 8
);

-- MODULE 3: ACCOUNTING SYSTEM
CREATE TABLE IF NOT EXISTS transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    type text NOT NULL, -- 'income', 'expense'
    category text, -- 'salary', 'rent', 'commission', 'sale'
    amount numeric NOT NULL DEFAULT 0,
    date date DEFAULT CURRENT_DATE,
    description text,
    related_lead_id uuid REFERENCES leads(id) ON DELETE SET NULL
);

-- MODULE 4: INTERACTIVE PROJECT MAPS
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS lat float8,
ADD COLUMN IF NOT EXISTS lng float8;

-- Enable RLS on new tables
ALTER TABLE app_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Assumes organization_id check for multi-tenancy)
-- Attendance: Users can see their own, Admins can see org's
CREATE POLICY "Users view own attendance" ON attendance_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view org attendance" ON attendance_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = attendance_logs.organization_id AND role = 'admin')
);
CREATE POLICY "Users insert own attendance" ON attendance_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own attendance" ON attendance_logs FOR UPDATE USING (auth.uid() = user_id);

-- Transactions: Only org members see transactions (or just admins?)
CREATE POLICY "Org members view transactions" ON transactions FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = transactions.organization_id)
);
CREATE POLICY "Admins manage transactions" ON transactions FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = transactions.organization_id AND role = 'admin')
);
