-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user', 'viewer')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  department TEXT,
  job_title TEXT,
  phone TEXT,
  avatar_url TEXT,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create dashboards table
CREATE TABLE IF NOT EXISTS public.dashboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  widgets JSONB DEFAULT '[]'::jsonb,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create modules table
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  fields JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create records table (for dynamic module data)
CREATE TABLE IF NOT EXISTS public.records (
  id TEXT PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activities table (for activity feed)
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date TIMESTAMPTZ,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigger function for user_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.dashboards FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.records FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view all profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert profiles" ON public.user_profiles FOR INSERT WITH CHECK (true);

-- RLS Policies for dashboards
CREATE POLICY "Users can view all dashboards" ON public.dashboards FOR SELECT USING (true);
CREATE POLICY "Users can create dashboards" ON public.dashboards FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own dashboards" ON public.dashboards FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own dashboards" ON public.dashboards FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for modules
CREATE POLICY "Users can view all modules" ON public.modules FOR SELECT USING (true);
CREATE POLICY "Admins can manage modules" ON public.modules FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  )
);

-- RLS Policies for records
CREATE POLICY "Users can view all records" ON public.records FOR SELECT USING (true);
CREATE POLICY "Users can create records" ON public.records FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own records" ON public.records FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own records" ON public.records FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for activities
CREATE POLICY "Users can view all activities" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Users can create activities" ON public.activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for tasks
CREATE POLICY "Users can view all tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Users can create tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update assigned tasks" ON public.tasks FOR UPDATE USING (
  auth.uid() = created_by OR auth.uid() = assigned_to
);
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = created_by);

-- Insert mock data for users (via auth.users will trigger user_profiles creation)
-- Note: In production, users sign up through the app
-- For demo purposes, we'll insert directly into user_profiles

DO $$
DECLARE
  user1_id UUID := uuid_generate_v4();
  user2_id UUID := uuid_generate_v4();
  user3_id UUID := uuid_generate_v4();
  user4_id UUID := uuid_generate_v4();
  user5_id UUID := uuid_generate_v4();
  user6_id UUID := uuid_generate_v4();
  user7_id UUID := uuid_generate_v4();
  user8_id UUID := uuid_generate_v4();
  module1_id UUID := uuid_generate_v4();
BEGIN
  -- Insert mock user profiles
  INSERT INTO public.user_profiles (id, full_name, email, role, status, department, job_title, phone, last_login) VALUES
  (user1_id, 'Sarah Johnson', 'sarah.johnson@tenantflow.com', 'admin', 'active', 'Engineering', 'Senior Developer', '+1 (555) 123-4567', NOW() - INTERVAL '1 hour'),
  (user2_id, 'Michael Chen', 'michael.chen@tenantflow.com', 'manager', 'active', 'Sales', 'Sales Manager', '+1 (555) 234-5678', NOW() - INTERVAL '2 hours'),
  (user3_id, 'Emily Rodriguez', 'emily.rodriguez@tenantflow.com', 'user', 'active', 'Marketing', 'Marketing Specialist', '+1 (555) 345-6789', NOW() - INTERVAL '1 day'),
  (user4_id, 'David Kim', 'david.kim@tenantflow.com', 'user', 'inactive', 'Operations', 'Operations Coordinator', '+1 (555) 456-7890', NOW() - INTERVAL '3 days'),
  (user5_id, 'Jessica Martinez', 'jessica.martinez@tenantflow.com', 'viewer', 'active', 'Finance', 'Financial Analyst', '+1 (555) 567-8901', NOW() - INTERVAL '2 days'),
  (user6_id, 'Robert Taylor', 'robert.taylor@tenantflow.com', 'manager', 'active', 'HR', 'HR Manager', '+1 (555) 678-9012', NOW() - INTERVAL '4 hours'),
  (user7_id, 'Amanda White', 'amanda.white@tenantflow.com', 'user', 'active', 'Customer Success', 'Support Specialist', '+1 (555) 789-0123', NOW() - INTERVAL '6 hours'),
  (user8_id, 'James Brown', 'james.brown@tenantflow.com', 'viewer', 'active', 'Product', 'Product Manager', '+1 (555) 890-1234', NOW() - INTERVAL '8 hours');

  -- Insert mock module
  INSERT INTO public.modules (id, name, description, icon, fields, created_by) VALUES
  (module1_id, 'Employees', 'Employee management module', 'Users', 
   '[{"key": "fullName", "label": "Full Name", "type": "text"}, {"key": "email", "label": "Email", "type": "email"}, {"key": "department", "label": "Department", "type": "text"}, {"key": "position", "label": "Position", "type": "text"}, {"key": "hireDate", "label": "Hire Date", "type": "date"}, {"key": "salary", "label": "Salary", "type": "number"}, {"key": "status", "label": "Status", "type": "text"}, {"key": "performanceRating", "label": "Performance", "type": "number"}]'::jsonb,
   user1_id);

  -- Insert mock records for the Employee module
  INSERT INTO public.records (id, module_id, data, created_by) VALUES
  ('EMP-2026-001', module1_id, '{"fullName": "Sarah Mitchell", "email": "sarah.mitchell@company.com", "department": "Engineering", "position": "Senior Software Engineer", "hireDate": "2022-03-15", "salary": 125000, "status": "Active", "performanceRating": 4.8}'::jsonb, user1_id),
  ('EMP-2026-002', module1_id, '{"fullName": "Marcus Johnson", "email": "marcus.j@company.com", "department": "Sales", "position": "Account Executive", "hireDate": "2023-01-10", "salary": 95000, "status": "Active", "performanceRating": 4.5}'::jsonb, user1_id),
  ('EMP-2026-003', module1_id, '{"fullName": "Priya Patel", "email": "priya.patel@company.com", "department": "Marketing", "position": "Marketing Manager", "hireDate": "2021-08-22", "salary": 110000, "status": "Active", "performanceRating": 4.9}'::jsonb, user1_id),
  ('EMP-2026-004', module1_id, '{"fullName": "James Wilson", "email": "j.wilson@company.com", "department": "Operations", "position": "Operations Coordinator", "hireDate": "2023-06-01", "salary": 75000, "status": "On Leave", "performanceRating": 4.2}'::jsonb, user1_id),
  ('EMP-2026-005', module1_id, '{"fullName": "Elena Rodriguez", "email": "elena.r@company.com", "department": "Finance", "position": "Financial Analyst", "hireDate": "2022-11-15", "salary": 88000, "status": "Active", "performanceRating": 4.6}'::jsonb, user1_id),
  ('EMP-2026-006', module1_id, '{"fullName": "David Chen", "email": "david.chen@company.com", "department": "Engineering", "position": "DevOps Engineer", "hireDate": "2023-02-20", "salary": 115000, "status": "Active", "performanceRating": 4.7}'::jsonb, user1_id),
  ('EMP-2026-007', module1_id, '{"fullName": "Aisha Mohammed", "email": "aisha.m@company.com", "department": "HR", "position": "HR Specialist", "hireDate": "2022-05-10", "salary": 72000, "status": "Active", "performanceRating": 4.4}'::jsonb, user1_id),
  ('EMP-2026-008', module1_id, '{"fullName": "Robert Taylor", "email": "robert.t@company.com", "department": "Sales", "position": "Sales Representative", "hireDate": "2023-09-01", "salary": 68000, "status": "Probation", "performanceRating": 3.8}'::jsonb, user1_id);

  -- Insert mock dashboards
  INSERT INTO public.dashboards (name, description, widgets, is_published, created_by) VALUES
  ('Sales Performance Dashboard', 'Track sales metrics and team performance', '[]'::jsonb, true, user1_id),
  ('HR Analytics', 'Employee metrics and workforce analytics', '[]'::jsonb, false, user2_id);

  -- Insert mock activities
  INSERT INTO public.activities (user_id, action, entity_type, entity_id, details) VALUES
  (user1_id, 'created', 'dashboard', 'Sales Performance Dashboard', 'Created new dashboard'),
  (user2_id, 'updated', 'user', user3_id::text, 'Updated user profile'),
  (user3_id, 'created', 'record', 'EMP-2026-001', 'Added new employee record'),
  (user1_id, 'published', 'dashboard', 'Sales Performance Dashboard', 'Published dashboard'),
  (user2_id, 'deleted', 'record', 'EMP-2026-009', 'Removed employee record');

  -- Insert mock tasks
  INSERT INTO public.tasks (title, description, priority, status, due_date, assigned_to, created_by) VALUES
  ('Review Q4 Performance Reports', 'Complete annual performance review analysis', 'high', 'in_progress', NOW() + INTERVAL '2 days', user1_id, user1_id),
  ('Update Employee Handbook', 'Revise policies for remote work guidelines', 'medium', 'pending', NOW() + INTERVAL '5 days', user6_id, user2_id),
  ('Onboard New Sales Team Members', 'Complete onboarding for 3 new hires', 'urgent', 'in_progress', NOW() + INTERVAL '1 day', user2_id, user2_id),
  ('System Backup Verification', 'Verify all data backups are functioning', 'high', 'pending', NOW() + INTERVAL '3 days', user1_id, user1_id),
  ('Client Presentation Preparation', 'Prepare slides for enterprise client demo', 'medium', 'completed', NOW() - INTERVAL '1 day', user3_id, user3_id);
END $$;