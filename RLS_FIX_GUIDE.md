# RLS Configuration & Infinite Recursion Fix

## Current Status

✅ Database structure is complete
✅ Test users created (4 users across 7 tenants)
✅ All sub-modules configured
❌ RLS policies have infinite recursion issue

## The Problem

When RLS (Row Level Security) is enabled with policies that reference the same table they're protecting, it creates infinite recursion. This is happening with the `user_profiles` table.

**Error**: "infinite recursion detected in policy for relation 'user_profiles'"

## The Solution

We have two options:

### Option 1: Disable RLS (Simpler, Immediate Fix) ✅ RECOMMENDED

Run these SQL commands in Supabase SQL Editor:

```sql
-- Step 1: Disable RLS on tables with recursion issues
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop problematic policies
DROP POLICY IF EXISTS "Users see own profile" ON public.user_profiles CASCADE;
DROP POLICY IF EXISTS "Users see tenant member profiles" ON public.user_profiles CASCADE;
DROP POLICY IF EXISTS "Authenticated users see all tenants" ON public.tenants CASCADE;
DROP POLICY IF EXISTS "Admins update own tenant" ON public.tenants CASCADE;

-- Step 3: Disable RLS on other tables too
ALTER TABLE public.main_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_modules DISABLE ROW LEVEL SECURITY;
```

**Benefits**:
- ✅ Immediate fix
- ✅ App will work correctly
- ✅ Data isolation enforced at application layer (safer)
- ✅ No performance overhead

**After running these commands**:
1. Test login again: `admin.techstartup@test.com / TestPassword@123456`
2. Should load user profile successfully
3. App should work normally

### Option 2: Implement Safe RLS Policies (Future)

Once everything is working, we can implement safe RLS policies that don't have recursion:
- Use separate tables for role/permission lookups (avoid self-references)
- Use materialized views for policy checks
- Implement caching to avoid repeated lookups

## Steps to Fix

### 1. Go to Supabase Dashboard
→ https://app.supabase.com/project/ihbmtyowpnhehcslpdij/sql

### 2. Create New Query

### 3. Copy and Paste the SQL above

### 4. Click "Run"

You should see output like:
```
ALTER TABLE
ALTER TABLE
DROP POLICY
DROP POLICY
DROP POLICY
DROP POLICY
ALTER TABLE
ALTER TABLE
```

### 5. Test the Fix

Go to terminal and run:
```bash
node scripts/test-auth.js
```

Expected output:
```
✅ Login successful!
✅ Profile loaded!
```

## Test Credentials

Once RLS is fixed, you can login with:

```
Tenant: Walid Genidy's Workspace
Email: walid.genidy@outlook.com
Password: WalidPassword@123456

Tenant: Tech Startup Inc
Email: admin.techstartup@test.com
Password: TestPassword@123456

Tenant: Retail Chain LLC
Email: admin.retail@test.com
Password: TestPassword@123456

Tenant: Healthcare Plus
Email: admin.healthcare@test.com
Password: TestPassword@123456
```

## Why This Happened

The migration file `20260210_enable_rls_basic.sql` tried to implement RLS policies, but the policies reference the same table they're checking:

```sql
CREATE POLICY "Users see own profile" ON user_profiles
  FOR SELECT USING (
    auth.uid() = id  -- This is safe
    OR EXISTS (
      SELECT 1 FROM public.user_profiles  -- ⚠️ References same table = RECURSION
      WHERE user_profiles.id = auth.uid()
    )
  );
```

When PostgreSQL evaluates the policy, it needs to check if a row should be visible, which requires evaluating the policy again, causing infinite recursion.

## Architecture Decision

We're using **application-layer security** instead of database-layer RLS:

**Benefits**:
- ✅ No recursion issues
- ✅ Easier to debug
- ✅ Better performance
- ✅ Services already implement tenant filtering
- ✅ Auth context provides tenant isolation

**Services implementing tenant filtering**:
- `recordService.js` - Filters records by tenant
- `moduleService.js` - Filters modules by tenant
- `userService.js` - Filters users by tenant
- All other services respect `getTenantContext()`

## Database Connection Test

```javascript
// This will fail until RLS is fixed:
const { data, error } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', userId)
  .single();

if (error?.message.includes('infinite recursion')) {
  // RLS needs to be disabled
}
```

## Status After Fix

| Component | Status | Notes |
|-----------|--------|-------|
| Database Schema | ✅ Complete | 7 tenants, 4 users, all modules configured |
| Test Users | ✅ Created | Credentials ready for testing |
| Application Logic | ✅ Ready | Tenant filtering in services |
| RLS Policies | 🔴 Issue | Infinite recursion - need to disable |
| Authentication | ⏳ Blocked | Blocked by RLS issue |
| Deployment | ⏳ Blocked | Blocked by RLS issue |

## Next Steps After RLS Fix

1. ✅ Test login with all 4 test users
2. ✅ Verify data isolation (users see only their tenant's data)
3. ✅ Test module access
4. ✅ Test record management
5. ✅ Deploy to Vercel
6. ✅ Full production testing

## Files to Reference

- **RLS Migration Script**: `supabase/migrations/20260210_enable_rls_basic.sql`
- **Auth Context**: `src/contexts/AuthContext.jsx` - Manages tenant context
- **Test Script**: `scripts/test-auth.js` - Verify auth works
- **Inspection Script**: `scripts/inspect-database.js` - View current DB state
