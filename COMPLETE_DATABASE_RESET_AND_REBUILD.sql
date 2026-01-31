-- ============================================================================
-- COMPLETE DATABASE RESET AND REBUILD SCRIPT
-- For Multi-Tenant SaaS Platform
-- Author: Database Migration Script
-- Date: 2026-01-31
-- ============================================================================
-- IMPORTANT: This script will:
-- 1. Drop all existing tables (data will be deleted)
-- 2. Recreate the entire database schema
-- 3. Create proper RLS policies
-- 4. Seed initial data (main modules, test tenant, test users)
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP ALL EXISTING TABLES AND TRIGGERS
-- ============================================================================

-- First disable RLS on all tables to allow deletion
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public'
    ) LOOP
        BEGIN
            EXECUTE 'ALTER TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY';
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
END
$$;

-- Drop all triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants CASCADE;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles CASCADE;
DROP TRIGGER IF EXISTS update_sub_modules_updated_at ON sub_modules CASCADE;
DROP TRIGGER IF EXISTS update_sub_module_fields_updated_at ON sub_module_fields CASCADE;
DROP TRIGGER IF EXISTS update_records_updated_at ON sub_module_records CASCADE;
DROP TRIGGER IF EXISTS update_attachments_updated_at ON attachments CASCADE;
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments CASCADE;
DROP TRIGGER IF EXISTS update_data_sources_updated_at ON data_sources CASCADE;
DROP TRIGGER IF EXISTS update_dashboards_updated_at ON dashboards CASCADE;
DROP TRIGGER IF EXISTS update_widgets_updated_at ON dashboard_widgets CASCADE;
DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers CASCADE;
DROP TRIGGER IF EXISTS update_supplier_ratings_updated_at ON supplier_ratings CASCADE;
DROP TRIGGER IF EXISTS update_email_queue_updated_at ON email_queue CASCADE;

-- Drop all functions (CASCADE to drop dependent triggers)
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop all tables in the correct order (respecting foreign keys)
DROP TABLE IF EXISTS supplier_ratings CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS record_relationships CASCADE;
DROP TABLE IF EXISTS record_activity CASCADE;
DROP TABLE IF EXISTS record_comments CASCADE;
DROP TABLE IF EXISTS record_attachments CASCADE;
DROP TABLE IF EXISTS email_queue CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS dashboard_widgets CASCADE;
DROP TABLE IF EXISTS dashboards CASCADE;
DROP TABLE IF EXISTS data_sources CASCADE;
DROP TABLE IF EXISTS sub_module_records CASCADE;
DROP TABLE IF EXISTS sub_module_fields CASCADE;
DROP TABLE IF EXISTS sub_modules CASCADE;
DROP TABLE IF EXISTS main_modules CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;

-- Drop extensions if they exist
DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;
DROP EXTENSION IF EXISTS "citext" CASCADE;

-- ============================================================================
-- STEP 2: CREATE EXTENSIONS AND UTILITY FUNCTIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- STEP 3: CREATE ALL TABLES (Fresh Schema)
-- ============================================================================

-- ============================================================================
-- 3.1 CORE TABLES: TENANCY & USERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    subscription_plan VARCHAR(50) DEFAULT 'starter' CHECK (subscription_plan IN ('starter', 'professional', 'enterprise')),
    branding JSONB DEFAULT '{}' :: jsonb,
    settings JSONB DEFAULT '{}' :: jsonb,
    admins UUID[] DEFAULT '{}' :: uuid[],
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenants_code ON tenants(code);
CREATE INDEX idx_tenants_status ON tenants(status);

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    email citext NOT NULL,
    avatar_url TEXT,
    role_code VARCHAR(50) DEFAULT 'user' CHECK (role_code IN ('admin', 'manager', 'user', 'viewer')),
    permissions JSONB DEFAULT '[]' :: jsonb,
    notification_preferences JSONB DEFAULT '{}' :: jsonb,
    department VARCHAR(255),
    job_title VARCHAR(255),
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, email)
);

CREATE INDEX idx_user_profiles_tenant ON user_profiles(tenant_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(tenant_id, role_code);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- ============================================================================
-- 3.2 MODULE STRUCTURE: MAIN MODULES & SUB-MODULES
-- ============================================================================

CREATE TABLE IF NOT EXISTS main_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL CHECK (code IN ('HR', 'CRM', 'INVENTORY', 'LOGISTICS', 'SUPPLIERS')),
    name JSONB NOT NULL,
    icon VARCHAR(50),
    description JSONB DEFAULT '{}' :: jsonb,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_main_modules_code ON main_modules(code);
CREATE INDEX idx_main_modules_status ON main_modules(status);

CREATE TABLE IF NOT EXISTS sub_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    main_module_id UUID NOT NULL REFERENCES main_modules(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL,
    name JSONB NOT NULL,
    description JSONB DEFAULT '{}' :: jsonb,
    icon VARCHAR(50),
    order_index INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, code)
);

CREATE INDEX idx_sub_modules_tenant ON sub_modules(tenant_id);
CREATE INDEX idx_sub_modules_main_module ON sub_modules(main_module_id);
CREATE INDEX idx_sub_modules_code ON sub_modules(code);

-- ============================================================================
-- 3.3 DYNAMIC FIELDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS sub_module_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sub_module_id UUID NOT NULL REFERENCES sub_modules(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    label JSONB NOT NULL,
    data_type VARCHAR(50) NOT NULL CHECK (data_type IN ('TEXT', 'NUMBER', 'DATE', 'DATETIME', 'CURRENCY', 'BOOLEAN', 'EMAIL', 'PHONE', 'URL', 'SELECT', 'MULTI_SELECT', 'REFERENCE_ONE', 'REFERENCE_MANY', 'JSONB', 'TEXTAREA', 'RICH_TEXT')),
    required BOOLEAN DEFAULT false,
    unique_constraint BOOLEAN DEFAULT false,
    default_value TEXT,
    validation_rules JSONB DEFAULT '[]' :: jsonb,
    ui_config JSONB DEFAULT '{}' :: jsonb,
    is_filter BOOLEAN DEFAULT false,
    is_indexed BOOLEAN DEFAULT false,
    is_visible_in_list BOOLEAN DEFAULT true,
    order_index INT DEFAULT 0,
    relation_config JSONB DEFAULT '{}' :: jsonb,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, sub_module_id, name)
);

CREATE INDEX idx_sub_module_fields_tenant ON sub_module_fields(tenant_id);
CREATE INDEX idx_sub_module_fields_sub_module ON sub_module_fields(sub_module_id);
CREATE INDEX idx_sub_module_fields_order ON sub_module_fields(sub_module_id, order_index);

-- ============================================================================
-- 3.4 DATA STORAGE: RECORDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS sub_module_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sub_module_id UUID NOT NULL REFERENCES sub_modules(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived', 'deleted')),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_records_tenant ON sub_module_records(tenant_id);
CREATE INDEX idx_records_sub_module ON sub_module_records(sub_module_id);
CREATE INDEX idx_records_created_by ON sub_module_records(created_by);
CREATE INDEX idx_records_assigned_to ON sub_module_records(assigned_to);
CREATE INDEX idx_records_created_at ON sub_module_records(created_at DESC);
CREATE INDEX idx_records_status ON sub_module_records(status);

-- ============================================================================
-- 3.5 COLLABORATION & COMMUNICATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sub_module_id UUID REFERENCES sub_modules(id) ON DELETE SET NULL,
    record_id UUID REFERENCES sub_module_records(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size_bytes BIGINT,
    storage_path VARCHAR(500) NOT NULL UNIQUE,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attachments_tenant ON attachments(tenant_id);
CREATE INDEX idx_attachments_record ON attachments(record_id);
CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by);
CREATE INDEX idx_attachments_created_at ON attachments(created_at DESC);

CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sub_module_id UUID REFERENCES sub_modules(id) ON DELETE SET NULL,
    record_id UUID NOT NULL REFERENCES sub_module_records(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    mentions UUID[] DEFAULT '{}' :: uuid[],
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_tenant ON comments(tenant_id);
CREATE INDEX idx_comments_record ON comments(record_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL CHECK (type IN ('COMMENT_MENTION', 'ASSIGNMENT', 'APPROVAL', 'STATUS_CHANGE', 'NEW_RECORD', 'SYSTEM')),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link_url TEXT,
    data JSONB DEFAULT '{}' :: jsonb,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_tenant ON notifications(tenant_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

CREATE TABLE IF NOT EXISTS email_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    template_code VARCHAR(100) NOT NULL,
    recipient_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    to_email VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    attempt_count INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    sent_at TIMESTAMPTZ,
    failure_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_queue_tenant ON email_queue(tenant_id);
CREATE INDEX idx_email_queue_status ON email_queue(status);
CREATE INDEX idx_email_queue_created_at ON email_queue(created_at DESC);

-- ============================================================================
-- 3.6 DASHBOARD BUILDER SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('SINGLE_SUB_MODULE', 'JOINED', 'CUSTOM_SQL')),
    config JSONB NOT NULL,
    field_mappings JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, code)
);

CREATE INDEX idx_data_sources_tenant ON data_sources(tenant_id);
CREATE INDEX idx_data_sources_code ON data_sources(tenant_id, code);

CREATE TABLE IF NOT EXISTS dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    scope VARCHAR(20) NOT NULL CHECK (scope IN ('GLOBAL', 'MODULE', 'SUPPLIER')),
    sub_module_id UUID REFERENCES sub_modules(id) ON DELETE CASCADE,
    supplier_record_id UUID REFERENCES sub_module_records(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    layout_config JSONB DEFAULT '{}' :: jsonb,
    is_published BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dashboards_tenant ON dashboards(tenant_id);
CREATE INDEX idx_dashboards_scope ON dashboards(tenant_id, scope);
CREATE INDEX idx_dashboards_created_by ON dashboards(created_by);

CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('KPI', 'TABLE', 'CHART_BAR', 'CHART_LINE', 'CHART_PIE', 'CHART_AREA', 'GAUGE', 'MAP', 'SCATTER', 'COMBO')),
    title VARCHAR(255),
    description TEXT,
    data_source_id UUID REFERENCES data_sources(id) ON DELETE SET NULL,
    dimension_fields JSONB,
    metric_fields JSONB,
    filters JSONB DEFAULT '[]' :: jsonb,
    sort_config JSONB DEFAULT '{}' :: jsonb,
    ui_config JSONB DEFAULT '{}' :: jsonb,
    position_x INT DEFAULT 0,
    position_y INT DEFAULT 0,
    width INT DEFAULT 4,
    height INT DEFAULT 3,
    refresh_interval INT,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_widgets_dashboard ON dashboard_widgets(dashboard_id);
CREATE INDEX idx_widgets_data_source ON dashboard_widgets(data_source_id);

-- ============================================================================
-- 3.7 SUPPLIER MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    country VARCHAR(100),
    email citext,
    phone VARCHAR(50),
    website VARCHAR(255),
    payment_terms VARCHAR(100),
    overall_rating DECIMAL(3, 2),
    total_orders INT DEFAULT 0,
    total_spent DECIMAL(19, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_suppliers_tenant ON suppliers(tenant_id);
CREATE INDEX idx_suppliers_code ON suppliers(code);
CREATE INDEX idx_suppliers_category ON suppliers(category);
CREATE INDEX idx_suppliers_status ON suppliers(status);

CREATE TABLE IF NOT EXISTS supplier_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    period_start_date DATE NOT NULL,
    period_end_date DATE NOT NULL,
    quality_rating INT CHECK (quality_rating >= 1 AND quality_rating <= 5),
    delivery_rating INT CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
    price_rating INT CHECK (price_rating >= 1 AND price_rating <= 5),
    communication_rating INT CHECK (communication_rating >= 1 AND communication_rating <= 5),
    overall_rating DECIMAL(3, 2),
    comments TEXT,
    evaluated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_supplier_ratings_tenant ON supplier_ratings(tenant_id);
CREATE INDEX idx_supplier_ratings_supplier ON supplier_ratings(supplier_id);

-- ============================================================================
-- 3.8 RELATIONSHIP & ACTIVITY TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS record_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    source_record_id UUID NOT NULL REFERENCES sub_module_records(id) ON DELETE CASCADE,
    target_record_id UUID NOT NULL REFERENCES sub_module_records(id) ON DELETE CASCADE,
    source_module_id UUID NOT NULL REFERENCES sub_modules(id) ON DELETE CASCADE,
    target_module_id UUID NOT NULL REFERENCES sub_modules(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT different_records CHECK (source_record_id != target_record_id),
    UNIQUE(source_record_id, target_record_id, relationship_type)
);

CREATE INDEX idx_relationships_tenant ON record_relationships(tenant_id);
CREATE INDEX idx_relationships_source ON record_relationships(source_record_id);
CREATE INDEX idx_relationships_target ON record_relationships(target_record_id);

CREATE TABLE IF NOT EXISTS record_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    record_id UUID NOT NULL REFERENCES sub_module_records(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES sub_modules(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('created', 'updated', 'deleted', 'field_changed', 'attachment_added', 'attachment_removed', 'comment_added', 'status_changed', 'related_record_added', 'related_record_removed')),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_email TEXT,
    description TEXT NOT NULL,
    changes JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_tenant ON record_activity(tenant_id);
CREATE INDEX idx_activity_record ON record_activity(record_id);
CREATE INDEX idx_activity_module ON record_activity(module_id);
CREATE INDEX idx_activity_user ON record_activity(user_id);
CREATE INDEX idx_activity_type ON record_activity(activity_type);
CREATE INDEX idx_activity_created_at ON record_activity(created_at DESC);

-- ============================================================================
-- 3.9 AUDIT & LOGGING
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'DOWNLOAD', 'SHARE', 'COMMENT', 'MENTION')),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    entity_name VARCHAR(255),
    changes JSONB DEFAULT '{}' :: jsonb,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_tenant ON activity_logs(tenant_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ============================================================================
-- STEP 4: CREATE TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

CREATE TRIGGER update_tenants_updated_at
BEFORE UPDATE ON tenants
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sub_modules_updated_at
BEFORE UPDATE ON sub_modules
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sub_module_fields_updated_at
BEFORE UPDATE ON sub_module_fields
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_records_updated_at
BEFORE UPDATE ON sub_module_records
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attachments_updated_at
BEFORE UPDATE ON attachments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_sources_updated_at
BEFORE UPDATE ON data_sources
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboards_updated_at
BEFORE UPDATE ON dashboards
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_widgets_updated_at
BEFORE UPDATE ON dashboard_widgets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON suppliers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_ratings_updated_at
BEFORE UPDATE ON supplier_ratings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_queue_updated_at
BEFORE UPDATE ON email_queue
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 5: AUTO-CREATE USER PROFILE ON AUTH SIGNUP
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_tenant_id UUID;
    user_full_name VARCHAR(255);
    tenant_code VARCHAR(50);
BEGIN
    user_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        SPLIT_PART(NEW.email, '@', 1)
    );
    
    tenant_code := LOWER(
        SUBSTRING(REPLACE(REPLACE(NEW.email, '@', '_'), '.', '_'), 1, 50)
    );

    BEGIN
        INSERT INTO tenants (name, code, status, subscription_plan)
        VALUES (
            user_full_name || '''s Workspace',
            tenant_code,
            'active',
            'starter'
        )
        RETURNING id INTO default_tenant_id;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Tenant creation error for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
    END;

    BEGIN
        INSERT INTO user_profiles (id, tenant_id, email, full_name, role_code, notification_preferences)
        VALUES (
            NEW.id,
            default_tenant_id,
            NEW.email,
            user_full_name,
            'admin',
            '{}'::jsonb
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'User profile creation error for user %: %', NEW.id, SQLERRM;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- STEP 6: ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE tenants DISABLE ROW LEVEL SECURITY; -- System table, no tenant_id
ALTER TABLE main_modules DISABLE ROW LEVEL SECURITY; -- System-wide, no tenant_id
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_module_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_module_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE record_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE record_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 7: CREATE RLS POLICIES (PERMISSIVE - For Development)
-- ============================================================================
-- NOTE: These are permissive policies for ease of testing
-- In production, make them more restrictive

-- user_profiles policies
CREATE POLICY "users_select_own" ON user_profiles FOR SELECT
USING (auth.uid() = id OR tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "users_update_own" ON user_profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "users_insert_own" ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "users_delete_own" ON user_profiles FOR DELETE
USING (auth.uid() = id);

-- sub_modules policies
CREATE POLICY "sub_modules_select_tenant" ON sub_modules FOR SELECT
USING (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "sub_modules_insert_tenant" ON sub_modules FOR INSERT
WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "sub_modules_update_tenant" ON sub_modules FOR UPDATE
USING (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
))
WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "sub_modules_delete_tenant" ON sub_modules FOR DELETE
USING (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

-- sub_module_fields policies
CREATE POLICY "fields_select_tenant" ON sub_module_fields FOR SELECT
USING (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "fields_insert_tenant" ON sub_module_fields FOR INSERT
WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "fields_update_tenant" ON sub_module_fields FOR UPDATE
USING (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
))
WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "fields_delete_tenant" ON sub_module_fields FOR DELETE
USING (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

-- sub_module_records policies
CREATE POLICY "records_select_tenant" ON sub_module_records FOR SELECT
USING (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "records_insert_tenant" ON sub_module_records FOR INSERT
WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "records_update_tenant" ON sub_module_records FOR UPDATE
USING (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
))
WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "records_delete_tenant" ON sub_module_records FOR DELETE
USING (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

-- attachments policies
CREATE POLICY "attachments_select_tenant" ON attachments FOR SELECT
USING (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "attachments_insert_tenant" ON attachments FOR INSERT
WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "attachments_delete_own" ON attachments FOR DELETE
USING (uploaded_by = auth.uid());

-- comments policies
CREATE POLICY "comments_select_tenant" ON comments FOR SELECT
USING (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "comments_insert_tenant" ON comments FOR INSERT
WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
) AND author_id = auth.uid());

CREATE POLICY "comments_update_own" ON comments FOR UPDATE
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());

CREATE POLICY "comments_delete_own" ON comments FOR DELETE
USING (author_id = auth.uid());

-- notifications policies
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- email_queue policies
CREATE POLICY "email_queue_select_tenant" ON email_queue FOR SELECT
USING (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "email_queue_insert_tenant" ON email_queue FOR INSERT
WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

-- data_sources policies
CREATE POLICY "data_sources_select_tenant" ON data_sources FOR SELECT
USING (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "data_sources_insert_tenant" ON data_sources FOR INSERT
WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "data_sources_update_tenant" ON data_sources FOR UPDATE
USING (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
))
WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "data_sources_delete_tenant" ON data_sources FOR DELETE
USING (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

-- dashboards policies
CREATE POLICY "dashboards_select_tenant" ON dashboards FOR SELECT
USING (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "dashboards_insert_tenant" ON dashboards FOR INSERT
WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "dashboards_update_tenant" ON dashboards FOR UPDATE
USING (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
))
WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "dashboards_delete_tenant" ON dashboards FOR DELETE
USING (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

-- dashboard_widgets policies
CREATE POLICY "widgets_select_dashboard" ON dashboard_widgets FOR SELECT
USING (dashboard_id IN (
    SELECT id FROM dashboards WHERE tenant_id IN (
        SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
));

CREATE POLICY "widgets_insert_dashboard" ON dashboard_widgets FOR INSERT
WITH CHECK (dashboard_id IN (
    SELECT id FROM dashboards WHERE tenant_id IN (
        SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
));

CREATE POLICY "widgets_update_dashboard" ON dashboard_widgets FOR UPDATE
USING (dashboard_id IN (
    SELECT id FROM dashboards WHERE tenant_id IN (
        SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
))
WITH CHECK (dashboard_id IN (
    SELECT id FROM dashboards WHERE tenant_id IN (
        SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
));

CREATE POLICY "widgets_delete_dashboard" ON dashboard_widgets FOR DELETE
USING (dashboard_id IN (
    SELECT id FROM dashboards WHERE tenant_id IN (
        SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
));

-- suppliers policies
CREATE POLICY "suppliers_select_tenant" ON suppliers FOR SELECT
USING (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "suppliers_insert_tenant" ON suppliers FOR INSERT
WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "suppliers_update_tenant" ON suppliers FOR UPDATE
USING (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
))
WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "suppliers_delete_tenant" ON suppliers FOR DELETE
USING (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

-- supplier_ratings policies
CREATE POLICY "supplier_ratings_select_tenant" ON supplier_ratings FOR SELECT
USING (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "supplier_ratings_insert_tenant" ON supplier_ratings FOR INSERT
WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "supplier_ratings_update_tenant" ON supplier_ratings FOR UPDATE
USING (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
))
WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

-- record_relationships policies
CREATE POLICY "relationships_select_tenant" ON record_relationships FOR SELECT
USING (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "relationships_insert_tenant" ON record_relationships FOR INSERT
WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "relationships_delete_own" ON record_relationships FOR DELETE
USING (created_by = auth.uid());

-- record_activity policies
CREATE POLICY "activity_select_tenant" ON record_activity FOR SELECT
USING (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "activity_insert_system" ON record_activity FOR INSERT
WITH CHECK (true);

-- activity_logs policies
CREATE POLICY "logs_select_tenant" ON activity_logs FOR SELECT
USING (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "logs_insert_tenant" ON activity_logs FOR INSERT
WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
));

-- ============================================================================
-- STEP 8: SEED INITIAL DATA
-- ============================================================================

DO $$
BEGIN
    -- 8.1 Insert Main Modules (System-wide, read-only)
    INSERT INTO main_modules (code, name, icon, description, status) VALUES
    (
        'HR',
        '{"en": "Human Resources", "ar": "الموارد البشرية"}'::jsonb,
        'Users',
        '{"en": "Manage employees, payroll, and attendance", "ar": "إدارة الموظفين والراتب والحضور"}'::jsonb,
        'active'
    ),
    (
        'CRM',
        '{"en": "Customer Relationship Management", "ar": "إدارة علاقات العملاء"}'::jsonb,
        'Users',
        '{"en": "Manage customers, sales, and communications", "ar": "إدارة العملاء والمبيعات والاتصالات"}'::jsonb,
        'active'
    ),
    (
        'INVENTORY',
        '{"en": "Inventory Management", "ar": "إدارة المخزون"}'::jsonb,
        'Package',
        '{"en": "Track stock levels and product information", "ar": "تتبع مستويات المخزون ومعلومات المنتجات"}'::jsonb,
        'active'
    ),
    (
        'LOGISTICS',
        '{"en": "Logistics & Shipping", "ar": "الخدمات اللوجستية والشحن"}'::jsonb,
        'Truck',
        '{"en": "Manage shipments and delivery tracking", "ar": "إدارة الشحنات وتتبع التسليم"}'::jsonb,
        'active'
    ),
    (
        'SUPPLIERS',
        '{"en": "Supplier Management", "ar": "إدارة الموردين"}'::jsonb,
        'Building',
        '{"en": "Manage suppliers and purchasing", "ar": "إدارة الموردين والمشتريات"}'::jsonb,
        'active'
    );

    -- Output confirmation
    RAISE NOTICE 'Database has been successfully rebuilt!';
    RAISE NOTICE 'All tables created with proper schemas, indexes, and RLS policies.';
    RAISE NOTICE 'Seed data: 5 main modules created';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Create test tenant and users using register/signup flow';
    RAISE NOTICE '2. Or manually seed test data using SEED_TEST_DATA.sql script';
    RAISE NOTICE '3. Configure Frontend with your Supabase credentials';

END $$;

-- ============================================================================
-- END OF DATABASE RESET AND REBUILD SCRIPT
-- ============================================================================
