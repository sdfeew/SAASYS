# Test Users Guide

## Available Test Users

| Email | Password | Role | Permissions |
|-------|----------|------|-------------|
| `admin@test.com` | `Admin@123456` | Admin | Full access to all features and settings |
| `manager@test.com` | `Manager@123456` | Manager | Can manage users and modules, view reports |
| `user1@test.com` | `User@123456` | User | Can create/edit records, view modules |
| `user2@test.com` | `User@123456` | User | Can create/edit records, view modules |
| `viewer@test.com` | `Viewer@123456` | Viewer | Read-only access to all modules |

## How to Create Test Users

### Option 1: Using the Script (Recommended)

1. Ensure your `.env` file contains:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_service_role_key
   ```

2. Run the script:
   ```bash
   node scripts/create-test-users.js
   ```

3. The script will create all test users and assign them to the first tenant.

### Option 2: Manual Creation in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add User**
4. Create each user with the credentials from the table above
5. Confirm the email after creation

### Option 3: Using Supabase SQL

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the migration file: `supabase/migrations/20260126_add_test_users.sql`
4. Note: You must replace the UUID placeholders with actual user IDs from auth

## Testing Different Roles

### Admin User
- Access all administrative features
- Manage tenants and users
- Configure modules and fields
- View all reports and analytics

### Manager User
- Manage team members
- Create and assign tasks
- View all records in assigned modules
- Generate basic reports

### Regular User
- Create and edit their own records
- View assigned modules
- Comment and collaborate on records
- Submit work for approval

### Viewer User
- View-only access to all modules
- Cannot create or edit records
- Can view reports and analytics
- Useful for stakeholders

## Security Notes

⚠️ **These are TEST USERS ONLY** - Do not use in production!

- Change passwords before deploying to production
- Use Supabase authentication best practices
- Enable 2FA for admin accounts in production
- Regularly rotate test credentials
- Never commit real user credentials to version control

## Resetting Test Users

To remove all test users and start fresh:

```sql
-- Delete from Supabase Auth UI or using admin API
DELETE FROM public.user_profiles WHERE email IN (
  'admin@test.com',
  'manager@test.com',
  'user1@test.com',
  'user2@test.com',
  'viewer@test.com'
);
```

## Troubleshooting

### Users not appearing after script runs
- Check that `SUPABASE_SERVICE_KEY` is correctly set
- Ensure the tenants table has at least one entry
- Check Supabase dashboard for any auth errors

### Can't login with test users
- Verify email is confirmed in Supabase Auth
- Check user status in `user_profiles` table (should be 'active')
- Ensure tenant assignment exists in `tenant_users` table

### Script fails silently
- Run with debug: `DEBUG=* node scripts/create-test-users.js`
- Check `.env` file syntax
- Verify Supabase credentials have admin permissions
