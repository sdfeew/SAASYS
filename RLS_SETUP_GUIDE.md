# 🔐 RLS Migration Setup Guide

## Auto-Migration with Vercel

The RLS migration now runs automatically when deploying to Vercel. To enable this, follow these steps:

### Step 1: Get Your Supabase Service Key

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Scroll down to find **Service Role Key** under "Project API keys"
5. Copy the key (⚠️ Keep this secret!)

### Step 2: Add to Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name**: `SUPABASE_SERVICE_KEY`
   - **Value**: Paste the service key from Step 1
5. **Save**

### Step 3: Redeploy

1. Go to **Deployments**
2. Click the three dots on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger auto-deployment

The migration will run automatically during the build process.

---

## Manual Migration (If Auto-Migration Fails)

If the auto-migration doesn't work, you can run it manually:

1. Go to **Supabase Dashboard**
2. Select your project
3. Go to **SQL Editor**
4. Create a new query
5. Copy the contents of `supabase/migrations/20260210_enable_rls_basic.sql`
6. Paste it in the SQL editor
7. Click **Run**

---

## What Does This Migration Do?

✅ **Enables Row Level Security (RLS)** on:
- `tenants` table
- `user_profiles` table

✅ **Creates policies** that:
- Allow authenticated users to see all tenants (for login)
- Allow users to see their own profile
- Allow users to insert/update their own profile
- Allow admins to manage tenant members
- Prevent cross-tenant data access

---

## Verify Migration Success

After deployment, check the browser console. You should see:
```
✅ RLS migration executed successfully!
```

If you see errors about missing tables, that's fine - those tables might not exist yet and will be created later.

---

## Troubleshooting

### Migration Failed in Vercel
- Check that `SUPABASE_SERVICE_KEY` is set in Vercel environment variables
- Verify the key is correct (copy it again from Supabase)
- Check the deployment logs in Vercel for error details

### Still Getting 500 Errors in App
- Run the migration manually on Supabase Dashboard
- Verify the policies are created: Supabase → Authentication → Policies
- Check that `tenants` and `user_profiles` tables have RLS enabled

### Need to Re-run Migration
```bash
npm run migrate:rls
```

This will execute the migration script locally (requires `SUPABASE_SERVICE_KEY` to be set in `.env.local`).
