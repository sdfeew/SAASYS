import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const QuickActionCard = ({ title, description, icon, path, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary hover:bg-primary/20',
    success: 'bg-success/10 text-success hover:bg-success/20',
    warning: 'bg-warning/10 text-warning hover:bg-warning/20',
    error: 'bg-error/10 text-error hover:bg-error/20',
  };

  return (
    <Link
      to={path}
      className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1 hover:shadow-elevation-2 transition-smooth group"
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center transition-smooth ${colorClasses?.[color]}`}>
          <Icon name={icon} size={24} className="md:w-7 md:h-7" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base md:text-lg font-heading font-semibold text-foreground mb-1 group-hover:text-primary transition-smooth">
            {title}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>
        <Icon 
          name="ChevronRight" 
          size={20} 
          className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-smooth flex-shrink-0"
        />
      </div>
    </Link>
  );
};

export default QuickActionCard;