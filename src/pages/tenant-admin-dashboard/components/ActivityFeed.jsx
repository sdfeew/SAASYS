import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import ActivityItem from './ActivityItem';

const ActivityFeed = ({ activities }) => {
  const [filter, setFilter] = useState('all');

  const filterOptions = [
    { value: 'all', label: 'All Activity', icon: 'Activity' },
    { value: 'created', label: 'Created', icon: 'Plus' },
    { value: 'updated', label: 'Updated', icon: 'Edit' },
    { value: 'deleted', label: 'Deleted', icon: 'Trash2' },
  ];

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities?.filter(activity => activity?.action === filter);

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
            Recent Activity
          </h3>
          <span className="caption text-muted-foreground">
            {filteredActivities?.length} items
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-custom">
          {filterOptions?.map((option) => (
            <button
              key={option?.value}
              onClick={() => setFilter(option?.value)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-smooth flex-shrink-0 ${
                filter === option?.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Icon name={option?.icon} size={14} />
              {option?.label}
            </button>
          ))}
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto scrollbar-custom">
        {filteredActivities?.length > 0 ? (
          <div className="px-4 md:px-6">
            {filteredActivities?.map((activity) => (
              <ActivityItem key={activity?.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Icon name="Inbox" size={48} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No activities found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;