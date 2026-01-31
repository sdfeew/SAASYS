import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/ui/AdminSidebar';
import ModuleBreadcrumbs from '../../components/ui/ModuleBreadcrumbs';
import UserProfileDropdown from '../../components/ui/UserProfileDropdown';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorAlert from '../../components/ui/ErrorAlert';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { recordService } from '../../services/recordService';
import { moduleService } from '../../services/moduleService';
import { fieldService } from '../../services/fieldService';
import { commentService } from '../../services/commentService';
import { attachmentService } from '../../services/attachmentService';
import { activityService } from '../../services/activityService';
import { useAuth } from '../../contexts/AuthContext';
import { errorHandler } from '../../utils/errorHandler';
import { dataHandler } from '../../utils/dataHandler';

const RecordDetailManagementEnhanced = () => {
  const { user, tenantId } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // State management
  const [record, setRecord] = useState(null);
  const [module, setModule] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Data states
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [relationships, setRelationships] = useState([]);

  // Form state
  const [formData, setFormData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  const recordId = searchParams.get('id');
  const moduleId = searchParams.get('module_id');

  // Load record data
  useEffect(() => {
    if (recordId && moduleId) {
      loadRecord();
      loadModule();
      loadComments();
      loadAttachments();
      loadActivities();
    }
  }, [recordId, moduleId]);

  const loadRecord = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recordService.getById(recordId);
      if (!data) {
        setError('Record not found');
        setTimeout(() => navigate(-1), 2000);
      } else {
        setRecord(data);
        setFormData(data);
      }
    } catch (err) {
      errorHandler.logError('RecordDetailManagement:loadRecord', err);
      setError('Failed to load record');
    } finally {
      setLoading(false);
    }
  };

  const loadModule = async () => {
    try {
      const moduleData = await moduleService.getById(moduleId);
      setModule(moduleData);

      const fieldsData = await fieldService.getAllFields(moduleId);
      setFields(fieldsData || []);
    } catch (err) {
      errorHandler.logError('RecordDetailManagement:loadModule', err);
    }
  };

  const loadComments = async () => {
    try {
      const data = await commentService.getByRecord(recordId);
      setComments(data || []);
    } catch (err) {
      errorHandler.logError('RecordDetailManagement:loadComments', err);
    }
  };

  const loadAttachments = async () => {
    try {
      const data = await attachmentService.getByRecord(recordId);
      setAttachments(data || []);
    } catch (err) {
      errorHandler.logError('RecordDetailManagement:loadAttachments', err);
    }
  };

  const loadActivities = async () => {
    try {
      const data = await activityService.getByRecord(recordId);
      setActivities(data || []);
    } catch (err) {
      errorHandler.logError('RecordDetailManagement:loadActivities', err);
    }
  };

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await recordService.update(recordId, formData);
      setRecord(updated);
      setFormData(updated);
      setHasChanges(false);

      // Log activity
      await activityService.create({
        record_id: recordId,
        action: 'updated',
        description: 'Record updated',
        user_id: user?.id,
        tenant_id: tenantId
      });

      // Reload activities
      loadActivities();
    } catch (err) {
      errorHandler.logError('RecordDetailManagement:handleSave', err);
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async (text) => {
    try {
      const newComment = await commentService.create({
        record_id: recordId,
        text,
        user_id: user?.id,
        tenant_id: tenantId
      });
      setComments([newComment, ...comments]);
    } catch (err) {
      errorHandler.logError('RecordDetailManagement:handleAddComment', err);
      setError('Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentService.delete(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      errorHandler.logError('RecordDetailManagement:handleDeleteComment', err);
      setError('Failed to delete comment');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading record..." />;
  }

  if (!record) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorAlert
          error={error}
          title="Record Not Found"
          onRetry={loadRecord}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded"
              >
                <Icon name="Menu" size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {record?.title || 'Untitled Record'}
                </h1>
                <p className="text-sm text-slate-600">
                  {module?.name} • Created {new Date(record?.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <StatusBadge status={record?.status || 'draft'} />
              <UserProfileDropdown user={user} />
            </div>
          </div>

          {/* Breadcrumbs */}
          <ModuleBreadcrumbs module={module} />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-slate-100">
            <ErrorAlert
              error={error}
              title="Error"
              onRetry={loadRecord}
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 max-w-6xl mx-auto">
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200">
              {[
                { id: 'details', label: 'Details', icon: 'FileText' },
                { id: 'comments', label: `Comments (${comments.length})`, icon: 'MessageSquare' },
                { id: 'attachments', label: `Attachments (${attachments.length})`, icon: 'Paperclip' },
                { id: 'activity', label: 'Activity', icon: 'Clock' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 flex items-center gap-2 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon name={tab.icon} size={18} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Record Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {fields.map(field => (
                      <div key={field.id}>
                        <label className="block text-sm font-medium text-slate-900 mb-2">
                          {field.label}
                        </label>
                        <input
                          type={field.type === 'email' ? 'email' : 'text'}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
                    <Button
                      onClick={handleSave}
                      disabled={!hasChanges || saving}
                      loading={saving}
                      className="flex items-center gap-2"
                    >
                      <Icon name="Save" size={18} />
                      Save Changes
                    </Button>
                    <Button
                      onClick={() => {
                        setFormData(record);
                        setHasChanges(false);
                      }}
                      variant="secondary"
                      disabled={!hasChanges}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <div className="space-y-4">
                {/* Add Comment */}
                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Add Comment</h2>
                  <textarea
                    placeholder="Write your comment here..."
                    rows="4"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-3 mt-4">
                    <Button
                      onClick={(e) => {
                        const textarea = e.target.parentElement.parentElement.querySelector('textarea');
                        handleAddComment(textarea.value);
                        textarea.value = '';
                      }}
                    >
                      Post Comment
                    </Button>
                  </div>
                </div>

                {/* Comments List */}
                {comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map(comment => (
                      <div key={comment.id} className="bg-white rounded-lg p-6 border border-slate-200">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-slate-900">{comment.author || 'Anonymous'}</p>
                            <p className="text-xs text-slate-500">
                              {dataHandler.formatDate(comment.created_at)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Icon name="Trash2" size={16} />
                          </button>
                        </div>
                        <p className="text-slate-700">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-600">
                    No comments yet. Be the first to comment!
                  </div>
                )}
              </div>
            )}

            {/* Attachments Tab */}
            {activeTab === 'attachments' && (
              <div className="bg-white rounded-lg p-6 border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Attachments</h2>
                
                {attachments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {attachments.map(attachment => (
                      <a
                        key={attachment.id}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <Icon name="FileIcon" size={24} className="text-slate-600 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-slate-900 truncate">{attachment.name}</p>
                            <p className="text-xs text-slate-600">
                              {dataHandler.formatFileSize(attachment.size)}
                            </p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-600">
                    No attachments yet. Upload files to attach them to this record.
                  </div>
                )}
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-2">
                {activities.length > 0 ? (
                  activities.map((activity, index) => (
                    <div
                      key={activity.id}
                      className="flex gap-4 p-4 bg-white rounded-lg border border-slate-200"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Icon name="Clock" size={16} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {activity.description || activity.action}
                        </p>
                        <p className="text-xs text-slate-600">
                          {dataHandler.formatDate(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-600">
                    No activity yet. Changes to this record will appear here.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordDetailManagementEnhanced;
