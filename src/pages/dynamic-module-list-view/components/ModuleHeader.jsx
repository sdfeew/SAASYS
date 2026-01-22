import React from 'react';

import Button from '../../../components/ui/Button';
import NotificationBadge from '../../../components/ui/NotificationBadge';

const ModuleHeader = ({ 
  moduleName, 
  recordCount, 
  onAddRecord, 
  onRefresh,
  lastUpdated 
}) => {
  return (
    <div className="bg-card border-b border-border px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold text-foreground truncate">
              {moduleName}
            </h1>
            <NotificationBadge count={recordCount} variant="default" />
          </div>
          <p className="caption text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="outline"
            size="default"
            iconName="RefreshCw"
            iconPosition="left"
            onClick={onRefresh}
            className="flex-shrink-0"
          >
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          
          <Button
            variant="default"
            size="default"
            iconName="Plus"
            iconPosition="left"
            onClick={onAddRecord}
            className="flex-shrink-0"
          >
            Add Record
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModuleHeader;