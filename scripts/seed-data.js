#!/usr/bin/env node
/**
 * Seed Data Script
 * Creates tenants, users, and sample records for testing
 * Usage: node scripts/seed-data.js
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

// Sample data generators
const generateTenants = () => {
  const timestamp = Date.now().toString().slice(-6);
  return [
    {
      name: `Acme Corporation ${timestamp}`,
      code: `acme-corp-${timestamp}`,
      subscription_plan: 'enterprise',
      status: 'active'
    },
    {
      name: `Tech Startup Inc ${timestamp}`,
      code: `tech-startup-${timestamp}`,
      subscription_plan: 'professional',
      status: 'active'
    },
    {
      name: `Retail Chain LLC ${timestamp}`,
      code: `retail-chain-${timestamp}`,
      subscription_plan: 'professional',
      status: 'active'
    },
    {
      name: `Healthcare Plus ${timestamp}`,
      code: `healthcare-plus-${timestamp}`,
      subscription_plan: 'enterprise',
      status: 'active'
    }
  ];
};

const generateUsers = (tenantId, tenantName) => {
  // Clean tenant name for email: remove apostrophes, hyphens, and special chars
  const emailDomain = tenantName
    .toLowerCase()
    .replace(/['\"]/g, '') // Remove apostrophes and quotes
    .replace(/[\s\-]+/g, '') // Remove spaces and hyphens
    .replace(/[^a-z0-9]/g, '') // Remove all other special chars
    .substring(0, 25); // Limit to 25 chars for email length

  return [
    {
      email: `admin.${tenantId.slice(0, 8)}@${emailDomain}.test`,
      password: 'TestPassword@123456',
      user_metadata: {
        full_name: `Admin ${tenantName}`,
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
      },
      profile: {
        full_name: `Admin ${tenantName}`,
        email: `admin.${tenantId.slice(0, 8)}@${emailDomain}.test`,
        role_code: 'admin',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
      }
    },
    {
      email: `manager.${tenantId.slice(0, 8)}@${emailDomain}.test`,
      password: 'TestPassword@123456',
      user_metadata: {
        full_name: `Manager ${tenantName}`,
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager'
      },
      profile: {
        full_name: `Manager ${tenantName}`,
        email: `manager.${tenantId.slice(0, 8)}@${emailDomain}.test`,
        role_code: 'manager',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager'
      }
    },
    {
      email: `user.${tenantId.slice(0, 8)}@${emailDomain}.test`,
      password: 'TestPassword@123456',
      user_metadata: {
        full_name: `User ${tenantName}`,
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
      },
      profile: {
        full_name: `User ${tenantName}`,
        email: `user.${tenantId.slice(0, 8)}@${emailDomain}.test`,
        role_code: 'user',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
      }
    }
  ];
};

// HR Module Data
const generateEmployees = (count = 12) => {
  const firstNames = ['Ahmed', 'Fatima', 'Mohammed', 'Aisha', 'Ibrahim', 'Layla', 'Hassan', 'Noor', 'Youssef', 'Sara', 'Ali', 'Mona'];
  const lastNames = ['Al-Mansouri', 'Al-Dosari', 'Al-Otaibi', 'Al-Qahtani', 'Al-Shammari', 'Al-Rashid', 'Al-Nasser', 'Al-Khalifa'];
  const positions = ['Manager', 'Engineer', 'Analyst', 'Coordinator', 'Specialist', 'Officer', 'Executive', 'Consultant'];
  const departments = ['Engineering', 'Sales', 'HR', 'Operations', 'Finance', 'IT', 'Marketing', 'Support'];

  const employees = [];
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    employees.push({
      data: {
        employee_id: `EMP${String(i + 1).padStart(4, '0')}`,
        first_name: firstName,
        last_name: lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
        phone: `+966${String(Math.floor(Math.random() * 900000000) + 100000000).slice(-9)}`,
        position: positions[i % positions.length],
        department: departments[i % departments.length],
        hire_date: new Date(2020 + Math.floor(i / 3), Math.floor(Math.random() * 12), 1).toISOString().split('T')[0],
        salary: 50000 + Math.floor(Math.random() * 100000),
        is_active: true,
        manager_id: i > 0 ? `EMP${String(Math.floor(i / 3)).padStart(4, '0')}` : null
      },
      status: 'active'
    });
  }
  return employees;
};

// CRM Module Data
const generateContacts = (count = 15) => {
  const firstNames = ['محمد', 'فاطمة', 'علي', 'عائشة', 'سارة', 'حسن', 'ليلى', 'يوسف', 'نور', 'أحمد', 'مريم', 'إبراهيم', 'نادية', 'خالد', 'جميلة'];
  const companies = ['Acme Inc', 'Global Corp', 'Tech Solutions', 'Innovation Labs', 'Future Systems', 'Smart Business'];
  const industries = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Services'];

  const contacts = [];
  for (let i = 0; i < count; i++) {
    const name = firstNames[i % firstNames.length];
    contacts.push({
      data: {
        contact_id: `C${String(i + 1).padStart(5, '0')}`,
        name: name,
        email: `${name.toLowerCase()}${i}@email.com`,
        phone: `+966${String(Math.floor(Math.random() * 900000000) + 100000000).slice(-9)}`,
        company: companies[i % companies.length],
        industry: industries[i % industries.length],
        position: ['CEO', 'Manager', 'Director', 'Coordinator', 'Specialist'][i % 5],
        status: ['active', 'inactive', 'prospect'][i % 3],
        last_contacted: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        revenue_potential: Math.floor(Math.random() * 500000) + 10000
      },
      status: 'active'
    });
  }
  return contacts;
};

// Inventory Module Data
const generateInventoryItems = (count = 15) => {
  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Food', 'Toys', 'Office Supplies'];
  const items = ['Pro Laptop', 'Smart Watch', 'Wireless Earbuds', 'USB-C Hub', 'Monitor Stand', 'Keyboard', 'Mouse', 'Webcam', 'Desk Lamp', 'Cable Set', 'Power Bank', 'Screen Protector', 'Phone Case', 'Memory Card', 'Charger'];

  const inventory = [];
  for (let i = 0; i < count; i++) {
    const itemName = items[i % items.length];
    inventory.push({
      data: {
        sku: `SKU${String(i + 1).padStart(6, '0')}`,
        product_name: `${itemName} v${Math.floor(i / 3) + 1}`,
        category: categories[i % categories.length],
        description: `High-quality ${itemName} with premium features`,
        price: Math.floor(Math.random() * 5000) + 100,
        cost: Math.floor(Math.random() * 2000) + 50,
        quantity_in_stock: Math.floor(Math.random() * 500) + 10,
        reorder_level: 20,
        supplier: `Supplier ${(i % 5) + 1}`,
        status: Math.random() > 0.2 ? 'active' : 'discontinued',
        last_restocked: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      status: 'active'
    });
  }
  return inventory;
};

// Logistics Module Data
const generateShipments = (count = 12) => {
  const statuses = ['pending', 'in_transit', 'delivered', 'failed'];
  const carriers = ['FedEx', 'UPS', 'DHL', 'Local', 'Express'];

  const shipments = [];
  for (let i = 0; i < count; i++) {
    shipments.push({
      data: {
        shipment_id: `SHIP${String(i + 1).padStart(6, '0')}`,
        tracking_number: `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        origin: ['Riyadh', 'Jeddah', 'Dammam', 'Khobar', 'Abha'][i % 5],
        destination: ['Dubai', 'Kuwait', 'Bahrain', 'Qatar', 'Oman'][i % 5],
        carrier: carriers[i % carriers.length],
        weight_kg: Math.floor(Math.random() * 1000) + 1,
        status: statuses[i % statuses.length],
        shipment_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        estimated_delivery: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        cost: Math.floor(Math.random() * 10000) + 500
      },
      status: 'active'
    });
  }
  return shipments;
};

// Suppliers Module Data
const generateSuppliers = (count = 10) => {
  const suppliers = [];
  for (let i = 0; i < count; i++) {
    suppliers.push({
      data: {
        supplier_id: `SUP${String(i + 1).padStart(5, '0')}`,
        supplier_name: `Supplier Company ${i + 1}`,
        contact_person: `Contact Person ${i + 1}`,
        email: `contact${i}@supplier.com`,
        phone: `+966${String(Math.floor(Math.random() * 900000000) + 100000000).slice(-9)}`,
        country: ['Saudi Arabia', 'UAE', 'Kuwait', 'Qatar', 'Oman'][i % 5],
        city: ['Riyadh', 'Dubai', 'Kuwait City', 'Doha', 'Muscat'][i % 5],
        payment_terms: `${15 + (i % 3) * 15} days`,
        rating: (Math.floor(Math.random() * 40) + 60) / 10,
        status: 'active',
        supplier_type: ['Manufacturer', 'Distributor', 'Wholesaler', 'Retailer'][i % 4]
      },
      status: 'active'
    });
  }
  return suppliers;
};

// Main function
async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // 1. Check for existing tenants first
    console.log('📋 Checking existing tenants...');
    const { data: existingTenants, error: checkError } = await supabase
      .from('tenants')
      .select('id, name, code')
      .limit(10);

    if (checkError) {
      console.error('❌ Error checking tenants:', checkError);
      throw checkError;
    }

    let tenantsToUse = existingTenants || [];

    // If no tenants, try to create new ones
    if (!tenantsToUse || tenantsToUse.length === 0) {
      console.log('No existing tenants found, creating new ones...');
      const tenants = generateTenants();
      const { data: createdTenants, error: tenantError } = await supabase
        .from('tenants')
        .insert(tenants)
        .select();

      if (tenantError) throw tenantError;
      tenantsToUse = createdTenants || [];
      console.log(`✅ Created ${tenantsToUse.length} new tenants\n`);
    } else {
      console.log(`✅ Found ${existingTenants.length} existing tenants\n`);
    }

    // 2. Create Users for each tenant (skip if already exists)
    console.log('👥 Creating users...');
    let totalUsersCreated = 0;
    let totalProfilesCreated = 0;

    for (const tenant of tenantsToUse) {
      const users = generateUsers(tenant.id, tenant.name);

      for (const user of users) {
        try {
          // Create auth user
          const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true,
            user_metadata: user.user_metadata
          });

          if (authError) {
            if (authError.message.includes('already exists')) {
              console.log(`⏭️  User ${user.email} already exists`);
              continue;
            }
            throw authError;
          }

          // Create user profile
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: authUser.user.id,
              tenant_id: tenant.id,
              email: user.email,
              full_name: user.profile.full_name,
              role_code: user.profile.role_code,
              avatar_url: user.profile.avatar_url
            });

          if (profileError && !profileError.message.includes('duplicate')) {
            throw profileError;
          }

          totalUsersCreated++;
          totalProfilesCreated++;
        } catch (err) {
          console.warn(`⚠️  Failed to create user ${user.email}: ${err.message}`);
        }
      }
    }
    console.log(`✅ Created/Found ${totalUsersCreated} users\n`);

    // 3. Create records for each tenant and module
    console.log('📊 Creating sample records...');
    let totalRecordsCreated = 0;

    for (const tenant of tenantsToUse) {
      console.log(`\n  📌 ${tenant.name}:`);

      // Get all modules for this tenant
      const { data: modules, error: modulesError } = await supabase
        .from('sub_modules')
        .select('id, name')
        .eq('tenant_id', tenant.id)
        .eq('status', 'active');

      if (!modules || modules.length === 0) {
        console.log(`    ⏭️  No modules found - skipping records`);
        continue;
      }

      // Map module names to data generators
      const dataGenerators = {
        'Employees': generateEmployees,
        'HR': generateEmployees,
        'Contacts': generateContacts,
        'CRM': generateContacts,
        'Inventory': generateInventoryItems,
        'Products': generateInventoryItems,
        'Shipments': generateShipments,
        'Logistics': generateShipments,
        'Suppliers': generateSuppliers
      };

      for (const module of modules) {
        const moduleName = typeof module.name === 'string' ? module.name : module.name?.en || 'Unknown';
        const generator = dataGenerators[moduleName];

        if (!generator) {
          console.log(`    ⏭️  No data generator for "${moduleName}"`);
          continue;
        }

        try {
          const records = generator();
          const recordsWithTenantAndModule = records.map(r => ({
            ...r,
            tenant_id: tenant.id,
            sub_module_id: module.id
          }));

          const { data: insertedRecords, error: insertError } = await supabase
            .from('sub_module_records')
            .insert(recordsWithTenantAndModule)
            .select();

          if (insertError && !insertError.message.includes('duplicate')) {
            throw insertError;
          }

          const actualCount = insertedRecords ? insertedRecords.length : records.length;
          console.log(`    ✅ ${moduleName}: ${actualCount} records`);
          totalRecordsCreated += actualCount;
        } catch (err) {
          console.warn(`    ⚠️  ${moduleName}: ${err.message}`);
        }
      }
    }

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   • Tenants: ${tenantsToUse.length}`);
    console.log(`   • Users: ${totalUsersCreated}`);
    console.log(`   • Records: ${totalRecordsCreated}\n`);

    console.log('🔑 Test Credentials:');
    tenantsToUse.slice(0, 2).forEach(tenant => {
      const firstUser = generateUsers(tenant.id, tenant.name)[0];
      console.log(`   ${tenant.name}:`);
      console.log(`   📧 ${firstUser.email}`);
      console.log(`   🔐 ${firstUser.password}\n`);
    });

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
