#!/usr/bin/env node

/**
 * Test Authentication Flow
 * Verifies that users can login and access their profile
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ihbmtyowpnhehcslpdij.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloYm10eW93cG5oZWhjc2xwZGlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzYyMTk0MiwiZXhwIjoyMDgzMTk3OTQyfQ.d5FXqGDOammpdDjPCD2ulTdn5X_QFyhYtC3fm9HqpzQ'
);

const testUsers = [
  {
    email: 'walid.genidy@outlook.com',
    password: 'WalidPassword@123456',
    tenant: "Walid Genidy's Workspace"
  },
  {
    email: 'admin.techstartup@test.com',
    password: 'TestPassword@123456',
    tenant: 'Tech Startup Inc'
  },
  {
    email: 'admin.retail@test.com',
    password: 'TestPassword@123456',
    tenant: 'Retail Chain LLC'
  },
  {
    email: 'admin.healthcare@test.com',
    password: 'TestPassword@123456',
    tenant: 'Healthcare Plus'
  }
];

async function testUser(testUser) {
  return new Promise(resolve => {
    setTimeout(async () => {
      try {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Testing: ${testUser.email}`);
        console.log(`Tenant: ${testUser.tenant}`);
        console.log('='.repeat(60));

        // Test login
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: testUser.email,
          password: testUser.password
        });
        
        if (authError) {
          console.log(`❌ Login failed: ${authError.message}`);
          resolve(false);
          return;
        }
        
        if (!authData.user) {
          console.log(`❌ Login failed: No user returned`);
          resolve(false);
          return;
        }
        
        console.log(`✅ Login successful!`);
        console.log(`   User ID: ${authData.user.id}`);
        
        // Test profile fetch
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        
        if (profileError) {
          if (profileError.message.includes('infinite recursion')) {
            console.log(`❌ Profile fetch failed: RLS infinite recursion`);
            console.log(`   → Run the SQL fix commands from RLS_FIX_GUIDE.md`);
            resolve(false);
            return;
          }
          console.log(`❌ Profile fetch failed: ${profileError.message}`);
          resolve(false);
          return;
        }
        
        if (!profileData) {
          console.log(`❌ Profile not found`);
          resolve(false);
          return;
        }
        
        console.log(`✅ Profile loaded!`);
        console.log(`   Name: ${profileData.full_name}`);
        console.log(`   Role: ${profileData.role_code}`);
        console.log(`   Tenant: ${profileData.tenant_id.substring(0, 8)}...`);
        
        // Test module access
        const { data: modules, error: moduleError } = await supabase
          .from('sub_modules')
          .select('*')
          .eq('tenant_id', profileData.tenant_id)
          .limit(3);
        
        if (moduleError) {
          console.log(`⚠️  Module fetch failed: ${moduleError.message}`);
        } else {
          console.log(`✅ Modules accessed!`);
          console.log(`   Found ${modules?.length || 0} modules`);
          if (modules && modules.length > 0) {
            modules.forEach(m => {
              console.log(`     - ${m.name}`);
            });
          }
        }
        
        resolve(true);
        
      } catch (err) {
        console.log(`❌ Error: ${err.message}`);
        resolve(false);
      }
    }, 100); // Small delay between requests
  });
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 AUTHENTICATION & DATA ACCESS TEST');
  console.log('='.repeat(60));
  console.log(`\nTesting ${testUsers.length} users...\n`);

  let passed = 0;
  let failed = 0;

  for (const testUser of testUsers) {
    const result = await testUser(testUser);
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 TEST RESULTS`);
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passed}/${testUsers.length}`);
  console.log(`❌ Failed: ${failed}/${testUsers.length}`);

  if (failed === 0) {
    console.log(`\n🎉 All tests passed! The app is ready for use.`);
    console.log(`\nNext steps:`);
    console.log(`1. Build: npm run build`);
    console.log(`2. Preview: npm run preview`);
    console.log(`3. Deploy: npm run deploy (or git push to Vercel)`);
  } else {
    console.log(`\n⚠️  Some tests failed. Check the errors above.`);
    if (failed === testUsers.length) {
      console.log(`\nLikely cause: RLS infinite recursion`);
      console.log(`Fix: Run the SQL commands in RLS_FIX_GUIDE.md`);
    }
  }
  
  console.log('\n');
}

runTests().catch(console.error);
