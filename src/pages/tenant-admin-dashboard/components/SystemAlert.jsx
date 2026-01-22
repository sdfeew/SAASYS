import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SystemAlert = ({ alert, onDismiss }) => {
  const alertStyles = {
    info: {
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      icon: 'Info',
      iconColor: 'text-primary',
    },
    warning: {
      bg: 'bg-warning/10',
      border: 'border-warning/20',
      icon: 'AlertTriangle',
      iconColor: 'text-warning',
    },
    error: {
      bg: 'bg-error/10',
      border: 'border-error/20',
      icon: 'AlertCircle',
      iconColor: 'text-error',
    },
    success: {
      bg: 'bg-success/10',
      border: 'border-success/20',
      icon: 'CheckCircle',
      iconColor: 'text-success',
    },
  };

  const style = alertStyles?.[alert?.type] || alertStyles?.info;

  return (
    <div className={`${style?.bg} border ${style?.border} rounded-lg p-4 mb-3`}>
      <div className="flex items-start gap-3">
        <Icon name={style?.icon} size={20} className={`${style?.iconColor} flex-shrink-0 mt-0.5`} />
        
        <div className="flex-1 min-w-0">
          <h5 className="text-sm font-medium text-foreground mb-1">{alert?.title}</h5>
          <p className="text-sm text-muted-foreground mb-2">{alert?.message}</p>
          
          {alert?.action && (
            <Button
              variant="outline"
              size="xs"
              iconName="ArrowRight"
              iconPosition="right"
              onClick={alert?.action?.onClick}
            >
              {alert?.action?.label}
            </Button>
          )}
        </div>

        {alert?.dismissible && (
          <button
            onClick={() => onDismiss(alert?.id)}
            className="text-muted-foreground hover:text-foreground transition-smooth flex-shrink-0"
            aria-label="Dismiss alert"
          >
            <Icon name="X" size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SystemAlert;