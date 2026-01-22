import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


const RecordHeader = ({ record, onEdit, onDelete, onSave, onCancel, isEditing }) => {
  const statusColors = {
    active: 'bg-success/10 text-success',
    pending: 'bg-warning/10 text-warning',
    completed: 'bg-primary/10 text-primary',
    archived: 'bg-muted text-muted-foreground'
  };

  return (
    <div className="bg-card border-b border-border px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold text-foreground truncate">
              {record?.title}
            </h1>
            <span className={`px-3 py-1 rounded-md text-xs md:text-sm font-medium caption whitespace-nowrap ${statusColors?.[record?.status]}`}>
              {record?.status?.charAt(0)?.toUpperCase() + record?.status?.slice(1)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Icon name="Hash" size={16} />
              <span className="data-text">{record?.recordId}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Calendar" size={16} />
              <span>Created {new Date(record.createdAt)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="User" size={16} />
              <span>{record?.createdBy}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!isEditing ? (
            <>
              <Button variant="outline" iconName="Edit" iconPosition="left" onClick={onEdit}>
                Edit
              </Button>
              <Button variant="outline" iconName="Share2" iconPosition="left">
                Share
              </Button>
              <Button variant="outline" iconName="Download" iconPosition="left">
                Export
              </Button>
              <Button variant="destructive" iconName="Trash2" iconPosition="left" onClick={onDelete}>
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button variant="default" iconName="Save" iconPosition="left" onClick={onSave}>
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordHeader;