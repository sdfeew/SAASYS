#!/usr/bin/env node

/**
 * Run RLS migration on Supabase
 * This script executes the RLS migration SQL directly on Supabase using service role
 * Silently skips if service key is not available (normal in dev)
 */

const fs = require('fs');
const path = require('path');

// Get environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// If no service key, skip silently (This is normal in development)
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  // Silently skip - this is expected behavior in development
  process.exit(0);
}

// Run migration
console.log('═'.repeat(60));
console.log('🚀 RLS Migration Runner');
console.log('═'.repeat(60));

if (SUPABASE_SERVICE_KEY) {
  (async () => {
    try {
      console.log('\n🔐 Attempting to run RLS migration on Supabase...\n');
      
      // Read the migration file
      const migrationPath = path.join(__dirname, '../supabase/migrations/20260210_enable_rls_basic.sql');
      
      if (!fs.existsSync(migrationPath)) {
        console.log('⚠️  Migration file not found:', migrationPath);
        process.exit(0);
      }

      const migrationSQL = fs.readFileSync(migrationPath, 'utf-8').trim();
      
      if (!migrationSQL) {
        console.log('⚠️  Migration file is empty');
        process.exit(0);
      }

      console.log('📝 Migration SQL loaded, executing...\n');

      // Try to execute the migration
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          sql: migrationSQL,
        }),
      });

      if (response.ok) {
        console.log('✅ RLS migration executed successfully!\n');
      } else {
        console.log('⚠️  Migration response:', response.status);
        console.log('   Note: Some errors are expected (like policies already existing)\n');
      }
    } catch (error) {
      console.log('⚠️  Migration note:', error.message);
      console.log('   If migration failed, run it manually on Supabase Dashboard\n');
    }
  })();
}
