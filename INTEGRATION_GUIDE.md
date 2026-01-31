# دليل الاستخدام والتكامل - Integration Guide

## كيفية استخدام المميزات الجديدة

---

## 1️⃣ مثال عملي: دمج سير العمل

### المسألة: إرسال إشعار عند تغيير حالة السجل

```javascript
// 1. إنشاء سير عمل
const workflow = await workflowService.createWorkflow({
  module_id: 'modules_12345',
  name: 'Send Approval Notification',
  description: 'Notify admin when record needs approval',
  status: 'draft'
});

// 2. إضافة محفز (Trigger)
const trigger = await workflowService.addTrigger(workflow.id, {
  type: 'status_changed',
  condition: { 
    from_status: 'draft',
    to_status: 'pending_approval'
  }
});

// 3. إضافة إجراء (Action)
const action = await workflowService.addAction(workflow.id, {
  type: 'send_notification',
  sequence: 1,
  config: {
    template: 'approval_request',
    recipients: ['admin@company.com'],
    subject: 'New Record Needs Approval'
  }
});

// 4. نشر سير العمل
await workflowService.publishWorkflow(workflow.id);

// 5. الآن عند تغيير الحالة، سيتم إرسال إشعار تلقائياً
const record = await recordService.update(recordId, {
  status: 'pending_approval'
});
```

---

## 2️⃣ مثال عملي: استيراد بيانات من ملف CSV

### في مكون React

```jsx
import { importExportService } from '../../services/importExportService';
import { recordService } from '../../services/recordService';

function ImportRecordsComponent() {
  const [importResult, setImportResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      // 1. تحليل الملف
      const { headers, data } = await importExportService.parseCSV(file);
      
      // 2. تعيين الحقول (matching headers to database fields)
      const fieldMapping = {
        'Full Name': 'name',
        'Email Address': 'email',
        'Company': 'company',
        'Status': 'status'
      };

      // 3. استيراد البيانات
      const result = await importExportService.importRecords(
        moduleId,
        data,
        fieldMapping
      );

      setImportResult(result);
      
      if (result.failed > 0) {
        console.warn(`⚠️ ${result.failed} records failed:`, result.errors);
      }
      
      alert(`✅ Successfully imported ${result.success} records!`);
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed. Please check the file format.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv"
        onChange={handleImport}
        disabled={loading}
      />
      {loading && <p>Importing...</p>}
      {importResult && (
        <div>
          <p>Success: {importResult.success}</p>
          <p>Failed: {importResult.failed}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 3️⃣ مثال عملي: تصدير السجلات

```javascript
import { importExportService } from '../../services/importExportService';
import { recordService } from '../../services/recordService';
import { fieldService } from '../../services/fieldService';

async function exportAllRecords(moduleId) {
  try {
    // 1. جلب جميع السجلات
    const records = await recordService.getAll(moduleId);
    
    // 2. جلب حقول الوحدة
    const fields = await fieldService.getAllFields(moduleId);
    
    // 3. تصدير إلى CSV
    await importExportService.exportToCSV(
      records, 
      fields, 
      `export_${new Date().toISOString().split('T')[0]}.csv`
    );
    
    console.log('✅ Export completed!');
  } catch (error) {
    console.error('Export failed:', error);
  }
}
```

---

## 4️⃣ مثال عملي: معالجة الأخطاء في الصفحات

```jsx
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import ErrorAlert from '../../components/ui/ErrorAlert';
import Button from '../../components/ui/Button';

function MyPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchData();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // حالة التحميل
  if (loading) {
    return <LoadingSpinner message="Loading your data..." />;
  }

  // حالة الخطأ
  if (error) {
    return (
      <ErrorAlert
        error={error}
        title="Failed to Load Data"
        onRetry={loadData}
      />
    );
  }

  // حالة عدم وجود بيانات
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon="Package"
        title="No Data Available"
        description="Start by adding your first item"
        action={<Button onClick={() => openModal()}>Add Item</Button>}
      />
    );
  }

  // عرض البيانات
  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

---

## 5️⃣ تطبيق عملي: نظام الموافقات

### البنية:

```
سجل جديد (draft)
    ↓
سير العمل ينشط: إرسال طلب موافقة
    ↓
الحالة تتغير إلى pending_approval
    ↓
إشعار يُرسل للمسؤول
    ↓
المسؤول يوافق/يرفض
    ↓
السجل يُحدّث والعمل ينتهي
```

### الكود:

```javascript
// 1. إنشاء سير العمل
const approvalWorkflow = await workflowService.createWorkflow({
  module_id: modulesId.contracts,
  name: 'Contract Approval Workflow',
  description: 'For contract reviews'
});

// 2. إضافة المحفز
await workflowService.addTrigger(approvalWorkflow.id, {
  type: 'record_created',
  condition: { module_type: 'contract' }
});

// 3. إضافة الإجراءات
// الخطوة 1: إرسال إشعار
await workflowService.addAction(approvalWorkflow.id, {
  type: 'send_notification',
  sequence: 1,
  config: {
    template: 'approval_request',
    recipients: ['approver@company.com'],
    subject: 'New Contract Requires Approval'
  }
});

// الخطوة 2: تحديث الحالة
await workflowService.addAction(approvalWorkflow.id, {
  type: 'update_record',
  sequence: 2,
  config: {
    status: 'pending_approval',
    assigned_to: 'approval_group'
  }
});

// الخطوة 3: إنشاء مهمة
await workflowService.addAction(approvalWorkflow.id, {
  type: 'create_task',
  sequence: 3,
  config: {
    title: 'Review and approve contract',
    priority: 'high',
    assigned_to: 'approval_group'
  }
});

// 4. نشر سير العمل
await workflowService.publishWorkflow(approvalWorkflow.id);
```

---

## 6️⃣ نمط معالجة الأخطاء المتقدم

```javascript
import { errorHandler } from '../../utils/errorHandler';

async function complexOperation() {
  try {
    // العملية المعقدة
    const result = await someService.operation();
    
    // التحقق من النتيجة
    if (!result) {
      throw new Error('Operation returned no data');
    }
    
    return result;
  } catch (error) {
    // تسجيل الخطأ مع السياق
    errorHandler.logError('ComplexOperation', error, {
      stage: 'processing',
      timestamp: new Date().toISOString(),
      additionalInfo: 'Context data here'
    });
    
    // إعادة رفع الخطأ للمتصل
    throw error;
  }
}

// الاستخدام في مكون React
async function handleAction() {
  try {
    const result = await complexOperation();
    setSuccess('Operation completed!');
  } catch (error) {
    const userMessage = errorHandler.getUserFriendlyMessage(error);
    setError(userMessage);
  }
}
```

---

## 7️⃣ كيفية إضافة مكون واجهة جديد

### مثال: إضافة مكون Badge مخصص

```jsx
// src/components/ui/CustomBadge.jsx
import Icon from '../AppIcon';

const CustomBadge = ({ 
  type = 'default',
  icon = null,
  children,
  className = ''
}) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${variants[type]} ${className}`}>
      {icon && <Icon name={icon} size={16} />}
      {children}
    </span>
  );
};

export default CustomBadge;
```

### الاستخدام:

```jsx
import CustomBadge from '../../components/ui/CustomBadge';

<CustomBadge type="success" icon="CheckCircle">
  Completed
</CustomBadge>
```

---

## 8️⃣ أسئلة شائعة (FAQ)

### س: كيف أضيف حقل مخصص إلى سير العمل؟
**ج**: 
```javascript
const workflow = await workflowService.createWorkflow({
  module_id: moduleId,
  name: 'Custom Workflow',
  custom_fields: {
    priority: 'high',
    owner: 'team-lead'
  }
});
```

### س: هل يمكن تشغيل عدة إجراءات متوازية؟
**ج**: نعم، عن طريق تعيين نفس `sequence` لعدة إجراءات

### س: كيف أتتبع تنفيذ سير العمل؟
**ج**:
```javascript
const logs = await workflowService.getExecutionLogs(workflowId);
logs.forEach(log => console.log(log));
```

### س: هل يمكن استيراد ملفات Excel؟
**ج**: الحالياً يدعم CSV، لكن يمكن تحويل Excel إلى CSV بسهولة

---

## ⚠️ النقاط المهمة

1. **الأمان**: تأكد دائماً من تضمين `tenant_id` في الاستعلامات
2. **الأداء**: استخدم الـ pagination للبيانات الكبيرة
3. **UX**: اعرض دائماً حالات التحميل والخطأ والفراغ
4. **الاختبار**: اختبر سير العمل بدقة قبل النشر

---

## 📞 الحصول على الدعم

إذا احتجت إلى:
- **شرح مفصل**: اقرأ `FRONTEND_COMPLETION_GUIDE.md`
- **أمثلة إضافية**: ابحث في المشاريع الأخرى
- **حل مشاكل**: استخدم `connectionChecker.diagnosticReport()`

---

**آخر تحديث**: 2024
**النسخة**: 1.0

