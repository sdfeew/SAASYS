import React, { useState } from 'react';
import AdminSidebar from '../../components/ui/AdminSidebar';
import ModuleBreadcrumbs from '../../components/ui/ModuleBreadcrumbs';
import UserProfileDropdown from '../../components/ui/UserProfileDropdown';
import NotificationBadge from '../../components/ui/NotificationBadge';
import Icon from '../../components/AppIcon';
import RecordHeader from './components/RecordHeader';
import RecordFormSection from './components/RecordFormSection';
import AttachmentsTab from './components/AttachmentsTab';
import CommentsTab from './components/CommentsTab';
import ActivityTab from './components/ActivityTab';
import RelatedRecordsTab from './components/RelatedRecordsTab';

const RecordDetailManagement = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('attachments');

  const [recordData, setRecordData] = useState({
    id: 'REC-2026-001',
    recordId: 'EMP-2026-12345',
    title: 'Employee Onboarding - Sarah Johnson',
    status: 'active',
    createdAt: '2026-01-02T10:30:00',
    createdBy: 'Michael Chen',
    module: 'hr',
    subModule: 'onboarding'
  });

  const [formData, setFormData] = useState({
    employeeName: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    department: 'engineering',
    position: 'Senior Software Engineer',
    startDate: '2026-01-15',
    salary: '125000',
    employmentType: 'full-time',
    location: 'San Francisco, CA',
    manager: 'Michael Chen',
    isRemote: true
  });

  const fieldDefinitions = [
  { name: 'employeeName', label: 'Employee Name', type: 'text', required: true, placeholder: 'Enter full name' },
  { name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'employee@company.com' },
  {
    name: 'department',
    label: 'Department',
    type: 'select',
    required: true,
    options: [
    { value: 'engineering', label: 'Engineering' },
    { value: 'sales', label: 'Sales' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'hr', label: 'Human Resources' }]

  },
  { name: 'position', label: 'Position', type: 'text', required: true, placeholder: 'Job title' },
  { name: 'startDate', label: 'Start Date', type: 'date', required: true },
  { name: 'salary', label: 'Annual Salary', type: 'currency', required: true, description: 'In USD' },
  {
    name: 'employmentType',
    label: 'Employment Type',
    type: 'select',
    required: true,
    options: [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'intern', label: 'Intern' }]

  },
  { name: 'location', label: 'Office Location', type: 'text', placeholder: 'City, State' },
  { name: 'manager', label: 'Reporting Manager', type: 'text', placeholder: 'Manager name' },
  { name: 'isRemote', label: 'Remote Work Eligible', type: 'boolean', description: 'Can work remotely' }];


  const [attachments, setAttachments] = useState([
  {
    id: 'att-1',
    name: 'Employment_Contract_Sarah_Johnson.pdf',
    type: 'application/pdf',
    size: 2456789,
    url: "https://img.rocket.new/generatedImages/rocket_gen_img_1504053bf-1764783239720.png",
    alt: 'PDF document showing employment contract with company letterhead and signature fields',
    uploadedBy: 'Michael Chen',
    uploadedAt: '2026-01-02T11:15:00'
  },
  {
    id: 'att-2',
    name: 'Resume_Sarah_Johnson.pdf',
    type: 'application/pdf',
    size: 1234567,
    url: "https://img.rocket.new/generatedImages/rocket_gen_img_11fefffe5-1765273095596.png",
    alt: 'Professional resume document with work experience and education details',
    uploadedBy: 'HR Department',
    uploadedAt: '2026-01-02T09:45:00'
  },
  {
    id: 'att-3',
    name: 'ID_Verification.jpg',
    type: 'image/jpeg',
    size: 987654,
    url: "https://img.rocket.new/generatedImages/rocket_gen_img_19b2d7318-1764677848090.png",
    alt: 'Government issued identification card with photo and personal information for verification purposes',
    uploadedBy: 'Sarah Johnson',
    uploadedAt: '2026-01-03T14:20:00'
  }]
  );

  const [comments, setComments] = useState([
  {
    id: 'cmt-1',
    userName: 'Michael Chen',
    userAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1f07c5c46-1763295267585.png",
    userAvatarAlt: 'Professional headshot of Asian man with short black hair wearing navy blue business suit',
    content: 'Welcome to the team, Sarah! I have reviewed your onboarding documents and everything looks good. Please schedule a meeting with me for your first day orientation.',
    timestamp: '2026-01-03T10:30:00',
    mentions: ['Sarah Johnson'],
    replies: [
    {
      id: 'cmt-1-reply-1',
      userName: 'Sarah Johnson',
      userAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_19817b9e0-1763298122270.png",
      userAvatarAlt: 'Professional headshot of Caucasian woman with long brown hair wearing white blouse',
      content: 'Thank you, Michael! I am excited to join the team. I will send you a calendar invite for Monday morning.',
      timestamp: '2026-01-03T11:15:00',
      mentions: ['Michael Chen'],
      replies: []
    }]

  },
  {
    id: 'cmt-2',
    userName: 'HR Department',
    userAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_112d8df36-1763294293057.png",
    userAvatarAlt: 'Professional headshot of African American woman with short curly hair wearing burgundy blazer',
    content: 'All background verification checks have been completed successfully. Equipment order has been placed and will be delivered to the San Francisco office by January 10th.',
    timestamp: '2026-01-04T09:00:00',
    mentions: [],
    replies: []
  }]
  );

  const [activities, setActivities] = useState([
  {
    id: 'act-1',
    type: 'created',
    userName: 'Michael Chen',
    action: 'created this record',
    description: 'Initiated employee onboarding process for Sarah Johnson',
    timestamp: '2026-01-02T10:30:00',
    changes: [],
    metadata: { module: 'HR', subModule: 'Onboarding' }
  },
  {
    id: 'act-2',
    type: 'attachment_added',
    userName: 'Michael Chen',
    action: 'uploaded a file',
    description: 'Added employment contract document',
    timestamp: '2026-01-02T11:15:00',
    changes: [],
    metadata: { fileName: 'Employment_Contract_Sarah_Johnson.pdf', fileSize: '2.4 MB' }
  },
  {
    id: 'act-3',
    type: 'field_changed',
    userName: 'HR Department',
    action: 'updated record fields',
    description: 'Modified employee information',
    timestamp: '2026-01-03T08:45:00',
    changes: [
    { field: 'Start Date', oldValue: '2026-01-10', newValue: '2026-01-15' },
    { field: 'Salary', oldValue: '$120,000', newValue: '$125,000' }],

    metadata: {}
  },
  {
    id: 'act-4',
    type: 'commented',
    userName: 'Michael Chen',
    action: 'added a comment',
    description: 'Posted welcome message and orientation details',
    timestamp: '2026-01-03T10:30:00',
    changes: [],
    metadata: { mentions: 1 }
  },
  {
    id: 'act-5',
    type: 'status_changed',
    userName: 'System',
    action: 'changed status',
    description: 'Background verification completed',
    timestamp: '2026-01-04T09:00:00',
    changes: [
    { field: 'Verification Status', oldValue: 'Pending', newValue: 'Completed' }],

    metadata: { automated: true }
  }]
  );

  const [relatedRecords, setRelatedRecords] = useState([
  {
    id: 'rel-1',
    module: 'hr',
    recordId: 'EQP-2026-789',
    title: 'Equipment Request - Sarah Johnson',
    description: 'MacBook Pro 16", External Monitor, Keyboard, Mouse, and Headphones for new employee setup',
    status: 'pending',
    createdAt: '2026-01-03T14:00:00',
    owner: 'IT Department',
    relationType: 'Equipment Request'
  },
  {
    id: 'rel-2',
    module: 'hr',
    recordId: 'TRN-2026-456',
    title: 'Training Schedule - Engineering Onboarding',
    description: 'Two-week comprehensive training program covering company systems, development workflows, and team introductions',
    status: 'active',
    createdAt: '2026-01-02T16:30:00',
    owner: 'Training Team',
    relationType: 'Training Program'
  },
  {
    id: 'rel-3',
    module: 'crm',
    recordId: 'ACC-2026-123',
    title: 'System Access Request',
    description: 'GitHub, Jira, Confluence, Slack, and internal development tools access provisioning',
    status: 'completed',
    createdAt: '2026-01-03T11:00:00',
    owner: 'IT Security',
    relationType: 'Access Request'
  }]
  );

  const tabs = [
  { id: 'attachments', label: 'Attachments', icon: 'Paperclip', count: attachments?.length },
  { id: 'comments', label: 'Comments', icon: 'MessageSquare', count: comments?.length },
  { id: 'activity', label: 'Activity', icon: 'Activity', count: activities?.length },
  { id: 'related', label: 'Related Records', icon: 'Link', count: relatedRecords?.length }];


  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    const newActivity = {
      id: `act-${activities?.length + 1}`,
      type: 'updated',
      userName: 'Current User',
      action: 'updated record',
      description: 'Modified record information',
      timestamp: new Date()?.toISOString(),
      changes: [
      { field: 'Employee Name', oldValue: recordData?.title, newValue: formData?.employeeName }],

      metadata: {}
    };
    setActivities([newActivity, ...activities]);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleDelete = () => {
    console.log('Delete record:', recordData?.id);
  };

  const handleUploadFiles = (files) => {
    const newAttachments = files?.map((file, index) => ({
      id: `att-${attachments?.length + index + 1}`,
      name: file?.name,
      type: file?.type,
      size: file?.size,
      url: URL.createObjectURL(file),
      alt: `Uploaded document ${file?.name} containing business information and data`,
      uploadedBy: 'Current User',
      uploadedAt: new Date()?.toISOString()
    }));
    setAttachments([...attachments, ...newAttachments]);
  };

  const handleDeleteAttachment = (id) => {
    setAttachments(attachments?.filter((att) => att?.id !== id));
  };

  const handleAddComment = (content) => {
    const newComment = {
      id: `cmt-${comments?.length + 1}`,
      userName: 'Current User',
      userAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_172fcd53a-1763299680950.png",
      userAvatarAlt: 'Professional headshot of business professional with friendly smile wearing formal attire',
      content,
      timestamp: new Date()?.toISOString(),
      mentions: [],
      replies: []
    };
    setComments([...comments, newComment]);
  };

  const handleReplyComment = (commentId, replyText) => {
    const updatedComments = comments?.map((comment) => {
      if (comment?.id === commentId) {
        return {
          ...comment,
          replies: [
          ...comment?.replies,
          {
            id: `${commentId}-reply-${comment?.replies?.length + 1}`,
            userName: 'Current User',
            userAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_172fcd53a-1763299680950.png",
            userAvatarAlt: 'Professional headshot of business professional with friendly smile wearing formal attire',
            content: replyText,
            timestamp: new Date()?.toISOString(),
            mentions: [],
            replies: []
          }]

        };
      }
      return comment;
    });
    setComments(updatedComments);
  };

  const handleDeleteComment = (id) => {
    setComments(comments?.filter((cmt) => cmt?.id !== id));
  };

  const handleAddRelation = () => {
    console.log('Add relation modal');
  };

  const handleRemoveRelation = (id) => {
    setRelatedRecords(relatedRecords?.filter((rec) => rec?.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar isCollapsed={isSidebarCollapsed} />
      <div className={`transition-smooth ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}`}>
        <header className="bg-card border-b border-border px-4 md:px-6 lg:px-8 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex items-center justify-center w-10 h-10 rounded-md hover:bg-muted transition-smooth"
              aria-label="Toggle sidebar">

              <Icon name={isSidebarCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={20} />
            </button>

            <div className="flex-1 min-w-0">
              <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground truncate">
                Record Detail Management
              </h2>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <button className="relative p-2 rounded-md hover:bg-muted transition-smooth">
                <Icon name="Bell" size={20} />
                <NotificationBadge count={3} variant="error" className="absolute -top-1 -right-1" />
              </button>
              <UserProfileDropdown />
            </div>
          </div>
        </header>

        <main className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <ModuleBreadcrumbs />

          <div className="space-y-6">
            <RecordHeader
              record={recordData}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSave={handleSave}
              onCancel={handleCancel}
              isEditing={isEditing} />


            <RecordFormSection
              formData={formData}
              onChange={setFormData}
              isEditing={isEditing}
              fieldDefinitions={fieldDefinitions} />


            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="border-b border-border overflow-x-auto">
                <div className="flex min-w-max">
                  {tabs?.map((tab) =>
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-medium transition-smooth flex-shrink-0 ${
                    activeTab === tab?.id ?
                    'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`
                    }>

                      <Icon name={tab?.icon} size={18} />
                      <span>{tab?.label}</span>
                      {tab?.count > 0 &&
                    <span className={`px-2 py-0.5 rounded-full text-xs caption ${
                    activeTab === tab?.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`
                    }>
                          {tab?.count}
                        </span>
                    }
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 md:p-6 lg:p-8">
                {activeTab === 'attachments' &&
                <AttachmentsTab
                  attachments={attachments}
                  onUpload={handleUploadFiles}
                  onDelete={handleDeleteAttachment} />

                }
                {activeTab === 'comments' &&
                <CommentsTab
                  comments={comments}
                  onAddComment={handleAddComment}
                  onReply={handleReplyComment}
                  onDelete={handleDeleteComment} />

                }
                {activeTab === 'activity' &&
                <ActivityTab activities={activities} />
                }
                {activeTab === 'related' &&
                <RelatedRecordsTab
                  relatedRecords={relatedRecords}
                  onAddRelation={handleAddRelation}
                  onRemoveRelation={handleRemoveRelation} />

                }
              </div>
            </div>
          </div>
        </main>

        <footer className="bg-card border-t border-border px-4 md:px-6 lg:px-8 py-4 mt-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date()?.getFullYear()} TenantFlow SaaS. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-foreground transition-smooth">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-smooth">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-smooth">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>);

};

export default RecordDetailManagement;