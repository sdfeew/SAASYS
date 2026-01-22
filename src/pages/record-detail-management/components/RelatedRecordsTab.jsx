import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RelatedRecordsTab = ({ relatedRecords, onAddRelation, onRemoveRelation }) => {
  const getModuleIcon = (module) => {
    const icons = {
      hr: 'Users',
      crm: 'Briefcase',
      inventory: 'Package',
      logistics: 'Truck',
      supplier: 'Building2'
    };
    return icons?.[module] || 'FileText';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-success/10 text-success',
      pending: 'bg-warning/10 text-warning',
      completed: 'bg-primary/10 text-primary',
      archived: 'bg-muted text-muted-foreground'
    };
    return colors?.[status] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-base md:text-lg font-medium text-foreground">
          Related Records ({relatedRecords?.length})
        </h3>
        <Button variant="outline" iconName="Link" iconPosition="left" onClick={onAddRelation}>
          Add Relation
        </Button>
      </div>
      {relatedRecords?.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <Icon name="Link" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No related records found</p>
          <Button variant="outline" iconName="Plus" iconPosition="left" onClick={onAddRelation}>
            Add First Relation
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:gap-4">
          {relatedRecords?.map((record) => (
            <div
              key={record?.id}
              className="bg-card border border-border rounded-lg p-4 md:p-5 hover:shadow-elevation-2 transition-smooth"
            >
              <div className="flex items-start gap-3 md:gap-4">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon name={getModuleIcon(record?.module)} size={20} className="text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/record-detail-management?id=${record?.id}`}
                        className="text-base md:text-lg font-medium text-foreground hover:text-primary transition-smooth truncate block"
                      >
                        {record?.title}
                      </Link>
                      <p className="caption text-muted-foreground mt-1">
                        {record?.module?.toUpperCase()} • {record?.recordId}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium caption whitespace-nowrap ${getStatusColor(record?.status)}`}>
                      {record?.status?.charAt(0)?.toUpperCase() + record?.status?.slice(1)}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {record?.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Icon name="Calendar" size={14} />
                      <span>{new Date(record.createdAt)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="User" size={14} />
                      <span>{record?.owner}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="Link2" size={14} />
                      <span>{record?.relationType}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 flex items-center gap-1">
                  <Link to={`/record-detail-management?id=${record?.id}`}>
                    <Button variant="ghost" size="icon" iconName="ExternalLink" />
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    iconName="Trash2"
                    onClick={() => onRemoveRelation(record?.id)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RelatedRecordsTab;