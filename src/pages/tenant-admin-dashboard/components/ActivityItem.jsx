import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ActivityItem = ({ activity }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const actionIcons = {
    created: 'Plus',
    updated: 'Edit',
    deleted: 'Trash2',
    approved: 'CheckCircle',
    rejected: 'XCircle',
    commented: 'MessageSquare',
    uploaded: 'Upload',
  };

  const actionColors = {
    created: 'text-success',
    updated: 'text-primary',
    deleted: 'text-error',
    approved: 'text-success',
    rejected: 'text-error',
    commented: 'text-warning',
    uploaded: 'text-primary',
  };

  const formatTimestamp = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffMs = now - activityDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return activityDate?.toLocaleDateString();
  };

  return (
    <div className="border-b border-border last:border-0 py-3 md:py-4">
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <Image
            src={activity?.userAvatar}
            alt={activity?.userAvatarAlt}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-card border-2 border-card flex items-center justify-center ${actionColors?.[activity?.action]}`}>
            <Icon name={actionIcons?.[activity?.action]} size={12} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm text-foreground">
              <span className="font-medium">{activity?.userName}</span>
              {' '}
              <span className="text-muted-foreground">{activity?.actionText}</span>
              {' '}
              <span className="font-medium">{activity?.target}</span>
            </p>
            <span className="caption text-muted-foreground whitespace-nowrap flex-shrink-0">
              {formatTimestamp(activity?.timestamp)}
            </span>
          </div>

          {activity?.module && (
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-xs text-muted-foreground">
                <Icon name="Database" size={12} />
                {activity?.module}
              </span>
            </div>
          )}

          {activity?.details && (
            <>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-primary hover:text-primary/80 transition-smooth flex items-center gap-1"
              >
                {isExpanded ? 'Hide details' : 'Show details'}
                <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={14} />
              </button>
              
              {isExpanded && (
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">{activity?.details}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;