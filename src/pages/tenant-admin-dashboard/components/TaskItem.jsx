import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TaskItem = ({ task, onAction }) => {
  const priorityColors = {
    high: 'text-error',
    medium: 'text-warning',
    low: 'text-success',
  };

  const statusIcons = {
    pending: 'Clock',
    'in-progress': 'Loader',
    completed: 'CheckCircle',
  };

  return (
    <div className="border-b border-border last:border-0 py-3 md:py-4">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 ${priorityColors?.[task?.priority]}`}>
          <Icon name={statusIcons?.[task?.status]} size={16} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h5 className="text-sm font-medium text-foreground">{task?.title}</h5>
            <span className={`caption whitespace-nowrap flex-shrink-0 ${priorityColors?.[task?.priority]}`}>
              {task?.priority?.toUpperCase()}
            </span>
          </div>

          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {task?.description}
          </p>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Icon name="Calendar" size={12} />
                {task?.dueDate}
              </span>
              {task?.assignee && (
                <span className="flex items-center gap-1">
                  <Icon name="User" size={12} />
                  {task?.assignee}
                </span>
              )}
            </div>

            {task?.actionable && (
              <Button
                variant="outline"
                size="xs"
                iconName="ExternalLink"
                iconPosition="right"
                onClick={() => onAction(task?.id)}
              >
                Review
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;