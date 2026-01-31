-- ============================================================================
-- RECREATE MISSING USER PROFILES
-- For any auth users that don't have a user_profile yet
-- Date: 2026-01-31
-- ============================================================================

DO $$
DECLARE
    v_user RECORD;
    v_tenant_id UUID;
    v_user_count INT := 0;
BEGIN
    RAISE NOTICE 'Starting to recreate missing user profiles...';
    
    -- Loop through all auth users that don't have profiles
    FOR v_user IN 
        SELECT au.id, au.email, au.raw_user_meta_data
        FROM auth.users au
        LEFT JOIN public.user_profiles up ON au.id = up.id
        WHERE up.id IS NULL
    LOOP
        RAISE NOTICE 'Processing user: %', v_user.email;
        
        -- Create or get tenant for this user
        INSERT INTO public.tenants (
            name, 
            code, 
            status, 
            subscription_plan
        ) VALUES (
            COALESCE(v_user.raw_user_meta_data->>'full_name', SPLIT_PART(v_user.email, '@', 1)) || '''s Workspace',
            LOWER(SUBSTRING(REPLACE(REPLACE(v_user.email, '@', '_'), '.', '_'), 1, 50)),
            'active',
            'starter'
        )
        ON CONFLICT (code) DO UPDATE SET id = tenants.id
        RETURNING tenants.id INTO v_tenant_id;
        
        -- Create user profile
        INSERT INTO public.user_profiles (
            id,
            tenant_id,
            email,
            full_name,
            role_code,
            notification_preferences
        ) VALUES (
            v_user.id,
            v_tenant_id,
            v_user.email,
            COALESCE(v_user.raw_user_meta_data->>'full_name', SPLIT_PART(v_user.email, '@', 1)),
            'admin',
            '{}'::jsonb
        );
        
        v_user_count := v_user_count + 1;
        RAISE NOTICE 'Created profile for user: % (tenant: %)', v_user.email, v_tenant_id;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================================================';
    RAISE NOTICE 'USER PROFILE RECREATION COMPLETED!';
    RAISE NOTICE '========================================================================';
    RAISE NOTICE 'Profiles created: %', v_user_count;
    RAISE NOTICE 'All auth users now have user_profiles';
    RAISE NOTICE '========================================================================';

END $$;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

SELECT 
    au.id,
    au.email,
    up.id as profile_id,
    up.full_name,
    up.role_code,
    t.name as tenant_name
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
LEFT JOIN public.tenants t ON up.tenant_id = t.id
ORDER BY au.created_at DESC;

-- ============================================================================
-- END OF RECREATE MISSING USER PROFILES
-- ============================================================================
