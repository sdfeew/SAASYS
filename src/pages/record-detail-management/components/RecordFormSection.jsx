import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import { getLangText } from '../../../utils/languageUtils';

const RecordFormSection = ({ formData, onChange, isEditing, fieldDefinitions }) => {
  const handleInputChange = (fieldName, value) => {
    onChange({ ...formData, [fieldName]: value });
  };

  const renderField = (field) => {
    const value = formData?.[field?.name] || '';
    const displayLabel = getLangText(field?.label, 'en');
    const displayPlaceholder = getLangText(field?.placeholder, 'en');
    const displayDescription = getLangText(field?.description, 'en');
    const displayOptions = typeof field?.options === 'object' ? getLangText(field?.options, 'en') : field?.options;

    if (!isEditing) {
      return (
        <div key={field?.name} className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">{displayLabel}</label>
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
            label={displayLabel}
            type={field?.type}
            value={value}
            onChange={(e) => handleInputChange(field?.name, e?.target?.value)}
            placeholder={displayPlaceholder}
            required={field?.required}
            description={displayDescription}
          />
        );

      case 'number': case'currency':
        return (
          <Input
            key={field?.name}
            label={displayLabel}
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field?.name, e?.target?.value)}
            placeholder={displayPlaceholder}
            required={field?.required}
            description={displayDescription}
          />
        );

      case 'date': case'datetime':
        return (
          <Input
            key={field?.name}
            label={displayLabel}
            type={field?.type === 'datetime' ? 'datetime-local' : 'date'}
            value={value}
            onChange={(e) => handleInputChange(field?.name, e?.target?.value)}
            required={field?.required}
            description={displayDescription}
          />
        );

      case 'select':
        return (
          <Select
            key={field?.name}
            label={displayLabel}
            options={displayOptions}
            value={value}
            onChange={(val) => handleInputChange(field?.name, val)}
            required={field?.required}
            description={displayDescription}
          />
        );

      case 'boolean':
        return (
          <Checkbox
            key={field?.name}
            label={displayLabel}
            checked={value}
            onChange={(e) => handleInputChange(field?.name, e?.target?.checked)}
            description={displayDescription}
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