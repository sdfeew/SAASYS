#!/usr/bin/env node
/**
 * Simple Setup - Creates modules and records
 * Usage: npm run setup
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing env variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const processSetup = async () => {
  console.log('🚀 Setting up modules and records...\n');

  try {
    // 1. Get main modules
    console.log('📋 Step 1: Getting main modules...');
    const { data: mainModules } = await supabase
      .from('main_modules')
      .select('id, code')
      .eq('status', 'active');
    
    console.log(`   ✅ Found ${mainModules?.length || 0} main modules\n`);

    // 2. Get all tenants
    console.log('📋 Step 2: Getting all tenants...');
    const { data: tenants } = await supabase
      .from('tenants')
      .select('id, code')
      .eq('status', 'active')
      .limit(100);

    console.log(`   ✅ Found ${tenants?.length || 0} tenants\n`);

    // 3. Create sub modules for each tenant
    console.log('📋 Step 3: Creating sub modules...');
    let subModulesCreated = 0;
    let subModulesSkipped = 0;

    for (const tenant of tenants || []) {
      for (const mainModule of mainModules || []) {
        // Check if exists
        const { data: exists } = await supabase
          .from('sub_modules')
          .select('id')
          .eq('tenant_id', tenant.id)
          .eq('main_module_id', mainModule.id)
          .maybeSingle();

        if (exists) {
          subModulesSkipped++;
          continue;
        }

        // Create sub module with proper code
        const subModuleCode = `${tenant.code}-${mainModule.code}`;
        const { error } = await supabase
          .from('sub_modules')
          .insert({
            tenant_id: tenant.id,
            main_module_id: mainModule.id,
            name: mainModule.code,
            code: subModuleCode,
            status: 'active'
          });

        if (!error) subModulesCreated++;
      }
    }

    console.log(`   ✅ Created ${subModulesCreated} sub modules (${subModulesSkipped} already existed)\n`);

    // 4. Get all sub modules for records
    console.log('📋 Step 4: Populating records...');
    const { data: subModules } = await supabase
      .from('sub_modules')
      .select('id, code, tenant_id')
      .eq('status', 'active');

    let recordsCreated = 0;
    const recordsPerModule = 10; // Sample size

    // Generate simple records
    for (const subModule of subModules || []) {
      const records = [];
      const baseName = subModule.code.split('-')[0];

      for (let i = 0; i < recordsPerModule; i++) {
        records.push({
          sub_module_id: subModule.id,
          tenant_id: subModule.tenant_id,
          data: JSON.stringify({
            name: `${baseName} Record ${i + 1}`,
            created_at: new Date().toISOString(),
            status: 'active'
          })
        });
      }

      const { data: inserted } = await supabase
        .from('sub_module_records')
        .insert(records)
        .select();

      if (inserted) recordsCreated += inserted.length;
    }

    console.log(`   ✅ Created ${recordsCreated} records\n`);

    console.log('✅ Setup completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   • Main Modules: ${mainModules?.length}`);
    console.log(`   • Sub Modules: ${subModulesCreated} created`);
    console.log(`   • Records: ${recordsCreated}`);
    console.log(`   • Tenants: ${tenants?.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

processSetup();
