# API Documentation

## Overview

TenantFlow provides two types of APIs:

1. **Supabase REST API** (80%) - Direct access via Supabase client (frontend)
2. **Backend API** (20%) - Express.js endpoints for complex logic

## Base URLs

```
Frontend: http://localhost:4028
Backend: http://localhost:3000
Supabase: https://ihbmtyowpnhehcslpdij.supabase.co
```

## Authentication

### Frontend (Supabase JWT)
```javascript
import { useAuth } from '@/contexts/AuthContext';

const { user, isAuthenticated } = useAuth();
// JWT token automatically included in requests
```

### Backend (Bearer Token)
```bash
curl -H "Authorization: Bearer {jwt_token}" \
  http://localhost:3000/api/v1/dashboards/123/query
```

---

## Backend API Endpoints

### Health & Status

#### GET /health
Check server health.

```bash
curl http://localhost:3000/health
```

**Response** (200):
```json
{
  "status": "healthy",
  "timestamp": "2026-01-22T10:30:00.000Z",
  "uptime": 3600.5
}
```

#### GET /health/ready
Kubernetes readiness probe.

```bash
curl http://localhost:3000/health/ready
```

---

### Dashboards

#### POST /api/v1/dashboards/:dashboardId/query
Execute dashboard query with joins, aggregations, and filters.

**Parameters**:
- `dashboardId` (path) - Dashboard ID

**Body**:
```json
{
  "filters": {
    "date_from": "2026-01-01",
    "date_to": "2026-12-31",
    "status": "active"
  },
  "limit": 100,
  "offset": 0
}
```

**Request**:
```bash
curl -X POST http://localhost:3000/api/v1/dashboards/abc123/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "filters": {},
    "limit": 100,
    "offset": 0
  }'
```

**Response** (200):
```json
{
  "dashboardId": "abc123",
  "widgets": [
    {
      "widgetId": "widget1",
      "title": "Sales by Region",
      "type": "CHART_BAR",
      "data": [
        { "region": "North", "sales": 45000 },
        { "region": "South", "sales": 38000 }
      ]
    }
  ]
}
```

---

### Suppliers

#### GET /api/v1/suppliers/:supplierId/analytics
Get aggregated supplier analytics and ratings.

**Parameters**:
- `supplierId` (path) - Supplier ID

**Request**:
```bash
curl http://localhost:3000/api/v1/suppliers/supp123/analytics \
  -H "Authorization: Bearer {token}"
```

**Response** (200):
```json
{
  "supplier": {
    "id": "supp123",
    "code": "SUPP-001",
    "name": "Acme Corp",
    "category": "Electronics",
    "country": "USA",
    "overall_rating": 4.5,
    "status": "active"
  },
  "analytics": {
    "totalRatings": 12,
    "averageQuality": 4.6,
    "averageDelivery": 4.3,
    "averagePrice": 4.2,
    "averageCommunication": 4.8,
    "overallRating": 4.5,
    "recentRatings": [
      {
        "id": "rating1",
        "quality_rating": 5,
        "delivery_rating": 4,
        "price_rating": 4,
        "communication_rating": 5,
        "period_start_date": "2026-01-01",
        "period_end_date": "2026-01-31"
      }
    ]
  }
}
```

---

### Email Queue

#### GET /api/v1/email-queue/status
Get email queue statistics.

**Request**:
```bash
curl http://localhost:3000/api/v1/email-queue/status
```

**Response** (200):
```json
{
  "status": "operational",
  "queue": {
    "pending": 5,
    "sent": 142,
    "failed": 2
  },
  "timestamp": "2026-01-22T10:30:00.000Z"
}
```

#### POST /api/v1/email-queue/process
Process pending emails from queue (internal use).

**Request**:
```bash
curl -X POST http://localhost:3000/api/v1/email-queue/process \
  -H "Content-Type: application/json"
```

**Response** (200):
```json
{
  "processed": 5,
  "emails": [
    {
      "id": "email1",
      "to": "user@example.com",
      "template": "welcome",
      "status": "processing"
    }
  ]
}
```

---

## Frontend Services (Supabase Direct)

All services are in `/src/services/` and automatically handle authentication.

### Tenant Service

```typescript
import { tenantService } from '@/services/tenantService';

// Get all tenants
await tenantService.getAll();

// Get tenant by ID
await tenantService.getById(tenantId);

// Create new tenant
await tenantService.create({
  name: 'ACME Inc',
  code: 'acme',
  subscriptionPlan: 'professional'
});

// Update tenant
await tenantService.update(tenantId, {
  name: 'ACME Inc (Updated)',
  status: 'active'
});

// Delete tenant
await tenantService.delete(tenantId);
```

### Module Service

```typescript
import { moduleService } from '@/services/moduleService';

// Get all main modules
await moduleService.getAllMainModules();

// Get sub-modules for tenant
await moduleService.getAllSubModules(tenantId);

// Get sub-module by code
await moduleService.getSubModuleByCode(tenantId, 'EMPLOYEES');

// Create sub-module
await moduleService.createSubModule(tenantId, {
  mainModuleId: mainModuleId,
  code: 'EMPLOYEES',
  name: { en: 'Employees', ar: 'الموظفين' }
});
```

### Record Service

```typescript
import { recordService } from '@/services/recordService';

// Get records with pagination
const { data, count } = await recordService.getAll(
  subModuleId,
  { search: 'John' },
  limit = 50,
  offset = 0
);

// Get single record
await recordService.getById(recordId);

// Get with related data
await recordService.getWithRelations(recordId);

// Create record
await recordService.create(subModuleId, {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com'
});

// Update record
await recordService.update(recordId, {
  first_name: 'Jane'
});

// Bulk update
await recordService.bulkUpdate([id1, id2], {
  status: 'archived'
});

// Delete record
await recordService.delete(recordId);
```

### Comment Service

```typescript
import { commentService } from '@/services/commentService';

// Get comments for record
await commentService.getByRecord(recordId);

// Get replies
await commentService.getReplies(parentCommentId);

// Create comment
await commentService.create(
  tenantId,
  recordId,
  'Great work! @jane @bob',
  ['user-id-jane', 'user-id-bob']
);

// Reply to comment
await commentService.reply(
  tenantId,
  recordId,
  parentCommentId,
  'Thanks! @john'
);

// Update comment
await commentService.update(commentId, 'Updated text');

// Delete comment
await commentService.delete(commentId);
```

### Attachment Service

```typescript
import { attachmentService } from '@/services/attachmentService';

// Get attachments for record
await attachmentService.getByRecord(recordId);

// Upload file
await attachmentService.uploadFile(
  file,
  tenantId,
  subModuleId,
  recordId
);

// Get download URL (signed)
const url = await attachmentService.getDownloadUrl(attachmentId);

// Get public URL
const publicUrl = await attachmentService.getPublicUrl(attachmentId);

// Make attachment public
await attachmentService.makePublic(attachmentId);

// Make attachment private
await attachmentService.makePrivate(attachmentId);

// Delete attachment
await attachmentService.deleteFile(attachmentId);
```

### Notification Service

```typescript
import { notificationService } from '@/services/notificationService';

// Get unread notifications
await notificationService.getUnread(userId);

// Get all notifications
await notificationService.getAll(userId, limit = 50, offset = 0);

// Mark as read
await notificationService.markAsRead(notificationId);

// Mark all as read
await notificationService.markAllAsRead(userId);

// Delete notification
await notificationService.delete(notificationId);

// Subscribe to real-time notifications
const subscription = notificationService.subscribeToNotifications(
  userId,
  (payload) => {
    console.log('New notification:', payload);
  }
);
```

### Supplier Service

```typescript
import { supplierService } from '@/services/supplierService';

// List suppliers
const { data, count } = await supplierService.getAll(
  tenantId,
  { category: 'Electronics', search: 'Acme' },
  limit = 50
);

// Get supplier details
await supplierService.getById(supplierId);

// Create supplier
await supplierService.create(tenantId, {
  code: 'SUPP-001',
  name: 'Acme Corp',
  category: 'Electronics',
  country: 'USA'
});

// Add rating
await supplierService.addRating(tenantId, supplierId, {
  periodStartDate: '2026-01-01',
  periodEndDate: '2026-01-31',
  qualityRating: 5,
  deliveryRating: 4,
  priceRating: 4,
  communicationRating: 5,
  comments: 'Great supplier'
});

// Get analytics
await supplierService.getAnalytics(supplierId);
```

### Dashboard Service

```typescript
import { dashboardService } from '@/services/dashboardService';

// Get all dashboards
await dashboardService.getAll(tenantId, scope = 'GLOBAL');

// Get dashboard with widgets
await dashboardService.getById(dashboardId);

// Create dashboard
await dashboardService.create({
  name: 'Sales Dashboard',
  scope: 'GLOBAL',
  layoutConfig: {}
});

// Update dashboard
await dashboardService.update(dashboardId, {
  name: 'Updated Dashboard',
  isPublished: true
});

// Publish dashboard
await dashboardService.publish(dashboardId);

// Delete dashboard
await dashboardService.delete(dashboardId);
```

---

## Error Handling

### Backend Errors

```json
{
  "error": "Error message",
  "status": 400,
  "timestamp": "2026-01-22T10:30:00.000Z",
  "stack": "..." // Only in development
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Server Error |

---

## Rate Limiting

Backend API has rate limiting:
- **15 requests per minute** per IP
- **100 requests per minute** per authenticated user

---

## Webhooks (Future)

Coming soon:
- Record created/updated/deleted
- Comment added
- File uploaded
- Supplier rating submitted

---

**Last Updated**: January 2026  
**API Version**: v1
