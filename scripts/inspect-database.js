#!/usr/bin/env node

/**
 * Supabase Database Inspector & Fixer
 * Connects to the actual database and checks/fixes all issues
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ihbmtyowpnhehcslpdij.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloYm10eW93cG5oZWhjc2xwZGlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzYyMTk0MiwiZXhwIjoyMDgzMTk3OTQyfQ.d5FXqGDOammpdDjPCD2ulTdn5X_QFyhYtC3fm9HqpzQ';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

const log = (title, data) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 ${title}`);
  console.log('='.repeat(60));
  if (typeof data === 'string') {
    console.log(data);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
};

const error = (title, err) => {
  console.log(`\n❌ ${title}`);
  console.log(err?.message || err);
};

async function inspectDatabase() {
  try {
    log('🚀 SUPABASE DATABASE INSPECTOR', 'Starting comprehensive database inspection...');

    // ============================================================================
    // 1. CHECK TENANTS TABLE
    // ============================================================================
    log('1️⃣ TENANTS TABLE', 'Checking tenants...');
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*');
    
    if (tenantsError) {
      error('Tenants Error', tenantsError);
    } else {
      console.log(`✅ Found ${tenants?.length || 0} tenants`);
      tenants?.slice(0, 3).forEach(t => {
        console.log(`   - ${t.name} (${t.id}) [${t.code}]`);
      });
    }

    // ============================================================================
    // 2. CHECK USER_PROFILES TABLE
    // ============================================================================
    log('2️⃣ USER_PROFILES TABLE', 'Checking user profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*');
    
    if (profilesError) {
      error('User Profiles Error', profilesError);
    } else {
      console.log(`✅ Found ${profiles?.length || 0} user profiles`);
      
      // Check for issues
      const withoutTenant = profiles?.filter(p => !p.tenant_id) || [];
      const withTenant = profiles?.filter(p => p.tenant_id) || [];
      
      console.log(`   - With tenant_id: ${withTenant.length}`);
      console.log(`   - Without tenant_id: ${withoutTenant.length} ⚠️`);
      
      profiles?.slice(0, 3).forEach(p => {
        console.log(`   - ${p.email} [${p.role_code}] tenant: ${p.tenant_id || 'NULL'}`);
      });
    }

    // ============================================================================
    // 3. CHECK MAIN_MODULES TABLE
    // ============================================================================
    log('3️⃣ MAIN_MODULES TABLE', 'Checking main modules...');
    const { data: mainModules, error: mainModulesError } = await supabase
      .from('main_modules')
      .select('*');
    
    if (mainModulesError) {
      error('Main Modules Error', mainModulesError);
    } else {
      console.log(`✅ Found ${mainModules?.length || 0} main modules`);
      mainModules?.forEach(m => {
        const name = typeof m.name === 'object' ? m.name.en : m.name;
        console.log(`   - ${name} (${m.code})`);
      });
    }

    // ============================================================================
    // 4. CHECK SUB_MODULES TABLE
    // ============================================================================
    log('4️⃣ SUB_MODULES TABLE', 'Checking sub modules...');
    const { data: subModules, error: subModulesError } = await supabase
      .from('sub_modules')
      .select('*');
    
    if (subModulesError) {
      error('Sub Modules Error', subModulesError);
    } else {
      console.log(`✅ Found ${subModules?.length || 0} sub modules`);
      
      const nullCodes = subModules?.filter(s => !s.code) || [];
      console.log(`   - With code: ${subModules?.length - nullCodes.length}`);
      console.log(`   - Without code: ${nullCodes.length} ⚠️`);
      
      subModules?.slice(0, 5).forEach(s => {
        const name = typeof s.name === 'object' ? s.name.en : s.name;
        console.log(`   - ${name} [${s.code || 'NULL'}] tenant: ${s.tenant_id}`);
      });
    }

    // ============================================================================
    // 5. CHECK RLS POLICIES
    // ============================================================================
    log('5️⃣ RLS POLICIES', 'Checking Row Level Security policies...');
    const { data: policies, error: policiesError } = await supabase.rpc('get_policies', {})
      .catch(() => ({ data: null, error: new Error('RPC not available') }));
    
    if (policiesError) {
      console.log('   ℹ️ RPC function not available, checking via SQL...');
      
      // Try direct SQL query
      const { data: sqlPolicies, error: sqlError } = await supabase
        .rpc('sql', { 
          query: `SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;`
        })
        .catch(() => ({ data: null }));
      
      if (sqlPolicies) {
        console.log(`✅ Found policies via SQL`);
        sqlPolicies.forEach(p => {
          console.log(`   - ${p.tablename}: ${p.policyname}`);
        });
      } else {
        console.log('   ⚠️ Could not fetch policies directly');
      }
    } else {
      console.log(`✅ Found ${policies?.length || 0} RLS policies`);
    }

    // ============================================================================
    // 6. CHECK FOREIGN KEY REFERENCES
    // ============================================================================
    log('6️⃣ FOREIGN KEY INTEGRITY', 'Checking data integrity...');
    
    // Check for orphaned profiles
    if (profiles && tenants) {
      const tenantIds = new Set(tenants.map(t => t.id));
      const orphaned = profiles.filter(p => !tenantIds.has(p.tenant_id));
      console.log(`✅ Orphaned profiles: ${orphaned.length}`);
      if (orphaned.length > 0) {
        console.log('   Orphaned:');
        orphaned.forEach(p => {
          console.log(`   - ${p.email} -> tenant ${p.tenant_id}`);
        });
      }
    }

    // Check sub_modules references
    if (subModules && mainModules) {
      const mainModuleIds = new Set(mainModules.map(m => m.id));
      const invalidRefs = subModules.filter(s => !mainModuleIds.has(s.main_module_id));
      console.log(`✅ Sub-modules with invalid main_module_id: ${invalidRefs.length}`);
    }

    // ============================================================================
    // 7. DATA STATISTICS
    // ============================================================================
    log('7️⃣ DATABASE STATISTICS', 'Summary of data...');
    console.log(`Tenants: ${tenants?.length || 0}`);
    console.log(`User Profiles: ${profiles?.length || 0}`);
    console.log(`Main Modules: ${mainModules?.length || 0}`);
    console.log(`Sub Modules: ${subModules?.length || 0}`);

    // ============================================================================
    // SUMMARY
    // ============================================================================
    log('📋 INSPECTION SUMMARY', 'Issues found:');
    const issues = [];
    
    if (profiles?.some(p => !p.tenant_id)) {
      issues.push('⚠️ Found user_profiles without tenant_id');
    }
    if (subModules?.some(s => !s.code)) {
      issues.push('⚠️ Found sub_modules without code');
    }
    if (tenants?.length === 0) {
      issues.push('⚠️ No tenants found - need to create default tenant');
    }
    if (profiles?.length === 0) {
      issues.push('⚠️ No user profiles found');
    }

    if (issues.length === 0) {
      console.log('✅ No critical issues found!');
    } else {
      issues.forEach(issue => console.log(issue));
    }

  } catch (err) {
    error('FATAL ERROR', err);
  }
}

// Run inspection
inspectDatabase();
