#!/usr/bin/env node

/**
 * Create Sub-Modules for Test Tenants
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ihbmtyowpnhehcslpdij.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloYm10eW93cG5oZWhjc2xwZGlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzYyMTk0MiwiZXhwIjoyMDgzMTk3OTQyfQ.d5FXqGDOammpdDjPCD2ulTdn5X_QFyhYtC3fm9HqpzQ';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const log = (msg) => console.log(`✅ ${msg}`);
const error = (title, err) => console.log(`❌ ${title}: ${err?.message || err}`);

async function createModulesForTenants() {
  try {
    console.log('\n' + '='.repeat(60));
    log('Creating sub-modules for tenants...\n');

    // Get all tenants
    const { data: tenants } = await supabase
      .from('tenants')
      .select('*');

    // Get main modules
    const { data: mainModules } = await supabase
      .from('main_modules')
      .select('*');

    console.log(`Found ${tenants?.length || 0} tenants`);
    console.log(`Found ${mainModules?.length || 0} main modules\n`);

    // For each tenant, create sub-modules for each main module
    for (const tenant of tenants) {
      console.log(`\n📦 Processing tenant: ${tenant.name} (${tenant.id})`);

      for (const mainModule of mainModules) {
        // Check if sub-module already exists
        const { data: existing } = await supabase
          .from('sub_modules')
          .select('id')
          .eq('tenant_id', tenant.id)
          .eq('main_module_id', mainModule.id);

        if (existing && existing.length > 0) {
          console.log(`  ⏭️  Sub-module already exists: ${mainModule.code} (${tenant.code})`);
          continue;
        }

        // Create sub-module
        const { data, error: err } = await supabase
          .from('sub_modules')
          .insert({
            tenant_id: tenant.id,
            main_module_id: mainModule.id,
            name: mainModule.name,
            code: `${tenant.code.replace(/-/g, '_')}-${mainModule.code}`,
            description: `${mainModule.name} for ${tenant.name}`,
            is_active: true
          })
          .select();

        if (err) {
          error(`Failed to create sub-module for ${mainModule.code}`, err);
        } else {
          log(`Created sub-module: ${mainModule.code} for ${tenant.code}`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    log('Sub-modules created successfully!');
    console.log('\n');

  } catch (err) {
    error('FATAL ERROR', err);
  }
}

createModulesForTenants();
