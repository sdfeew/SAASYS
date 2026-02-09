#!/usr/bin/env node
/**
 * Quick Data Setup
 * Populates sample records into existing modules
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function generateSampleRecords() {
  console.log('\n✨ Populating Sample Data...\n');

  try {
    // Get all existing sub_modules
    const { data: modules } = await supabase
      .from('sub_modules')
      .select('id, name, tenant_id')
      .eq('status', 'active');

    if (!modules || modules.length === 0) {
      console.log('⚠️  No modules found. Please create modules first.');
      return;
    }

    console.log(`Found ${modules.length} modules\n`);

    let totalRecords = 0;
    let moduleCount = 0;

    // For each module, add sample records
    for (const module of modules) {
      const moduleType = module.name || 'Unknown';
      const sampleData = [];

      // Generate 10 sample records per module
      for (let i = 1; i <= 10; i++) {
        sampleData.push({
          sub_module_id: module.id,
          tenant_id: module.tenant_id,
          data: JSON.stringify({
            id: `${moduleType}-${String(i).padStart(3, '0')}`,
            name: `${moduleType} Item ${i}`,
            description: `Sample ${moduleType} record ${i}`,
            created_at: new Date().toISOString(),
            status: 'active'
          })
        });
      }

      // Insert records
      const { data: inserted, error } = await supabase
        .from('sub_module_records')
        .insert(sampleData);

      if (!error && inserted) {
        totalRecords += inserted.length;
        moduleCount++;
        process.stdout.write(`✅ ${moduleType.padEnd(15)} | ${inserted.length} records\n`);
      } else if (error && error.message.includes('duplicate')) {
        process.stdout.write(`⏭️  ${moduleType.padEnd(15)} | (already populated)\n`)
      }
    }

    console.log(`\n✅ محتمل! (Data Setup Complete!)\n`);
    console.log(`📊 Summary:`);
    console.log(`   • Modules Updated: ${moduleCount}`);
    console.log(`   • Records Created: ${totalRecords}`);
    console.log(`\n🎉 System is Ready!\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateSampleRecords();
