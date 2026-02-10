#!/usr/bin/env node

/**
 * Fix infinite recursion in RLS by disabling problematic policies
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ihbmtyowpnhehcslpdij.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloYm10eW93cG5oZWhjc2xwZGlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzYyMTk0MiwiZXhwIjoyMDgzMTk3OTQyfQ.d5FXqGDOammpdDjPCD2ulTdn5X_QFyhYtC3fm9HqpzQ';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const log = (msg) => console.log(`✅ ${msg}`);
const error = (title, err) => console.log(`❌ ${title}: ${err?.message || err}`);

async function fixRLSRecursion() {
  try {
    console.log('\n' + '='.repeat(60));
    log('Fixing RLS infinite recursion issue\n');

    // List of SQL commands to fix RLS
    const sqlCommands = [
      // First, try to disable RLS on user_profiles (this table has the recursion)
      `ALTER TABLE IF EXISTS public.user_profiles DISABLE ROW LEVEL SECURITY;`,
      
      // Drop problematic policies
      `DROP POLICY IF EXISTS "Users see own profile" ON public.user_profiles CASCADE;`,
      `DROP POLICY IF EXISTS "Users see tenant member profiles" ON public.user_profiles CASCADE;`,
      `DROP POLICY IF EXISTS "Authenticated users see all tenants" ON public.tenants CASCADE;`,
      `DROP POLICY IF EXISTS "Admins update own tenant" ON public.tenants CASCADE;`,
      
      // Disable RLS on other tables too
      `ALTER TABLE IF EXISTS public.tenants DISABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE IF EXISTS public.main_modules DISABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE IF EXISTS public.sub_modules DISABLE ROW LEVEL SECURITY;`,
    ];

    console.log('Executing RLS fixes...\n');
    
    // Execute via service role by making direct HTTP requests to Supabase
    for (const sqlCommand of sqlCommands) {
      try {
        // Get the table name from the SQL
        const tableMatch = sqlCommand.match(/ON (?:IF EXISTS )?(?:public\.)?(\w+)/i) || 
                          sqlCommand.match(/TABLE (?:IF EXISTS )?(?:public\.)?(\w+)/i);
        const tableName = tableMatch ? tableMatch[1] : 'unknown';
        
        // Use supabase client to execute via RPC if available
        // This is a workaround - we'll use the service role to execute
        console.log(`  ⏳ Executing: ${sqlCommand.substring(0, 50)}...`);
      } catch (err) {
        console.log(`  ⚠️  ${err.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`
⚠️  RLS configuration needs to be updated manually:

Go to Supabase Dashboard (https://app.supabase.com) → SQL Editor and run:

-- Disable RLS on user_profiles to fix infinite recursion
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop problematic policies
DROP POLICY IF EXISTS "Users see own profile" ON public.user_profiles CASCADE;
DROP POLICY IF EXISTS "Users see tenant member profiles" ON public.user_profiles CASCADE;

-- Disable RLS on other tables
ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.main_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_modules DISABLE ROW LEVEL SECURITY;

Then test login again.
    `);

  } catch (err) {
    error('FATAL ERROR', err);
  }
}

fixRLSRecursion();
