#!/usr/bin/env node

/**
 * Create Test Users for Additional Tenants
 * Adds admin users to each tenant for testing
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ihbmtyowpnhehcslpdij.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloYm10eW93cG5oZWhjc2xwZGlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzYyMTk0MiwiZXhwIjoyMDgzMTk3OTQyfQ.d5FXqGDOammpdDjPCD2ulTdn5X_QFyhYtC3fm9HqpzQ';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const log = (msg) => console.log(`✅ ${msg}`);
const error = (title, err) => console.log(`❌ ${title}: ${err?.message || err}`);

async function createTestUsers() {
  try {
    log('Creating test users for tenants...\n');

    // Get all tenants
    const { data: tenants } = await supabase
      .from('tenants')
      .select('*');

    console.log(`Found ${tenants?.length || 0} tenants\n`);

    const testUsers = [
      {
        email: 'admin.techstartup@test.com',
        password: 'TestPassword@123456',
        fullName: 'Tech Startup Admin',
        tenantCode: 'tech-startup'
      },
      {
        email: 'admin.retail@test.com',
        password: 'TestPassword@123456',
        fullName: 'Retail Admin',
        tenantCode: 'retail-chain'
      },
      {
        email: 'admin.healthcare@test.com',
        password: 'TestPassword@123456',
        fullName: 'Healthcare Admin',
        tenantCode: 'healthcare-plus'
      }
    ];

    for (const testUser of testUsers) {
      // Find tenant
      const tenant = tenants?.find(t => t.code === testUser.tenantCode);
      if (!tenant) {
        error('Tenant not found', testUser.tenantCode);
        continue;
      }

      // Check if user already exists
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', testUser.email);

      if (existing && existing.length > 0) {
        log(`User already exists: ${testUser.email}`);
        continue;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true,
        user_metadata: {
          full_name: testUser.fullName
        }
      });

      if (authError) {
        error(`Failed to create auth user ${testUser.email}`, authError);
        continue;
      }

      const userId = authData?.user?.id;
      log(`Created auth user: ${testUser.email}`);

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          email: testUser.email,
          full_name: testUser.fullName,
          tenant_id: tenant.id,
          role_code: 'admin'
        });

      if (profileError) {
        // If profile creation fails due to unique constraint, try update instead
        if (profileError.message.includes('unique')) {
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
              email: testUser.email,
              full_name: testUser.fullName,
              tenant_id: tenant.id,
              role_code: 'admin'
            })
            .eq('id', userId);

          if (updateError) {
            error(`Failed to update profile for ${testUser.email}`, updateError);
          } else {
            log(`Updated profile for ${testUser.email} in tenant ${tenant.name}`);
          }
        } else {
          error(`Failed to create profile for ${testUser.email}`, profileError);
        }
      } else {
        log(`Created profile for ${testUser.email} in tenant ${tenant.name}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    log('Test users created successfully!\n');
    
    console.log('Test Users Credentials:');
    testUsers.forEach(u => {
      const tenant = tenants?.find(t => t.code === u.tenantCode);
      console.log(`
  Tenant: ${tenant?.name}
  Email: ${u.email}
  Password: ${u.password}
      `);
    });

  } catch (err) {
    error('FATAL ERROR', err);
  }
}

createTestUsers();
