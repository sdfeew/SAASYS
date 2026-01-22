import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const RecordFormSection = ({ formData, onChange, isEditing, fieldDefinitions }) => {
  const handleInputChange = (fieldName, value) => {
    onChange({ ...formData, [fieldName]: value });
  };

  const renderField = (field) => {
    const value = formData?.[field?.name] || '';

    if (!isEditing) {
      return (
        <div key={field?.name} className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">{field?.label}</label>
          <div className="text-base text-foreground">
            {field?.type === 'currency' && '$'}
            {field?.type === 'boolean' ? (value ? 'Yes' : 'No') : value || '—'}
            {field?.type === 'currency' && value && '.00'}
          </div>
        </div>
      );
    }

    switch (field?.type) {
      case 'text': case'email': case'url':
        return (
          <Input
            key={field?.name}
            label={field?.label}
            type={field?.type}
            value={value}
            onChange={(e) => handleInputChange(field?.name, e?.target?.value)}
            placeholder={field?.placeholder}
            required={field?.required}
            description={field?.description}
          />
        );

      case 'number': case'currency':
        return (
          <Input
            key={field?.name}
            label={field?.label}
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field?.name, e?.target?.value)}
            placeholder={field?.placeholder}
            required={field?.required}
            description={field?.description}
          />
        );

      case 'date': case'datetime':
        return (
          <Input
            key={field?.name}
            label={field?.label}
            type={field?.type === 'datetime' ? 'datetime-local' : 'date'}
            value={value}
            onChange={(e) => handleInputChange(field?.name, e?.target?.value)}
            required={field?.required}
            description={field?.description}
          />
        );

      case 'select':
        return (
          <Select
            key={field?.name}
            label={field?.label}
            options={field?.options}
            value={value}
            onChange={(val) => handleInputChange(field?.name, val)}
            required={field?.required}
            description={field?.description}
          />
        );

      case 'boolean':
        return (
          <Checkbox
            key={field?.name}
            label={field?.label}
            checked={value}
            onChange={(e) => handleInputChange(field?.name, e?.target?.checked)}
            description={field?.description}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
      <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-4 md:mb-6">
        Record Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {fieldDefinitions?.map(renderField)}
      </div>
    </div>
  );
};

export default RecordFormSection;