import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const PreviewPanel = ({ module, fields }) => {
  // Helper function to safely extract name from JSONB or string
  const extractName = (name) => {
    if (!name) return 'Unnamed';
    if (typeof name === 'string') return name;
    if (typeof name === 'object' && name?.en) return name.en;
    if (typeof name === 'object' && name?.ar) return name.ar;
    return 'Unnamed';
  };

  const renderFieldPreview = (field) => {
    const commonProps = {
      label: field?.label,
      placeholder: field?.placeholder,
      description: field?.helpText,
      required: field?.required,
      disabled: true
    };

    switch (field?.type) {
      case 'text': case'email': case'phone':
        return <Input {...commonProps} type={field?.type} className="mb-4" />;
      
      case 'textarea':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              {field?.label}
              {field?.required && <span className="text-error ml-1">*</span>}
            </label>
            <textarea
              placeholder={field?.placeholder}
              disabled
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground resize-none"
              rows="3"
            />
            {field?.helpText && (
              <p className="caption text-muted-foreground mt-1">{field?.helpText}</p>
            )}
          </div>
        );
      
      case 'number': case'currency':
        return <Input {...commonProps} type="number" className="mb-4" />;
      
      case 'date':
        return <Input {...commonProps} type="date" className="mb-4" />;
      
      case 'datetime':
        return <Input {...commonProps} type="datetime-local" className="mb-4" />;
      
      case 'boolean':
        return (
          <Checkbox
            label={field?.label}
            description={field?.helpText}
            disabled
            className="mb-4"
          />
        );
      
      case 'select': case'multiselect':
        return (
          <Select
            {...commonProps}
            options={[
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' }
            ]}
            multiple={field?.type === 'multiselect'}
            className="mb-4"
          />
        );
      
      case 'file':
        return <Input {...commonProps} type="file" className="mb-4" />;
      
      default:
        return <Input {...commonProps} type="text" className="mb-4" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="Eye" size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-heading font-semibold text-foreground">Live Preview</h2>
            <p className="caption text-muted-foreground">See how your form will look</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-custom p-4 md:p-6">
        {module && (
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Icon name={module.icon} size={20} className="text-primary" />
              <h3 className="text-base font-heading font-semibold text-foreground">
                {extractName(module.name)}
              </h3>
            </div>
            <p className="caption text-muted-foreground">{extractName(module.description)}</p>
          </div>
        )}

        {fields?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Icon name="FileQuestion" size={32} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Add fields to see the preview
            </p>
          </div>
        ) : (
          <div className="bg-background border border-border rounded-lg p-4 md:p-6">
            <h4 className="text-base font-heading font-semibold text-foreground mb-6">
              Create New Record
            </h4>
            <form className="space-y-4">
              {fields?.map((field) => (
                <div key={field?.id}>
                  {renderFieldPreview(field)}
                </div>
              ))}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button variant="default" disabled>
                  Save
                </Button>
                <Button variant="outline" disabled>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="Info" size={16} />
          <span className="caption">Preview is read-only</span>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;