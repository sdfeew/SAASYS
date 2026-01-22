import React from 'react';
import Icon from '../../../components/AppIcon';

const ActivityTab = ({ activities }) => {
  const getActivityIcon = (type) => {
    const icons = {
      created: 'Plus',
      updated: 'Edit',
      status_changed: 'RefreshCw',
      assigned: 'UserPlus',
      commented: 'MessageSquare',
      attachment_added: 'Paperclip',
      attachment_removed: 'Trash2',
      field_changed: 'Edit3'
    };
    return icons?.[type] || 'Activity';
  };

  const getActivityColor = (type) => {
    const colors = {
      created: 'text-success',
      updated: 'text-primary',
      status_changed: 'text-warning',
      assigned: 'text-accent',
      commented: 'text-secondary',
      attachment_added: 'text-primary',
      attachment_removed: 'text-destructive',
      field_changed: 'text-muted-foreground'
    };
    return colors?.[type] || 'text-foreground';
  };

  const formatTimestamp = (date) => {
    const activityDate = new Date(date);
    return activityDate?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base md:text-lg font-medium text-foreground">
          Activity History ({activities?.length})
        </h3>
        <button className="text-sm text-primary hover:underline">
          Export Activity Log
        </button>
      </div>
      {activities?.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <Icon name="Activity" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No activity recorded yet</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-6">
            {activities?.map((activity, index) => (
              <div key={activity?.id} className="relative flex gap-4 md:gap-6">
                <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-card border-2 border-border flex items-center justify-center z-10 ${getActivityColor(activity?.type)}`}>
                  <Icon name={getActivityIcon(activity?.type)} size={16} />
                </div>

                <div className="flex-1 pb-6">
                  <div className="bg-card border border-border rounded-lg p-3 md:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm md:text-base font-medium text-foreground">
                          {activity?.userName}
                        </span>
                        <span className="caption text-muted-foreground">
                          {activity?.action}
                        </span>
                      </div>
                      <span className="caption text-muted-foreground whitespace-nowrap">
                        {formatTimestamp(activity?.timestamp)}
                      </span>
                    </div>

                    <p className="text-sm text-foreground mb-2">
                      {activity?.description}
                    </p>

                    {activity?.changes && activity?.changes?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {activity?.changes?.map((change, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs md:text-sm bg-muted/50 rounded p-2">
                            <span className="font-medium text-foreground min-w-[100px]">
                              {change?.field}:
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-1 bg-destructive/10 text-destructive rounded data-text">
                                {change?.oldValue || '—'}
                              </span>
                              <Icon name="ArrowRight" size={14} className="text-muted-foreground" />
                              <span className="px-2 py-1 bg-success/10 text-success rounded data-text">
                                {change?.newValue}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activity?.metadata && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {Object.entries(activity?.metadata)?.map(([key, value]) => (
                          <span key={key} className="caption text-muted-foreground">
                            {key}: <span className="data-text text-foreground">{value}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityTab;