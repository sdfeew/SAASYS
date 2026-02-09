#!/usr/bin/env node
/**
 * Complete Setup Script
 * Creates main modules, sub modules, and populates records for all tenants
 * Usage: npm run setup-complete
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Module definitions
const mainModuleDefinitions = {
  'HR': {
    en: 'Human Resources',
    ar: 'الموارد البشرية',
    color: '#3B82F6'
  },
  'CRM': {
    en: 'Customer Relationship Management',
    ar: 'إدارة علاقات العملاء',
    color: '#10B981'
  },
  'Inventory': {
    en: 'Inventory Management',
    ar: 'إدارة المخزون',
    color: '#F59E0B'
  },
  'Logistics': {
    en: 'Logistics & Shipping',
    ar: 'الخدمات اللوجستية',
    color: '#EF4444'
  },
  'Suppliers': {
    en: 'Supplier Management',
    ar: 'إدارة الموردين',
    color: '#8B5CF6'
  }
};

// Data generators
const generateEmployees = (count = 12) => {
  const firstNames = ['Ahmed', 'Fatima', 'Mohammed', 'Aisha', 'Ibrahim', 'Layla', 'Hassan', 'Noor', 'Youssef', 'Sara', 'Ali', 'Mona'];
  const lastNames = ['Al-Mansouri', 'Al-Dosari', 'Al-Otaibi', 'Al-Qahtani', 'Al-Shammari', 'Al-Rashid', 'Al-Nasser', 'Al-Khalifa'];
  const positions = ['Manager', 'Engineer', 'Analyst', 'Coordinator', 'Specialist', 'Officer', 'Executive', 'Consultant'];
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'];

  const employees = [];
  for (let i = 0; i < count; i++) {
    employees.push({
      employee_id: `EMP${String(i + 1).padStart(4, '0')}`,
      first_name: firstNames[i % firstNames.length],
      last_name: lastNames[i % lastNames.length],
      email: `${firstNames[i % firstNames.length].toLowerCase()}.${lastNames[i % lastNames.length].toLowerCase().replace(/\s+/g, '')}@company.com`,
      phone: `+966${Math.floor(Math.random() * 900000000 + 100000000)}`,
      position: positions[i % positions.length],
      department: departments[i % departments.length],
      hire_date: new Date(2020 + Math.floor(i / 6), (i % 12), (i % 28) + 1).toISOString().split('T')[0],
      salary: Math.floor(Math.random() * 100000 + 30000),
      is_active: true
    });
  }
  return employees;
};

const generateContacts = (count = 15) => {
  const firstNames = ['Sarah', 'John', 'Emma', 'Michael', 'Lisa', 'Robert', 'Mary', 'James', 'Patricia', 'David', 'Jennifer', 'Richard', 'Linda', 'Joseph', 'Barbara'];
  const companies = ['TechCorp', 'GlobalTrade', 'InnovateLabs', 'FutureVision', 'SmartSystems', 'CloudTech', 'DataFlow'];

  const contacts = [];
  for (let i = 0; i < count; i++) {
    contacts.push({
      contact_id: `CRM${String(i + 1).padStart(5, '0')}`,
      first_name: firstNames[i % firstNames.length],
      last_name: `Contact${i + 1}`,
      email: `contact${i + 1}@example.com`,
      phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      company: companies[i % companies.length],
      position: ['Manager', 'Director', 'CEO', 'VP', 'Coordinator'][i % 5],
      status: ['Active', 'Pending', 'Inactive'][i % 3],
      last_contact: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  }
  return contacts;
};

const generateProducts = (count = 15) => {
  const categories = ['Electronics', 'Clothing', 'Food', 'Books', 'Furniture'];
  const products = [];
  for (let i = 0; i < count; i++) {
    products.push({
      product_id: `PRD${String(i + 1).padStart(5, '0')}`,
      name: `Product ${i + 1}`,
      category: categories[i % categories.length],
      sku: `SKU-${Math.random().toString(36).substring(7).toUpperCase()}`,
      price: (Math.random() * 500 + 10).toFixed(2),
      quantity: Math.floor(Math.random() * 100 + 10),
      reorder_level: Math.floor(Math.random() * 20 + 5),
      supplier_id: `SUP${String((i % 5) + 1).padStart(3, '0')}`,
      is_active: true
    });
  }
  return products;
};

const generateShipments = (count = 12) => {
  const shipments = [];
  const statuses = ['Pending', 'Shipped', 'In Transit', 'Delivered', 'Cancelled'];
  for (let i = 0; i < count; i++) {
    shipments.push({
      shipment_id: `SHIP${String(i + 1).padStart(6, '0')}`,
      order_id: `ORD${String(i + 1).padStart(6, '0')}`,
      from_location: ['Warehouse A', 'Warehouse B', 'Hub 1', 'Hub 2'][i % 4],
      to_location: ['Customer', 'Retail Store', 'Distribution Center'][i % 3],
      status: statuses[i % statuses.length],
      ship_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimated_delivery: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      weight_kg: (Math.random() * 50 + 1).toFixed(2),
      carrier: ['DHL', 'FedEx', 'UPS', 'Local'][i % 4]
    });
  }
  return shipments;
};

const generateSuppliers = (count = 10) => {
  const suppliers = [];
  const countries = ['USA', 'UK', 'Germany', 'China', 'India', 'Japan', 'Mexico', 'Canada', 'Australia', 'Singapore'];
  for (let i = 0; i < count; i++) {
    suppliers.push({
      supplier_id: `SUP${String(i + 1).padStart(3, '0')}`,
      name: `Supplier ${i + 1}`,
      country: countries[i % countries.length],
      email: `supplier${i + 1}@company.com`,
      phone: `+${Math.floor(Math.random() * 900000000 + 100000000)}`,
      payment_terms: ['Net 30', 'Net 60', 'COD'][i % 3],
      is_active: true,
      rating: (Math.random() * 5).toFixed(1)
    });
  }
  return suppliers;
};

async function setupComplete() {
  console.log('🚀 Starting complete setup (Modules + Records)...\n');

  try {
    // Step 1: Create Main Modules
    console.log('📋 Step 1: Creating Main Modules (templates)...');
    const mainModules = {};

    for (const [moduleName, definition] of Object.entries(mainModuleDefinitions)) {
      const { data: existing } = await supabase
        .from('main_modules')
        .select('id')
        .eq('code', moduleName.toLowerCase().replace(/\s+/g, '-'))
        .single();

      if (existing) {
        console.log(`   ⏭️  ${moduleName} (already exists)`);
        mainModules[moduleName] = existing.id;
        continue;
      }

      const { data, error } = await supabase
        .from('main_modules')
        .insert({
          name: moduleName,
          code: moduleName.toLowerCase().replace(/\s+/g, '-'),
          description: definition.en,
          status: 'active'
        })
        .select();

      if (error) throw error;
      mainModules[moduleName] = data[0].id;
      console.log(`   ✅ ${moduleName}`);
    }

    // Step 2: Get all tenants
    console.log('\n📋 Step 2: Getting all tenants...');
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, name, code')
      .eq('status', 'active')
      .limit(100);

    if (tenantsError) throw tenantsError;
    console.log(`   ✅ Found ${tenants.length} tenants\n`);

    // Step 3: Create Sub Modules for each tenant
    console.log('📋 Step 3: Creating Sub Modules for each tenant...');
    let subModulesCreated = 0;

    for (const tenant of tenants) {
      for (const [moduleName, mainModuleId] of Object.entries(mainModules)) {
        const { data: existing } = await supabase
          .from('sub_modules')
          .select('id')
          .eq('tenant_id', tenant.id)
          .eq('main_module_id', mainModuleId)
          .single();

        if (existing) continue;

        const { data, error } = await supabase
          .from('sub_modules')
          .insert({
            tenant_id: tenant.id,
            main_module_id: mainModuleId,
            name: moduleName,
            code: `${tenant.code || tenant.id.slice(0, 8)}-${moduleName.toLowerCase().replace(/\s+/g, '-')}`,
            status: 'active'
          })
          .select();

        if (error) {
          console.warn(`   ⚠️  ${tenant.code} - ${moduleName}: ${error.message}`);
          continue;
        }
        subModulesCreated++;
      }
    }
    console.log(`   ✅ Created ${subModulesCreated} sub modules\n`);

    // Step 4: Populate records
    console.log('📋 Step 4: Populating records in modules...');
    let totalRecords = 0;

    const recordGenerators = {
      'HR': generateEmployees,
      'CRM': generateContacts,
      'Inventory': generateProducts,
      'Logistics': generateShipments,
      'Suppliers': generateSuppliers
    };

    for (const tenant of tenants) {
      const { data: modules } = await supabase
        .from('sub_modules')
        .select('id, name')
        .eq('tenant_id', tenant.id)
        .eq('status', 'active');

      if (!modules || modules.length === 0) continue;

      for (const module of modules) {
        const generator = recordGenerators[module.name];
        if (!generator) continue;

        try {
          const records = generator();
          const recordsWithModuleId = records.map(r => ({
            ...r,
            tenant_id: tenant.id,
            sub_module_id: module.id
          }));

          const { data: inserted, error } = await supabase
            .from('sub_module_records')
            .insert(recordsWithModuleId)
            .select();

          if (error && !error.message.includes('duplicate')) {
            throw error;
          }

          const count = inserted ? inserted.length : records.length;
          totalRecords += count;
        } catch (err) {
          console.warn(`   ⚠️  ${tenant.code} - ${module.name}: ${err.message}`);
        }
      }
    }

    console.log(`\n✅ Complete setup finished!\n`);
    console.log('📊 Summary:');
    console.log(`   • Main Modules: ${Object.keys(mainModules).length}`);
    console.log(`   • Sub Modules: ${subModulesCreated}`);
    console.log(`   • Records: ${totalRecords}`);
    console.log(`   • Tenants: ${tenants.length}\n`);

    console.log('🎉 Sistema جاهز! جميع الموديولز والبيانات تم إنشاؤها بنجاح!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

// Run the setup
setupComplete();
