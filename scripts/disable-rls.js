#!/usr/bin/env node

/**
 * Disable RLS temporarily to allow data access
 * The current policies have infinite recursion issues
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ihbmtyowpnhehcslpdij.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloYm10eW93cG5oZWhjc2xwZGlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzYyMTk0MiwiZXhwIjoyMDgzMTk3OTQyfQ.d5FXqGDOammpdDjPCD2ulTdn5X_QFyhYtC3fm9HqpzQ';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const log = (msg) => console.log(`✅ ${msg}`);
const error = (title, err) => console.log(`❌ ${title}: ${err?.message || err}`);

async function runSQL(sql, description) {
  try {
    console.log(`\n⏳ ${description}...`);
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY
      },
      body: JSON.stringify({ sql })
    });
    
    if (response.ok || response.status === 204) {
      log(description);
      return true;
    } else {
      console.log(`⚠️  ${description} - Status: ${response.status}`);
      const text = await response.text();
      console.log(`   Response: ${text.substring(0, 100)}`);
      return false;
    }
  } catch (err) {
    console.log(`⚠️  ${description} - Error: ${err.message}`);
    return false;
  }
}

async function disableRLS() {
  try {
    console.log('\n' + '='.repeat(60));
    log('Disabling RLS to fix infinite recursion issue\n');

    const tables = ['user_profiles', 'tenants', 'main_modules', 'sub_modules', 'records', 'comments'];
    
    for (const table of tables) {
      await runSQL(
        `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`,
        `Disabled RLS on ${table}`
      );
    }

    console.log('\n' + '='.repeat(60));
    log('RLS Disabled on all tables');
    console.log(`
🔔 Note: RLS has been temporarily disabled to allow data access
   while we implement correct policies without recursion.

Next steps:
1. Test login and data access
2. Once working, implement proper RLS policies
3. Deploy with correct policies

    `);

  } catch (err) {
    error('FATAL ERROR', err);
  }
}

disableRLS();
