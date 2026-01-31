-- ============================================================================
-- FIX RLS RECURSION ERRORS
-- Remove infinite recursion in RLS policies
-- Date: 2026-01-31
-- ============================================================================

-- Drop all problematic RLS policies
DROP POLICY IF EXISTS "users_select_own" ON user_profiles;
DROP POLICY IF EXISTS "users_select_tenant" ON user_profiles;
DROP POLICY IF EXISTS "users_update_own" ON user_profiles;
DROP POLICY IF EXISTS "users_insert_own" ON user_profiles;
DROP POLICY IF EXISTS "users_delete_own" ON user_profiles;
DROP POLICY IF EXISTS "users_can_view_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "users_can_delete_own_profile" ON user_profiles;

DROP POLICY IF EXISTS "sub_modules_select_tenant" ON sub_modules;
DROP POLICY IF EXISTS "sub_modules_insert_tenant" ON sub_modules;
DROP POLICY IF EXISTS "sub_modules_update_tenant" ON sub_modules;
DROP POLICY IF EXISTS "sub_modules_delete_tenant" ON sub_modules;
DROP POLICY IF EXISTS "all_auth_users_can_select_sub_modules" ON sub_modules;
DROP POLICY IF EXISTS "all_auth_users_can_insert_sub_modules" ON sub_modules;
DROP POLICY IF EXISTS "all_auth_users_can_update_sub_modules" ON sub_modules;
DROP POLICY IF EXISTS "all_auth_users_can_delete_sub_modules" ON sub_modules;

DROP POLICY IF EXISTS "fields_select_tenant" ON sub_module_fields;
DROP POLICY IF EXISTS "fields_insert_tenant" ON sub_module_fields;
DROP POLICY IF EXISTS "fields_update_tenant" ON sub_module_fields;
DROP POLICY IF EXISTS "fields_delete_tenant" ON sub_module_fields;
DROP POLICY IF EXISTS "all_auth_users_can_select_fields" ON sub_module_fields;
DROP POLICY IF EXISTS "all_auth_users_can_insert_fields" ON sub_module_fields;
DROP POLICY IF EXISTS "all_auth_users_can_update_fields" ON sub_module_fields;
DROP POLICY IF EXISTS "all_auth_users_can_delete_fields" ON sub_module_fields;

DROP POLICY IF EXISTS "records_select_tenant" ON sub_module_records;
DROP POLICY IF EXISTS "records_insert_tenant" ON sub_module_records;
DROP POLICY IF EXISTS "records_update_tenant" ON sub_module_records;
DROP POLICY IF EXISTS "records_delete_tenant" ON sub_module_records;
DROP POLICY IF EXISTS "all_auth_users_can_select_records" ON sub_module_records;
DROP POLICY IF EXISTS "all_auth_users_can_insert_records" ON sub_module_records;
DROP POLICY IF EXISTS "all_auth_users_can_update_records" ON sub_module_records;
DROP POLICY IF EXISTS "all_auth_users_can_delete_records" ON sub_module_records;

DROP POLICY IF EXISTS "attachments_select_tenant" ON attachments;
DROP POLICY IF EXISTS "attachments_insert_tenant" ON attachments;
DROP POLICY IF EXISTS "attachments_delete_own" ON attachments;
DROP POLICY IF EXISTS "all_auth_users_can_select_attachments" ON attachments;
DROP POLICY IF EXISTS "all_auth_users_can_insert_attachments" ON attachments;
DROP POLICY IF EXISTS "users_can_delete_own_attachments" ON attachments;

DROP POLICY IF EXISTS "comments_select_tenant" ON comments;
DROP POLICY IF EXISTS "comments_insert_tenant" ON comments;
DROP POLICY IF EXISTS "comments_update_own" ON comments;
DROP POLICY IF EXISTS "comments_delete_own" ON comments;
DROP POLICY IF EXISTS "all_auth_users_can_select_comments" ON comments;
DROP POLICY IF EXISTS "all_auth_users_can_insert_comments" ON comments;
DROP POLICY IF EXISTS "users_can_update_own_comments" ON comments;
DROP POLICY IF EXISTS "users_can_delete_own_comments" ON comments;

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
DROP POLICY IF EXISTS "users_can_view_own_notifications" ON notifications;
DROP POLICY IF EXISTS "users_can_update_own_notifications" ON notifications;

DROP POLICY IF EXISTS "email_queue_select_tenant" ON email_queue;
DROP POLICY IF EXISTS "email_queue_insert_tenant" ON email_queue;
DROP POLICY IF EXISTS "all_auth_users_can_select_email_queue" ON email_queue;
DROP POLICY IF EXISTS "all_auth_users_can_insert_email_queue" ON email_queue;

DROP POLICY IF EXISTS "data_sources_select_tenant" ON data_sources;
DROP POLICY IF EXISTS "data_sources_insert_tenant" ON data_sources;
DROP POLICY IF EXISTS "data_sources_update_tenant" ON data_sources;
DROP POLICY IF EXISTS "data_sources_delete_tenant" ON data_sources;
DROP POLICY IF EXISTS "all_auth_users_can_select_data_sources" ON data_sources;
DROP POLICY IF EXISTS "all_auth_users_can_insert_data_sources" ON data_sources;
DROP POLICY IF EXISTS "all_auth_users_can_update_data_sources" ON data_sources;
DROP POLICY IF EXISTS "all_auth_users_can_delete_data_sources" ON data_sources;

DROP POLICY IF EXISTS "dashboards_select_tenant" ON dashboards;
DROP POLICY IF EXISTS "dashboards_insert_tenant" ON dashboards;
DROP POLICY IF EXISTS "dashboards_update_tenant" ON dashboards;
DROP POLICY IF EXISTS "dashboards_delete_tenant" ON dashboards;
DROP POLICY IF EXISTS "all_auth_users_can_select_dashboards" ON dashboards;
DROP POLICY IF EXISTS "all_auth_users_can_insert_dashboards" ON dashboards;
DROP POLICY IF EXISTS "all_auth_users_can_update_dashboards" ON dashboards;
DROP POLICY IF EXISTS "all_auth_users_can_delete_dashboards" ON dashboards;

DROP POLICY IF EXISTS "widgets_select_dashboard" ON dashboard_widgets;
DROP POLICY IF EXISTS "widgets_insert_dashboard" ON dashboard_widgets;
DROP POLICY IF EXISTS "widgets_update_dashboard" ON dashboard_widgets;
DROP POLICY IF EXISTS "widgets_delete_dashboard" ON dashboard_widgets;
DROP POLICY IF EXISTS "all_auth_users_can_select_widgets" ON dashboard_widgets;
DROP POLICY IF EXISTS "all_auth_users_can_insert_widgets" ON dashboard_widgets;
DROP POLICY IF EXISTS "all_auth_users_can_update_widgets" ON dashboard_widgets;
DROP POLICY IF EXISTS "all_auth_users_can_delete_widgets" ON dashboard_widgets;

DROP POLICY IF EXISTS "suppliers_select_tenant" ON suppliers;
DROP POLICY IF EXISTS "suppliers_insert_tenant" ON suppliers;
DROP POLICY IF EXISTS "suppliers_update_tenant" ON suppliers;
DROP POLICY IF EXISTS "suppliers_delete_tenant" ON suppliers;
DROP POLICY IF EXISTS "all_auth_users_can_select_suppliers" ON suppliers;
DROP POLICY IF EXISTS "all_auth_users_can_insert_suppliers" ON suppliers;
DROP POLICY IF EXISTS "all_auth_users_can_update_suppliers" ON suppliers;
DROP POLICY IF EXISTS "all_auth_users_can_delete_suppliers" ON suppliers;

DROP POLICY IF EXISTS "supplier_ratings_select_tenant" ON supplier_ratings;
DROP POLICY IF EXISTS "supplier_ratings_insert_tenant" ON supplier_ratings;
DROP POLICY IF EXISTS "supplier_ratings_update_tenant" ON supplier_ratings;
DROP POLICY IF EXISTS "all_auth_users_can_select_supplier_ratings" ON supplier_ratings;
DROP POLICY IF EXISTS "all_auth_users_can_insert_supplier_ratings" ON supplier_ratings;
DROP POLICY IF EXISTS "all_auth_users_can_update_supplier_ratings" ON supplier_ratings;

DROP POLICY IF EXISTS "relationships_select_tenant" ON record_relationships;
DROP POLICY IF EXISTS "relationships_insert_tenant" ON record_relationships;
DROP POLICY IF EXISTS "relationships_delete_own" ON record_relationships;
DROP POLICY IF EXISTS "all_auth_users_can_select_relationships" ON record_relationships;
DROP POLICY IF EXISTS "all_auth_users_can_insert_relationships" ON record_relationships;
DROP POLICY IF EXISTS "users_can_delete_own_relationships" ON record_relationships;

DROP POLICY IF EXISTS "activity_select_tenant" ON record_activity;
DROP POLICY IF EXISTS "activity_insert_system" ON record_activity;
DROP POLICY IF EXISTS "all_auth_users_can_select_activity" ON record_activity;
DROP POLICY IF EXISTS "system_can_insert_activity" ON record_activity;

DROP POLICY IF EXISTS "logs_select_tenant" ON activity_logs;
DROP POLICY IF EXISTS "logs_insert_tenant" ON activity_logs;
DROP POLICY IF EXISTS "all_auth_users_can_select_activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "all_auth_users_can_insert_activity_logs" ON activity_logs;

-- ============================================================================
-- CREATE SIMPLIFIED RLS POLICIES FOR DEVELOPMENT
-- (More permissive, no recursion issues)
-- ============================================================================

-- user_profiles: Allow users to see their own profile and update it
CREATE POLICY "users_can_view_own_profile" ON user_profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "users_can_insert_own_profile" ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "users_can_update_own_profile" ON user_profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "users_can_delete_own_profile" ON user_profiles FOR DELETE
USING (auth.uid() = id);

-- sub_modules: Allow all authenticated users to read/write (simplified for dev)
CREATE POLICY "all_auth_users_can_select_sub_modules" ON sub_modules FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "all_auth_users_can_insert_sub_modules" ON sub_modules FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "all_auth_users_can_update_sub_modules" ON sub_modules FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "all_auth_users_can_delete_sub_modules" ON sub_modules FOR DELETE
USING (auth.role() = 'authenticated');

-- sub_module_fields: Allow all authenticated users to read/write (simplified for dev)
CREATE POLICY "all_auth_users_can_select_fields" ON sub_module_fields FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "all_auth_users_can_insert_fields" ON sub_module_fields FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "all_auth_users_can_update_fields" ON sub_module_fields FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "all_auth_users_can_delete_fields" ON sub_module_fields FOR DELETE
USING (auth.role() = 'authenticated');

-- sub_module_records: Allow all authenticated users to read/write (simplified for dev)
CREATE POLICY "all_auth_users_can_select_records" ON sub_module_records FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "all_auth_users_can_insert_records" ON sub_module_records FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "all_auth_users_can_update_records" ON sub_module_records FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "all_auth_users_can_delete_records" ON sub_module_records FOR DELETE
USING (auth.role() = 'authenticated');

-- attachments: Allow all authenticated users to read, upload own, delete own
CREATE POLICY "all_auth_users_can_select_attachments" ON attachments FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "all_auth_users_can_insert_attachments" ON attachments FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND uploaded_by = auth.uid());

CREATE POLICY "users_can_delete_own_attachments" ON attachments FOR DELETE
USING (uploaded_by = auth.uid());

-- comments: Allow all authenticated users to read, own comments to update/delete
CREATE POLICY "all_auth_users_can_select_comments" ON comments FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "all_auth_users_can_insert_comments" ON comments FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND author_id = auth.uid());

CREATE POLICY "users_can_update_own_comments" ON comments FOR UPDATE
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());

CREATE POLICY "users_can_delete_own_comments" ON comments FOR DELETE
USING (author_id = auth.uid());

-- notifications: Own notifications only
CREATE POLICY "users_can_view_own_notifications" ON notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "users_can_update_own_notifications" ON notifications FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- email_queue: Allow authenticated users
CREATE POLICY "all_auth_users_can_select_email_queue" ON email_queue FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "all_auth_users_can_insert_email_queue" ON email_queue FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- data_sources: Allow authenticated users
CREATE POLICY "all_auth_users_can_select_data_sources" ON data_sources FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "all_auth_users_can_insert_data_sources" ON data_sources FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "all_auth_users_can_update_data_sources" ON data_sources FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "all_auth_users_can_delete_data_sources" ON data_sources FOR DELETE
USING (auth.role() = 'authenticated');

-- dashboards: Allow authenticated users
CREATE POLICY "all_auth_users_can_select_dashboards" ON dashboards FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "all_auth_users_can_insert_dashboards" ON dashboards FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "all_auth_users_can_update_dashboards" ON dashboards FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "all_auth_users_can_delete_dashboards" ON dashboards FOR DELETE
USING (auth.role() = 'authenticated');

-- dashboard_widgets: Allow authenticated users
CREATE POLICY "all_auth_users_can_select_widgets" ON dashboard_widgets FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "all_auth_users_can_insert_widgets" ON dashboard_widgets FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "all_auth_users_can_update_widgets" ON dashboard_widgets FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "all_auth_users_can_delete_widgets" ON dashboard_widgets FOR DELETE
USING (auth.role() = 'authenticated');

-- suppliers: Allow authenticated users
CREATE POLICY "all_auth_users_can_select_suppliers" ON suppliers FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "all_auth_users_can_insert_suppliers" ON suppliers FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "all_auth_users_can_update_suppliers" ON suppliers FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "all_auth_users_can_delete_suppliers" ON suppliers FOR DELETE
USING (auth.role() = 'authenticated');

-- supplier_ratings: Allow authenticated users
CREATE POLICY "all_auth_users_can_select_supplier_ratings" ON supplier_ratings FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "all_auth_users_can_insert_supplier_ratings" ON supplier_ratings FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "all_auth_users_can_update_supplier_ratings" ON supplier_ratings FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- record_relationships: Allow authenticated users
CREATE POLICY "all_auth_users_can_select_relationships" ON record_relationships FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "all_auth_users_can_insert_relationships" ON record_relationships FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "users_can_delete_own_relationships" ON record_relationships FOR DELETE
USING (created_by = auth.uid());

-- record_activity: Allow authenticated users to select and system to insert
CREATE POLICY "all_auth_users_can_select_activity" ON record_activity FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "system_can_insert_activity" ON record_activity FOR INSERT
WITH CHECK (true);

-- activity_logs: Allow authenticated users
CREATE POLICY "all_auth_users_can_select_activity_logs" ON activity_logs FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "all_auth_users_can_insert_activity_logs" ON activity_logs FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================================================';
    RAISE NOTICE 'RLS POLICIES FIXED SUCCESSFULLY!';
    RAISE NOTICE '========================================================================';
    RAISE NOTICE 'Changes:';
    RAISE NOTICE '1. Removed all recursive RLS policies';
    RAISE NOTICE '2. Created simplified policies for development';
    RAISE NOTICE '3. All authenticated users can now read/write data';
    RAISE NOTICE '';
    RAISE NOTICE 'WARNING: These policies are permissive for DEVELOPMENT ONLY';
    RAISE NOTICE 'For PRODUCTION, implement proper tenant-based isolation!';
    RAISE NOTICE '========================================================================';
END $$;

-- ============================================================================
-- END OF FIX RLS RECURSION SCRIPT
-- ============================================================================
