#!/usr/bin/env node
/**
 * Create Default Modules Migration
 * Creates standard modules (HR, CRM, Inventory, Logistics, Suppliers) for all tenants
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const moduleDefinitions = {
  'HR': {
    en: 'Human Resources Management',
    ar: 'إدارة الموارد البشرية',
    color: '#3B82F6',
    tables: ['employees', 'departments', 'positions'],
    features: ['performance', 'attendance', 'payroll']
  },
  'CRM': {
    en: 'Customer Relationship Management',
    ar: 'إدارة علاقات العملاء',
    color: '#10B981',
    tables: ['contacts', 'companies', 'deals'],
    features: ['leads', 'pipeline', 'reporting']
  },
  'Inventory': {
    en: 'Inventory and Stock Management',
    ar: 'إدارة الجرد والمخزون',
    color: '#F59E0B',
    tables: ['products', 'warehouses', 'stock_levels'],
    features: ['tracking', 'reorder', 'valuation']
  },
  'Logistics': {
    en: 'Logistics and Shipping',
    ar: 'الخدمات اللوجستية والشحن',
    color: '#EF4444',
    tables: ['shipments', 'vehicles', 'routes'],
    features: ['tracking', 'optimization', 'reporting']
  },
  'Suppliers': {
    en: 'Supplier Management',
    ar: 'إدارة الموردين',
    color: '#8B5CF6',
    tables: ['suppliers', 'contacts', 'agreements'],
    features: ['sourcing', 'contracts', 'performance']
  }
};

async function createDefaultModules() {
  console.log('🏗️  Creating default modules for all tenants...\n');

  try {
    // Clear Supabase schema cache
    supabase.removeAllChannels();

    // Get all active tenants
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, name, code')
      .eq('status', 'active')
      .limit(100);

    if (tenantsError) throw tenantsError;

    if (!tenants || tenants.length === 0) {
      console.log('⚠️  No active tenants found. Create tenants first: npm run seed');
      process.exit(0);
    }

    console.log(`📋 Found ${tenants.length} active tenants\n`);

    let modulesCreated = 0;
    let modulesSkipped = 0;

    // Create modules for each tenant
    for (const tenant of tenants) {
      // Only show first 5 tenants to avoid spam
      if (modulesCreated + modulesSkipped < 10) {
        console.log(`\n📌 ${tenant.name} (${tenant.code}):`);
      } else if (modulesCreated + modulesSkipped === 10) {
        console.log(`\n📌 ... processing ${tenants.length - 10} more tenants ...`);
      }

      for (const [moduleName, definition] of Object.entries(moduleDefinitions)) {
        try {
          // Use rpc to set modules or raw insert without checking schema
          const { data, error } = await supabase
            .from('sub_modules')
            .insert({
              tenant_id: tenant.id,
              name: moduleName,
              status: 'active'
            }, { count: 'exact' })
            .select('id', { count: 'exact' });

          if (error) {
            if (error.message.includes('duplicate') || error.message.includes('Uniqueness violation')) {
              modulesSkipped++;
              if (modulesCreated + modulesSkipped < 10) {
                console.log(`   ⏭️  ${moduleName} (already exists)`);
              }
            } else {
              throw error;
            }
          } else if (data) {
            modulesCreated++;
            if (modulesCreated + modulesSkipped < 10) {
              console.log(`   ✅ ${moduleName}`);
            }
          }
        } catch (err) {
          if (modulesCreated + modulesSkipped < 10) {
            console.warn(`   ⚠️  ${moduleName}: ${err.message}`);
          }
        }
      }
    }

    console.log('\n✅ Module creation completed!\n');
    console.log('📊 Summary:');
    console.log(`   • Created: ${modulesCreated}`);
    console.log(`   • Skipped: ${modulesSkipped}\n`);
    console.log('💡 Next: Run "npm run seed" to populate records in these modules');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration
createDefaultModules();
