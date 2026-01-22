-- Complete Multi-Tenant SaaS Platform Schema
-- Production-ready with RLS, proper relationships, and constraints

-- ============================================================================
-- 1. CORE EXTENSIONS AND FUNCTIONS
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
-- 2. TENANCY & USERS (Core Multi-Tenant Foundation)
-- ============================================================================

-- Tenants (Companies/Organizations)
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

-- User Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    email citext NOT NULL,
    avatar_url TEXT,
    role_code VARCHAR(50) DEFAULT 'user' CHECK (role_code IN ('admin', 'manager', 'user', 'viewer')),
    permissions JSONB DEFAULT '[]' :: jsonb,
    notification_preferences JSONB DEFAULT '{}' :: jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, email)
);

CREATE INDEX idx_user_profiles_tenant ON user_profiles(tenant_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(tenant_id, role_code);

-- ============================================================================
-- 3. MAIN MODULES & DYNAMIC SUB-MODULES
-- ============================================================================

-- Main Modules (System-wide, fixed: HR, CRM, INVENTORY, LOGISTICS, SUPPLIERS)
CREATE TABLE IF NOT EXISTS main_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL CHECK (code IN ('HR', 'CRM', 'INVENTORY', 'LOGISTICS', 'SUPPLIERS')),
    name JSONB NOT NULL, -- {"en": "Human Resources", "ar": "الموارد البشرية"}
    icon VARCHAR(50),
    description JSONB DEFAULT '{}' :: jsonb,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Sub-modules (Dynamic per tenant)
CREATE TABLE IF NOT EXISTS sub_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    main_module_id UUID NOT NULL REFERENCES main_modules(id),
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

-- Dynamic Fields for Sub-modules
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
    ui_config JSONB DEFAULT '{}' :: jsonb, -- placeholder, helpText, searchable, etc
    is_filter BOOLEAN DEFAULT false,
    is_indexed BOOLEAN DEFAULT false,
    is_visible_in_list BOOLEAN DEFAULT true,
    order_index INT DEFAULT 0,
    relation_config JSONB DEFAULT '{}' :: jsonb, -- {reference_table, reference_field, display_field}
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, sub_module_id, name)
);

CREATE INDEX idx_sub_module_fields_tenant ON sub_module_fields(tenant_id);
CREATE INDEX idx_sub_module_fields_sub_module ON sub_module_fields(sub_module_id);

-- ============================================================================
-- 4. DYNAMIC DATA STORAGE (All module records stored as JSONB)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sub_module_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sub_module_id UUID NOT NULL REFERENCES sub_modules(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived', 'deleted')),
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
-- 5. GENERIC SYSTEMS (Attachments, Comments, Notifications)
-- ============================================================================

-- Attachments (Supabase Storage metadata)
CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sub_module_id UUID REFERENCES sub_modules(id) ON DELETE SET NULL,
    record_id UUID REFERENCES sub_module_records(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size_bytes BIGINT,
    storage_path VARCHAR(500) NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attachments_tenant ON attachments(tenant_id);
CREATE INDEX idx_attachments_record ON attachments(record_id);
CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by);

-- Comments with @mentions
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
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- In-app Notifications
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

-- Email Queue for async processing
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
-- 6. DASHBOARD BUILDER (Looker Studio-like)
-- ============================================================================

-- Data Sources (single table or joined)
CREATE TABLE IF NOT EXISTS data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('SINGLE_SUB_MODULE', 'JOINED', 'CUSTOM_SQL')),
    config JSONB NOT NULL, -- join definitions, filters
    field_mappings JSONB NOT NULL, -- available fields for metrics/dimensions
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, code)
);

CREATE INDEX idx_data_sources_tenant ON data_sources(tenant_id);

-- Dashboards (with multi-scope: GLOBAL, MODULE, SUPPLIER)
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

-- Dashboard Widgets
CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('KPI', 'TABLE', 'CHART_BAR', 'CHART_LINE', 'CHART_PIE', 'CHART_AREA', 'GAUGE', 'MAP', 'SCATTER', 'COMBO')),
    title VARCHAR(255),
    description TEXT,
    data_source_id UUID REFERENCES data_sources(id) ON DELETE SET NULL,
    dimension_fields JSONB, -- array of field names
    metric_fields JSONB, -- [{"field": "amount", "aggregation": "SUM", "label": "Total Sales"}]
    filters JSONB DEFAULT '[]' :: jsonb,
    sort_config JSONB DEFAULT '{}' :: jsonb,
    ui_config JSONB DEFAULT '{}' :: jsonb, -- colors, legend, axis labels, etc
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

-- ============================================================================
-- 7. SUPPLIER SYSTEM
-- ============================================================================

-- Suppliers (can be linked to sub_module_records)
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
CREATE INDEX idx_suppliers_category ON suppliers(category);

-- Supplier Ratings (periodic evaluations)
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
CREATE INDEX idx_supplier_ratings_period ON supplier_ratings(period_start_date, period_end_date);

-- ============================================================================
-- 8. ACTIVITY LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'DOWNLOAD', 'SHARE', 'COMMENT', 'MENTION')),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    entity_name VARCHAR(255),
    changes JSONB DEFAULT '{}' :: jsonb, -- {field: {old, new}}
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_tenant ON activity_logs(tenant_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ============================================================================
-- 9. TRIGGERS FOR AUTOMATIC UPDATED_AT
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
-- 10. AUTO CREATE USER PROFILE ON AUTH SIGNUP
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_tenant_id UUID;
    user_full_name VARCHAR(255);
    tenant_code VARCHAR(50);
BEGIN
    -- Extract user's full name from metadata or use email
    user_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        SPLIT_PART(NEW.email, '@', 1)
    );
    
    -- Generate tenant code from email (safe version)
    tenant_code := LOWER(
        SUBSTRING(REPLACE(REPLACE(NEW.email, '@', '_'), '.', '_'), 1, 50)
    );

    -- Create default tenant for new user
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
        -- If tenant creation fails, still continue with profile creation
        RAISE WARNING 'Tenant creation error for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
    END;

    -- Create user profile in default tenant
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- IMPORTANT: All tables must have tenant_id for proper isolation

-- Enable RLS on all tables
-- NOTE: main_modules does NOT have RLS because it's a system-wide table without tenant_id
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's tenant_id
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- USER_PROFILES Policies
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles in tenant"
ON user_profiles FOR SELECT
USING (
    (get_user_tenant_id()) = tenant_id
    AND EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role_code IN ('admin', 'manager')
    )
);

CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admins can manage user profiles"
ON user_profiles FOR ALL
USING (
    (get_user_tenant_id()) = tenant_id
    AND EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role_code = 'admin'
    )
);

-- TENANTS Policies (read-only for users, manage for admins)
CREATE POLICY "Users can view own tenant"
ON tenants FOR SELECT
USING (id = get_user_tenant_id());

CREATE POLICY "Admins can manage tenant"
ON tenants FOR ALL
USING (
    id = get_user_tenant_id()
    AND EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role_code = 'admin'
    )
);

-- SUB_MODULES Policies
CREATE POLICY "Users can view sub_modules in their tenant"
ON sub_modules FOR SELECT
USING ((get_user_tenant_id()) = tenant_id);

CREATE POLICY "Admins can manage sub_modules"
ON sub_modules FOR ALL
USING (
    (get_user_tenant_id()) = tenant_id
    AND EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role_code IN ('admin', 'manager')
    )
);

-- SUB_MODULE_FIELDS Policies
CREATE POLICY "Users can view fields in their tenant"
ON sub_module_fields FOR SELECT
USING ((get_user_tenant_id()) = tenant_id);

CREATE POLICY "Admins can manage fields"
ON sub_module_fields FOR ALL
USING (
    (get_user_tenant_id()) = tenant_id
    AND EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role_code IN ('admin', 'manager')
    )
);

-- SUB_MODULE_RECORDS Policies (most important - data access control)
CREATE POLICY "Users can view records in their tenant"
ON sub_module_records FOR SELECT
USING ((get_user_tenant_id()) = tenant_id);

CREATE POLICY "Users can create records"
ON sub_module_records FOR INSERT
WITH CHECK (
    (get_user_tenant_id()) = tenant_id
    AND auth.uid() = created_by
);

CREATE POLICY "Users can update own records"
ON sub_module_records FOR UPDATE
USING ((get_user_tenant_id()) = tenant_id);

CREATE POLICY "Admins can delete records"
ON sub_module_records FOR DELETE
USING (
    (get_user_tenant_id()) = tenant_id
    AND EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role_code IN ('admin', 'manager')
    )
);

-- ATTACHMENTS Policies
CREATE POLICY "Users can view attachments in tenant"
ON attachments FOR SELECT
USING ((get_user_tenant_id()) = tenant_id);

CREATE POLICY "Users can upload attachments"
ON attachments FOR INSERT
WITH CHECK (
    (get_user_tenant_id()) = tenant_id
    AND auth.uid() = uploaded_by
);

CREATE POLICY "Users can delete own attachments"
ON attachments FOR DELETE
USING (
    (get_user_tenant_id()) = tenant_id
    AND auth.uid() = uploaded_by
);

-- COMMENTS Policies
CREATE POLICY "Users can view comments in tenant"
ON comments FOR SELECT
USING ((get_user_tenant_id()) = tenant_id);

CREATE POLICY "Users can create comments"
ON comments FOR INSERT
WITH CHECK (
    (get_user_tenant_id()) = tenant_id
    AND auth.uid() = author_id
);

CREATE POLICY "Users can update own comments"
ON comments FOR UPDATE
USING (
    (get_user_tenant_id()) = tenant_id
    AND auth.uid() = author_id
);

CREATE POLICY "Users can delete own comments"
ON comments FOR DELETE
USING (
    (get_user_tenant_id()) = tenant_id
    AND auth.uid() = author_id
);

-- NOTIFICATIONS Policies
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

-- EMAIL_QUEUE Policies
CREATE POLICY "Users can view email queue in tenant"
ON email_queue FOR SELECT
USING ((get_user_tenant_id()) = tenant_id);

CREATE POLICY "System can create email queue"
ON email_queue FOR INSERT
WITH CHECK ((get_user_tenant_id()) = tenant_id);

CREATE POLICY "System can update email queue"
ON email_queue FOR UPDATE
USING ((get_user_tenant_id()) = tenant_id);

-- DATA_SOURCES Policies
CREATE POLICY "Users can view data sources in tenant"
ON data_sources FOR SELECT
USING ((get_user_tenant_id()) = tenant_id);

CREATE POLICY "Admins can manage data sources"
ON data_sources FOR ALL
USING (
    (get_user_tenant_id()) = tenant_id
    AND EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role_code IN ('admin', 'manager')
    )
);

-- DASHBOARDS Policies
CREATE POLICY "Users can view dashboards in tenant"
ON dashboards FOR SELECT
USING ((get_user_tenant_id()) = tenant_id);

CREATE POLICY "Users can create dashboards"
ON dashboards FOR INSERT
WITH CHECK (
    (get_user_tenant_id()) = tenant_id
    AND auth.uid() = created_by
);

CREATE POLICY "Users can update own dashboards"
ON dashboards FOR UPDATE
USING (
    (get_user_tenant_id()) = tenant_id
    AND auth.uid() = created_by
);

CREATE POLICY "Users can delete own dashboards"
ON dashboards FOR DELETE
USING (
    (get_user_tenant_id()) = tenant_id
    AND auth.uid() = created_by
);

-- DASHBOARD_WIDGETS Policies
CREATE POLICY "Users can view widgets in tenant dashboards"
ON dashboard_widgets FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM dashboards
        WHERE dashboards.id = dashboard_widgets.dashboard_id
        AND dashboards.tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
    )
);

CREATE POLICY "Users can create widgets in own dashboards"
ON dashboard_widgets FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM dashboards
        WHERE dashboards.id = dashboard_widgets.dashboard_id
        AND dashboards.created_by = auth.uid()
    )
);

CREATE POLICY "Users can update widgets in own dashboards"
ON dashboard_widgets FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM dashboards
        WHERE dashboards.id = dashboard_widgets.dashboard_id
        AND dashboards.created_by = auth.uid()
    )
);

CREATE POLICY "Users can delete widgets in own dashboards"
ON dashboard_widgets FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM dashboards
        WHERE dashboards.id = dashboard_widgets.dashboard_id
        AND dashboards.created_by = auth.uid()
    )
);

-- SUPPLIERS Policies
CREATE POLICY "Users can view suppliers in tenant"
ON suppliers FOR SELECT
USING ((get_user_tenant_id()) = tenant_id);

CREATE POLICY "Admins can manage suppliers"
ON suppliers FOR ALL
USING (
    (get_user_tenant_id()) = tenant_id
    AND EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role_code IN ('admin', 'manager')
    )
);

-- SUPPLIER_RATINGS Policies
CREATE POLICY "Users can view supplier ratings in tenant"
ON supplier_ratings FOR SELECT
USING ((get_user_tenant_id()) = tenant_id);

CREATE POLICY "Managers can create supplier ratings"
ON supplier_ratings FOR INSERT
WITH CHECK (
    (get_user_tenant_id()) = tenant_id
    AND EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role_code IN ('admin', 'manager')
    )
);

CREATE POLICY "Managers can update supplier ratings"
ON supplier_ratings FOR UPDATE
USING (
    (get_user_tenant_id()) = tenant_id
    AND EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role_code IN ('admin', 'manager')
    )
);

-- ACTIVITY_LOGS Policies
CREATE POLICY "Users can view activity logs in tenant"
ON activity_logs FOR SELECT
USING ((get_user_tenant_id()) = tenant_id);

CREATE POLICY "System can create activity logs"
ON activity_logs FOR INSERT
WITH CHECK ((get_user_tenant_id()) = tenant_id);

-- ============================================================================
-- 12. MAIN MODULES SEED DATA (System defaults)
-- ============================================================================

INSERT INTO main_modules (code, name, icon, description, status)
VALUES
    ('HR', '{"en": "Human Resources", "ar": "الموارد البشرية"}', 'Users', '{"en": "Manage employees, attendance, payroll", "ar": "إدارة الموظفين والحضور والرواتب"}', 'active'),
    ('CRM', '{"en": "Customer Relations", "ar": "علاقات العملاء"}', 'UserCheck', '{"en": "Manage customers, leads, opportunities", "ar": "إدارة العملاء والعملاء المتوقعين"}', 'active'),
    ('INVENTORY', '{"en": "Inventory Management", "ar": "إدارة المخزون"}', 'Package', '{"en": "Track products, stock levels, warehouses", "ar": "تتبع المنتجات والمخزون والمستودعات"}', 'active'),
    ('LOGISTICS', '{"en": "Logistics", "ar": "اللوجستيات"}', 'Truck', '{"en": "Manage shipments, deliveries, tracking", "ar": "إدارة الشحنات والتسليمات والتتبع"}', 'active'),
    ('SUPPLIERS', '{"en": "Supplier Management", "ar": "إدارة الموردين"}', 'Building', '{"en": "Manage suppliers, ratings, orders", "ar": "إدارة الموردين والتقييمات والطلبات"}', 'active')
ON CONFLICT DO NOTHING;
