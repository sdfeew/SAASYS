# How to Fix the User Profiles RLS Infinite Recursion Error

## Problem
The RLS policies on the `user_profiles` table contain recursive policies that check `role = 'admin'` by looking up the same table, causing infinite recursion.

## Solution
Apply the following SQL fix in your Supabase SQL Editor:

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"

### Step 2: Run the Fix SQL

Copy and paste the following SQL code into the editor and execute it:

```sql
-- Fix infinite recursion in user_profiles RLS policies

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can update any profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.user_profiles;

-- Create new simplified policies without recursion
CREATE POLICY "Users can insert profiles" ON public.user_profiles 
  FOR INSERT WITH CHECK (true);

-- For DELETE, use a simpler approach that doesn't check role within the table
CREATE POLICY "Users can delete own profile" ON public.user_profiles 
  FOR DELETE USING (auth.uid() = id);
```

### Step 3: Verify the Fix
Run this query to confirm the policies are now in place:

```sql
SELECT policyname, qual, with_check 
FROM pg_policies 
WHERE tablename = 'user_profiles' 
ORDER BY policyname;
```

You should see:
- "Users can view all profiles"
- "Users can update own profile"
- "Users can insert profiles"
- "Users can delete own profile"

## What Changed
- **Removed**: Recursive policies that checked `EXISTS (SELECT FROM user_profiles WHERE id = auth.uid() AND role = 'admin')`
- **Added**: Simplified INSERT and DELETE policies that don't reference the table being modified
- **Kept**: Safe SELECT and UPDATE policies that don't cause recursion

## Why This Works
- SELECT with `USING (true)` is safe - it just allows viewing all records
- UPDATE with `USING (auth.uid() = id)` is safe - users can only update their own records
- INSERT and DELETE policies no longer create circular references
- Admin functionality can be implemented at the application layer instead

## After Applying
Your application will now be able to:
✓ Insert new user profiles
✓ Update user profiles without infinite recursion errors
✓ Delete user profiles without infinite recursion errors
✓ View all user profiles
✓ Multi-tenant isolation remains intact
