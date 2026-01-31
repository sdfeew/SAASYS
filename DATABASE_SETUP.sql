-- ============================================================================
-- DASHBOARD BUILDER - DATABASE SETUP SCRIPT
-- Execute this in your Supabase SQL Editor if you see any issues
-- ============================================================================

-- ============================================================================
-- 1. ENSURE sub_modules TABLE IS PROPERLY SET UP
-- ============================================================================
-- This should already exist, but let's ensure it has all needed columns
ALTER TABLE IF EXISTS public.sub_modules 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'Grid';

-- ============================================================================
-- 2. CREATE records TABLE (Dynamic Records Storage)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_module_id UUID NOT NULL REFERENCES public.sub_modules(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT records_tenant_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_records_module_id ON public.records(sub_module_id);
CREATE INDEX IF NOT EXISTS idx_records_tenant_id ON public.records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_records_created_at ON public.records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_records_updated_at ON public.records(updated_at DESC);

-- ============================================================================
-- 3. RLS POLICIES FOR records TABLE
-- ============================================================================
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view records in their tenant" ON public.records;
DROP POLICY IF EXISTS "Users can insert records in their tenant" ON public.records;
DROP POLICY IF EXISTS "Users can update own records" ON public.records;
DROP POLICY IF EXISTS "Users can delete own records" ON public.records;

-- Create RLS policies
CREATE POLICY "Users can view records in their tenant"
  ON public.records FOR SELECT
  USING (tenant_id = auth.uid());

CREATE POLICY "Users can insert records in their tenant"
  ON public.records FOR INSERT
  WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can update own records"
  ON public.records FOR UPDATE
  USING (tenant_id = auth.uid())
  WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can delete own records"
  ON public.records FOR DELETE
  USING (tenant_id = auth.uid());

-- ============================================================================
-- 4. CREATE FUNCTION TO UPDATE updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for records table
DROP TRIGGER IF EXISTS update_records_updated_at ON public.records;
CREATE TRIGGER update_records_updated_at BEFORE UPDATE ON public.records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 5. VERIFY dashboards TABLE EXISTS AND HAS CORRECT STRUCTURE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  widgets JSONB NOT NULL DEFAULT '[]',
  is_published BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dashboards_tenant_id ON public.dashboards(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_created_at ON public.dashboards(created_at DESC);

-- Enable RLS
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view dashboards in their tenant" ON public.dashboards;
DROP POLICY IF EXISTS "Users can create dashboards" ON public.dashboards;
DROP POLICY IF EXISTS "Users can update own dashboards" ON public.dashboards;
DROP POLICY IF EXISTS "Users can delete own dashboards" ON public.dashboards;

-- Create policies
CREATE POLICY "Users can view dashboards in their tenant"
  ON public.dashboards FOR SELECT
  USING (tenant_id = auth.uid());

CREATE POLICY "Users can create dashboards"
  ON public.dashboards FOR INSERT
  WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can update own dashboards"
  ON public.dashboards FOR UPDATE
  USING (tenant_id = auth.uid())
  WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can delete own dashboards"
  ON public.dashboards FOR DELETE
  USING (tenant_id = auth.uid());

-- ============================================================================
-- 6. ADD TRIGGER FOR dashboards updated_at
-- ============================================================================
DROP TRIGGER IF EXISTS update_dashboards_updated_at ON public.dashboards;
CREATE TRIGGER update_dashboards_updated_at BEFORE UPDATE ON public.dashboards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 7. SAMPLE DATA - INSERT TEST RECORDS
-- ============================================================================
-- Get your tenant_id and module_id first, then run this:
-- UPDATE these values with your actual tenant_id and sub_module_id

-- Example: Insert sample sales data
-- Uncomment and modify with your values:
/*
DO $$
DECLARE
  v_tenant_id UUID := 'YOUR_TENANT_ID_HERE';
  v_module_id UUID := 'YOUR_MODULE_ID_HERE';
BEGIN
  -- Insert sample records
  INSERT INTO public.records (sub_module_id, tenant_id, data, created_by)
  VALUES
    (v_module_id, v_tenant_id, '{"name": "North Region", "amount": 15000, "date": "2025-01-15", "status": "completed"}'::jsonb, auth.uid()),
    (v_module_id, v_tenant_id, '{"name": "South Region", "amount": 12000, "date": "2025-01-15", "status": "pending"}'::jsonb, auth.uid()),
    (v_module_id, v_tenant_id, '{"name": "East Region", "amount": 18000, "date": "2025-01-16", "status": "completed"}'::jsonb, auth.uid()),
    (v_module_id, v_tenant_id, '{"name": "West Region", "amount": 14000, "date": "2025-01-16", "status": "completed"}'::jsonb, auth.uid()),
    (v_module_id, v_tenant_id, '{"name": "North Region", "amount": 16000, "date": "2025-01-17", "status": "pending"}'::jsonb, auth.uid());
END $$;
*/

-- ============================================================================
-- 8. VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify setup:
-- SELECT COUNT(*) FROM public.records;
-- SELECT COUNT(*) FROM public.sub_modules;
-- SELECT COUNT(*) FROM public.dashboards;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- All tables, indexes, RLS policies, and triggers are now in place.
-- You can now use the Dashboard Builder with real data!
