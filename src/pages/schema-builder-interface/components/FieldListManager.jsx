import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { getLangText } from '../../../utils/languageUtils';

const FieldListManager = ({ fields, onEditField, onDeleteField, onReorderFields, onAddField }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e?.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFields = [...fields];
    const draggedField = newFields?.[draggedIndex];
    newFields?.splice(draggedIndex, 1);
    newFields?.splice(index, 0, draggedField);
    
    onReorderFields(newFields);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getFieldTypeIcon = (type) => {
    const iconMap = {
      text: 'Type',
      textarea: 'AlignLeft',
      number: 'Hash',
      email: 'Mail',
      phone: 'Phone',
      date: 'Calendar',
      datetime: 'Clock',
      currency: 'DollarSign',
      boolean: 'ToggleLeft',
      select: 'ChevronDown',
      multiselect: 'List',
      reference: 'Link',
      file: 'Paperclip'
    };
    return iconMap?.[type] || 'Circle';
  };

  const getFieldTypeBadge = (type) => {
    const colorMap = {
      text: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      number: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      date: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      boolean: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      reference: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
    };
    return colorMap?.[type] || 'bg-muted text-muted-foreground';
  };

  if (fields?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <Icon name="Layers" size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-2">
          No Fields Yet
        </h3>
        <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-md">
          Start building your module by adding custom fields. Each field can have its own validation rules and properties.
        </p>
        <Button variant="default" iconName="Plus" iconPosition="left" onClick={onAddField}>
          Add First Field
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-heading font-semibold text-foreground">
          Fields ({fields?.length})
        </h3>
        <Button variant="outline" size="sm" iconName="Plus" iconPosition="left" onClick={onAddField}>
          Add Field
        </Button>
      </div>
      <div className="space-y-2">
        {fields?.map((field, index) => (
          <div
            key={field?.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`bg-card border border-border rounded-lg p-4 transition-smooth hover:shadow-elevation-2 cursor-move ${
              draggedIndex === index ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <Icon name="GripVertical" size={20} className="text-muted-foreground" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Icon name={getFieldTypeIcon(field?.type)} size={16} className="text-primary" />
                    <h4 className="text-sm font-medium text-foreground">{getLangText(field?.label, 'en')}</h4>
                  </div>
                  <span className={`caption px-2 py-0.5 rounded-full ${getFieldTypeBadge(field?.type)}`}>
                    {field?.type}
                  </span>
                </div>

                <p className="caption text-muted-foreground mb-2">
                  Field Name: <span className="data-text">{field?.name}</span>
                </p>

                <div className="flex flex-wrap gap-2">
                  {field?.required && (
                    <span className="caption px-2 py-0.5 bg-error/10 text-error rounded-full">
                      Required
                    </span>
                  )}
                  {field?.unique && (
                    <span className="caption px-2 py-0.5 bg-warning/10 text-warning rounded-full">
                      Unique
                    </span>
                  )}
                  {field?.validation && Object.keys(field?.validation)?.length > 0 && (
                    <span className="caption px-2 py-0.5 bg-success/10 text-success rounded-full">
                      {Object.keys(field?.validation)?.length} Validation Rules
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="Edit"
                  onClick={() => onEditField(field)}
                  aria-label="Edit field"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="Trash2"
                  onClick={() => onDeleteField(field?.id)}
                  aria-label="Delete field"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FieldListManager;