import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminSidebar from '../../components/ui/AdminSidebar';
import ModuleBreadcrumbs from '../../components/ui/ModuleBreadcrumbs';
import UserProfileDropdown from '../../components/ui/UserProfileDropdown';
import NotificationBadge from '../../components/ui/NotificationBadge';
import Icon from '../../components/AppIcon';
import { useToast } from '../../contexts/ToastContext';
import RecordHeader from './components/RecordHeader';
import RecordFormSection from './components/RecordFormSection';
import AttachmentsTab from './components/AttachmentsTab';
import CommentsTab from './components/CommentsTab';
import ActivityTab from './components/ActivityTab';
import RelatedRecordsTab from './components/RelatedRecordsTab';
import { recordService } from '../../services/recordService';
import { fieldService } from '../../services/fieldService';
import { attachmentService } from '../../services/attachmentService';
import { commentService } from '../../services/commentService';
import { activityService } from '../../services/activityService';
import { relationshipService } from '../../services/relationshipService';
import { useAuth } from '../../contexts/AuthContext';
import { getLangText } from '../../utils/languageUtils';

const RecordDetailManagement = () => {
  const [searchParams] = useSearchParams();
  const { tenantId, user } = useAuth();
  const toast = useToast();
  const recordId = searchParams.get('id');
  const moduleId = searchParams.get('moduleId');
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('attachments');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [recordData, setRecordData] = useState({
    id: '',
    recordId: '',
    title: '',
    status: 'active',
    createdAt: '',
    createdBy: '',
    module: '',
    subModule: ''
  });

  const [formData, setFormData] = useState({});
  const [fieldDefinitions, setFieldDefinitions] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [relatedRecords, setRelatedRecords] = useState([]);

  useEffect(() => {
    if (recordId && moduleId && tenantId) {
      loadAllData();
    }
  }, [recordId, moduleId, tenantId]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Load the record
      const record = await recordService?.getById(recordId);
      
      // Load the fields for the module
      const fields = await fieldService?.getAllFields(moduleId);
      const mappedFields = (fields || [])?.map(field => ({
        name: field?.name,
        label: getLangText(field?.label, 'en'),
        type: field?.data_type?.toLowerCase() || 'text',
        required: field?.required,
        placeholder: getLangText(field?.label, 'en')
      }));
      
      setFieldDefinitions(mappedFields);
      setFormData(record?.data || {});
      setRecordData({
        id: record?.id,
        recordId: record?.id,
        title: record?.data?.name || record?.data?.title || 'Record Details',
        status: 'active',
        createdAt: record?.created_at,
        createdBy: 'System',
        module: moduleId,
        subModule: moduleId
      });
      
      // Load attachments
      const atts = await attachmentService.getByRecordAdvanced(recordId, tenantId);
      setAttachments(atts || []);
      
      // Load comments
      const comms = await commentService.getByRecord(recordId, tenantId);
      setComments(comms || []);
      
      // Load activities
      const acts = await activityService.getByRecord(recordId, tenantId);
      setActivities(acts || []);
      
      // Load related records
      const relRecs = await relationshipService.getRelatedRecords(recordId, tenantId);
      setRelatedRecords(relRecs || []);
      
      setError(null);
    } catch (err) {
      console.error('Error loading record data:', err);
      setError('Failed to load record data');
    } finally {
      setLoading(false);
    }
  };


  const tabs = [
    { id: 'attachments', label: 'Attachments', icon: 'Paperclip', count: attachments?.length },
    { id: 'comments', label: 'Comments', icon: 'MessageSquare', count: comments?.length },
    { id: 'activity', label: 'Activity', icon: 'Activity', count: activities?.length },
    { id: 'related', label: 'Related Records', icon: 'Link', count: relatedRecords?.length }
  ];


  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setIsEditing(false);
      // Log the field change activity
      if (recordService?.update) {
        await recordService.update(recordId, formData, fields);
        await loadAllData(); // Refresh all data after save
      }
    } catch (error) {
      console.error('Error saving record:', error);
      setError('Failed to save record');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      if (recordService?.delete) {
        await recordService.delete(recordId);
        // Navigate back to module list
        window.location.href = `/dynamic-module-list-view?moduleId=${moduleId}`;
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      setError('Failed to delete record');
    }
  };

  const handleAddRelation = () => {
    // TODO: Open modal to select record and relationship type
    console.log('Add relation modal');
  };

  const handleRemoveRelation = async (relationshipId) => {
    try {
      await relationshipService.deleteRelationship(relationshipId);
      // Refresh related records after deletion
      await loadAllData();
    } catch (error) {
      console.error('Error removing relation:', error);
      setError('Failed to remove relation');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    const printContent = `
      <html>
      <head>
        <title>${recordData?.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          .field { margin: 10px 0; }
          .label { font-weight: bold; color: #666; }
          .value { color: #000; }
          hr { margin: 20px 0; border: none; border-top: 1px solid #ccc; }
        </style>
      </head>
      <body>
        <h1>${recordData?.title}</h1>
        <p><strong>Record ID:</strong> ${recordData?.recordId}</p>
        <p><strong>Status:</strong> ${recordData?.status}</p>
        <p><strong>Created:</strong> ${new Date(recordData?.createdAt)?.toLocaleString()}</p>
        <p><strong>Created By:</strong> ${recordData?.createdBy}</p>
        <hr>
        ${Object.entries(formData).map(([key, value]) => `
          <div class="field">
            <div class="label">${key}:</div>
            <div class="value">${value}</div>
          </div>
        `).join('')}
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleExportRecord = () => {
    const dataToExport = {
      id: recordData?.recordId,
      title: recordData?.title,
      status: recordData?.status,
      created: recordData?.createdAt,
      createdBy: recordData?.createdBy,
      ...formData
    };

    const content = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recordData?.title || 'record'}-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    alert('Record exported successfully!');
  };

  const handleShareRecord = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${recordId}&moduleId=${moduleId}`;
    
    if (navigator.share) {
      navigator.share({
        title: recordData?.title,
        text: `Check out this record: ${recordData?.title}`,
        url: shareUrl
      }).catch(error => console.error('Share error:', error));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Share link copied to clipboard!');
      });
    }
  };

  const handleEmailRecord = () => {
    const emailContent = `Check out this record: ${recordData?.title}\n\n${window.location.href}`;
    const mailtoLink = `mailto:?subject=${encodeURIComponent(recordData?.title)}&body=${encodeURIComponent(emailContent)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="flex-shrink-0 w-60 lg:w-60 overflow-hidden">
        <AdminSidebar />
      </div>
      <div className="flex-1 flex flex-col">
        <header className="bg-card border-b border-border px-4 md:px-6 lg:px-8 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground truncate">
                Record Detail Management
              </h2>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <button className="relative p-2 rounded-md hover:bg-muted">
                <Icon name="Bell" size={20} />
                <NotificationBadge count={3} variant="error" className="absolute -top-1 -right-1" />
              </button>
              <UserProfileDropdown />
            </div>
          </div>
        </header>

        <main className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <ModuleBreadcrumbs />

          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Icon name="Loader2" size={48} className="animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading record details...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-destructive" />
                <p className="text-destructive font-semibold">{error}</p>
                <p className="text-muted-foreground mt-2">Please make sure you have a valid record ID in the URL</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <RecordHeader
                record={recordData}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSave={handleSave}
                onCancel={handleCancel}
                onPrint={handlePrint}
                onExport={handleExportRecord}
                onShare={handleShareRecord}
                onEmail={handleEmailRecord}
                isEditing={isEditing} />

              <RecordFormSection
                formData={formData}
                onChange={setFormData}
                isEditing={isEditing}
                fieldDefinitions={fieldDefinitions} />

              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="border-b border-border overflow-x-auto">
                  <div className="flex min-w-max">
                    {tabs?.map((tab) => (
                      <button
                        key={tab?.id}
                        onClick={() => setActiveTab(tab?.id)}
                        className={`flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-medium flex-shrink-0 ${
                          activeTab === tab?.id
                            ? 'text-primary border-b-2 border-primary bg-primary/5'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}>
                        <Icon name={tab?.icon} size={18} />
                        <span>{tab?.label}</span>
                        {tab?.count > 0 && (
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            activeTab === tab?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {tab?.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 md:p-6 lg:p-8">
                  {activeTab === 'attachments' && (
                    <AttachmentsTab
                      recordId={recordId}
                      moduleId={moduleId}
                      tenantId={tenantId}
                      userId={user?.id}
                      attachments={attachments}
                      onAttachmentsUpdate={loadAllData} />
                  )}
                  {activeTab === 'comments' && (
                    <CommentsTab
                      recordId={recordId}
                      moduleId={moduleId}
                      tenantId={tenantId}
                      userId={user?.id}
                      userName={user?.full_name}
                      comments={comments}
                      onCommentAdded={loadAllData} />
                  )}
                  {activeTab === 'activity' && (
                    <ActivityTab activities={activities} />
                  )}
                  {activeTab === 'related' && (
                    <RelatedRecordsTab
                      relatedRecords={relatedRecords}
                      onAddRelation={handleAddRelation}
                      onRemoveRelation={handleRemoveRelation} />
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="bg-card border-t border-border px-4 md:px-6 lg:px-8 py-4 mt-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date()?.getFullYear()} TenantFlow SaaS. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-foreground">Privacy Policy</a>
              <a href="#" className="hover:text-foreground">Terms of Service</a>
              <a href="#" className="hover:text-foreground">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default RecordDetailManagement;