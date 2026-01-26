#!/usr/bin/env node
/**
 * Script to create test users in Supabase Auth
 * Usage: node scripts/create-test-users.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const testUsers = [
  {
    email: 'admin@test.com',
    password: 'Admin@123456',
    profile: {
      full_name: 'Admin User',
      phone_number: '+1-555-2001',
      role_code: 'admin'
    }
  },
  {
    email: 'manager@test.com',
    password: 'Manager@123456',
    profile: {
      full_name: 'Manager User',
      phone_number: '+1-555-2002',
      role_code: 'manager'
    }
  },
  {
    email: 'user1@test.com',
    password: 'User@123456',
    profile: {
      full_name: 'Staff User 1',
      phone_number: '+1-555-2003',
      role_code: 'user'
    }
  },
  {
    email: 'user2@test.com',
    password: 'User@123456',
    profile: {
      full_name: 'Staff User 2',
      phone_number: '+1-555-2004',
      role_code: 'user'
    }
  },
  {
    email: 'viewer@test.com',
    password: 'Viewer@123456',
    profile: {
      full_name: 'Viewer User',
      phone_number: '+1-555-2005',
      role_code: 'viewer'
    }
  }
];

async function createTestUsers() {
  console.log('🚀 Starting test user creation...\n');

  try {
    for (const user of testUsers) {
      try {
        console.log(`Creating user: ${user.email}`);
        
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true
        });

        if (authError) {
          console.error(`  ❌ Error creating auth user: ${authError.message}`);
          continue;
        }

        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authUser.user.id,
            full_name: user.profile.full_name,
            phone_number: user.profile.phone_number,
            role_code: user.profile.role_code,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.profile.full_name.replace(/\s+/g, '')}`,
            status: 'active'
          });

        if (profileError) {
          console.error(`  ❌ Error creating profile: ${profileError.message}`);
          continue;
        }

        // Assign to first tenant
        const { data: tenants, error: tenantError } = await supabase
          .from('tenants')
          .select('id')
          .limit(1);

        if (tenantError || !tenants || tenants.length === 0) {
          console.error(`  ❌ Error fetching tenant: ${tenantError?.message || 'No tenants found'}`);
          continue;
        }

        const tenantId = tenants[0].id;

        const { error: assignError } = await supabase
          .from('tenant_users')
          .insert({
            tenant_id: tenantId,
            user_id: authUser.user.id,
            role: user.profile.role_code === 'admin' ? 'admin' : 
                  user.profile.role_code === 'manager' ? 'manager' :
                  user.profile.role_code === 'user' ? 'user' : 'viewer'
          });

        if (assignError && !assignError.message.includes('duplicate')) {
          console.error(`  ❌ Error assigning to tenant: ${assignError.message}`);
          continue;
        }

        console.log(`  ✅ User created successfully`);
        console.log(`     Email: ${user.email}`);
        console.log(`     Password: ${user.password}`);
        console.log(`     Role: ${user.profile.role_code}\n`);

      } catch (error) {
        console.error(`  ❌ Unexpected error: ${error.message}\n`);
      }
    }

    console.log('✅ Test user creation completed!');
    console.log('\n📝 Test Users Summary:');
    console.log('─'.repeat(60));
    testUsers.forEach(user => {
      console.log(`Email: ${user.email.padEnd(20)} | Password: ${user.password}`);
    });
    console.log('─'.repeat(60));

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

createTestUsers();
