# Tenant Setup Guide - Complete Walkthrough

## Step 1: Create Test Users (If Not Done Yet)

First, create test users in Supabase Auth:

```bash
npm run create-test-users
```

This creates:
- **admin@test.com** / `Admin@123456` (Admin)
- **manager@test.com** / `Manager@123456` (Manager)
- **user1@test.com** / `User@123456` (Regular User)
- **user2@test.com** / `User@123456` (Regular User)
- **viewer@test.com** / `Viewer@123456` (Viewer - Read Only)

## Step 2: Login to the Application

1. Go to **https://tenantflow-saas.vercel.app/auth/login**
2. Login with: `admin@test.com` / `Admin@123456`
3. You'll be redirected to the **Tenant Admin Dashboard**

## Step 3: Create Your First Tenant

On the Tenant Admin Dashboard:

1. Click the blue **"New Tenant"** button (top right)
2. Fill in the form:
   - **Tenant Name**: e.g., "My Company"
   - **Tenant Code**: Auto-generates from name (e.g., "my-company") - you can edit it
   - **Description**: (Optional) e.g., "My Business"
   - **Phone**: (Optional) e.g., "+1-555-0123"
   - **Website**: (Optional) e.g., "https://mycompany.com"
   - **Status**: Select "active"

3. Click **"Create Tenant"** button
4. Your tenant appears in the list below

## Step 4: Enter the Tenant & Access Modules

Once the tenant is created:

1. **Click on the tenant name** in the list to view details
2. You'll see the tenant details and can now access:
   - **Modules** (HR, CRM, INVENTORY, LOGISTICS, SUPPLIERS)
   - **Sub-modules** (Employee, Department, Payroll, etc.)
   - **User Management**
   - **Dashboard Builder**

## Step 5: Set Up Modules & Fields

### Navigate to Schema Builder

1. Go to **Schema Builder Interface** (left sidebar or main menu)
2. You'll see all available main modules:
   - HR
   - CRM
   - INVENTORY
   - LOGISTICS
   - SUPPLIERS

### Create Sub-Modules

For each module you want to use:

1. **Select a Main Module** (e.g., HR)
2. Click **"Add Sub-Module"**
3. Fill in:
   - **Name**: e.g., "Employees"
   - **Description**: e.g., "Employee database"
   - **Color**: Choose a color for the UI
4. Click **"Create"**

### Add Fields to Sub-Modules

1. **Click on a Sub-Module** (e.g., "Employees")
2. Click **"Add Field"**
3. Configure the field:
   - **Field Name**: e.g., "email"
   - **Data Type**: Select from dropdown (TEXT, EMAIL, PHONE, DATE, CURRENCY, etc.)
   - **Required**: Check if this field must be filled
   - **Unique**: Check if value must be unique
4. Click **"Add Field"**
5. Repeat for all fields needed

**Example for Employees Sub-Module:**
```
- employee_id (TEXT, Required, Unique)
- first_name (TEXT, Required)
- last_name (TEXT, Required)
- email (EMAIL, Required, Unique)
- phone (PHONE)
- position (TEXT, Required)
- department (TEXT, Required)
- hire_date (DATE, Required)
- salary (CURRENCY)
```

## Step 6: Add Records / Data

### Navigate to Dynamic Module List View

1. Go to **Dynamic Module List View** (left sidebar)
2. **Select your Tenant** (dropdown at top)
3. **Select a Module** (e.g., HR)
4. **Select a Sub-Module** (e.g., Employees)
5. Click **"Add New Record"** button
6. Fill in the form with employee data
7. Click **"Save"**

## Step 7: Create Dashboards

### Dashboard Builder Studio

1. Go to **Dashboard Builder Studio**
2. Click **"Create New Dashboard"**
3. Configure:
   - **Dashboard Name**: e.g., "HR Analytics"
   - **Description**: What this dashboard shows
4. **Drag and Drop Widgets**:
   - Add charts, tables, KPI cards
   - Connect to your data sources
   - Configure filters
5. **Publish** when ready

## Step 8: Manage Users & Permissions

### User Management Console

1. Go to **User Management Console**
2. You can:
   - **Add Users**: Invite team members
   - **Assign Roles**: Admin, Manager, User, Viewer
   - **Set Permissions**: Control what users can access
   - **Manage Departments**: Organize team structure

### User Roles Explained:

- **Admin**: Full access to all features, can create tenants and manage users
- **Manager**: Can manage team, create records, view reports
- **User**: Can create/edit their own records, view assigned modules
- **Viewer**: Read-only access to all modules, cannot create/edit

## Step 9: Configure Tenant Settings

### Tenant Admin Dashboard

Go back to **Tenant Admin Dashboard**:

1. **Click on your tenant** in the list
2. Edit tenant details:
   - Change name, description, phone, website
   - Update status (active/inactive)
   - Set branding options
3. Click **"Save"** to update

## Quick Navigation Map

```
Login (admin@test.com)
    ↓
Tenant Admin Dashboard (Create/Manage Tenants)
    ↓
Choose Actions:
    ├─ Schema Builder → Design modules & fields
    ├─ Dynamic Module List View → Add records/data
    ├─ Dashboard Builder → Create visualizations
    ├─ User Management → Add team members
    └─ Record Detail Management → Edit individual records
```

## Common Workflows

### Workflow 1: Setup HR Module
```
1. Create Tenant "HR Department"
2. Schema Builder:
   - Sub-Module: Employees
   - Fields: employee_id, first_name, last_name, email, phone, position, department, hire_date, salary
3. Add Records:
   - Go to Dynamic Module List View
   - Add 5-10 employee records
4. Create Dashboard:
   - Dashboard Builder Studio
   - Show employee count, salary expenses, department distribution
5. Add Users:
   - User Management Console
   - Add HR manager with manager role
```

### Workflow 2: Setup CRM Module
```
1. Create Tenant "CRM Sales"
2. Schema Builder:
   - Sub-Module: Contacts
   - Fields: company_name, contact_name, email, phone, position, industry, website, revenue
   - Sub-Module: Deals
   - Fields: deal_name, customer, value, stage, close_date
3. Add Records:
   - Add 10+ contacts
   - Add 5+ deals
4. Create Dashboard:
   - Show sales pipeline
   - Track deal stages
   - Customer value analysis
5. Add Users:
   - Sales manager role
   - Sales reps with user role
```

## Troubleshooting

### Can't see tenant data?
- Make sure you're logged in with an account assigned to that tenant
- Check user_profiles table - user must have tenant_id matching the tenant

### Field not showing in records?
- Go back to Schema Builder
- Verify the field was created on the correct sub-module
- Refresh the page

### Can't create records?
- Make sure you're in the correct module/sub-module
- Check that required fields are filled
- Verify you have user role (not just viewer)

### Permission denied errors?
- Check your user role in User Management Console
- Ask admin to assign proper permissions
- Login with admin account to troubleshoot

## Testing the System

### Test Data Script (Optional)

To populate with sample data quickly, in Supabase SQL Editor run:

```sql
-- Create sample employees
INSERT INTO sub_module_records (
    sub_module_id,
    tenant_id,
    created_by,
    data
) VALUES (
    (SELECT id FROM sub_modules WHERE name = 'Employees' LIMIT 1),
    (SELECT id FROM tenants LIMIT 1),
    (SELECT id FROM user_profiles WHERE role_code = 'admin' LIMIT 1),
    '{
        "employee_id": "EMP001",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@company.com",
        "position": "Software Engineer",
        "department": "Engineering",
        "hire_date": "2023-01-15"
    }'::jsonb
);
```

## Next Steps

1. **Test all modules** - Create tenants for each module type
2. **Invite team members** - Use User Management to add your team
3. **Create custom dashboards** - Build visualizations for your KPIs
4. **Set up integrations** - Connect data sources if needed
5. **Configure automations** - Set up workflows and notifications

---

**Need Help?**
- Check the API_DOCUMENTATION.md for API endpoints
- Review IMPLEMENTATION_PROGRESS.md for feature status
- Check migrations in supabase/migrations/ for database schema
