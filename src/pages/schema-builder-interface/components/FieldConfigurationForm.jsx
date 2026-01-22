import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const FieldConfigurationForm = ({ field, onSave, onCancel }) => {
  const [formData, setFormData] = useState(field || {
    name: '',
    label: '',
    type: 'text',
    required: false,
    unique: false,
    defaultValue: '',
    placeholder: '',
    helpText: '',
    validation: {}
  });

  const [validationRules, setValidationRules] = useState({
    minLength: '',
    maxLength: '',
    min: '',
    max: '',
    pattern: '',
    customRule: ''
  });

  const fieldTypeOptions = [
    { value: 'text', label: 'Text', description: 'Single line text input' },
    { value: 'textarea', label: 'Text Area', description: 'Multi-line text input' },
    { value: 'number', label: 'Number', description: 'Numeric values' },
    { value: 'email', label: 'Email', description: 'Email address' },
    { value: 'phone', label: 'Phone', description: 'Phone number' },
    { value: 'date', label: 'Date', description: 'Date picker' },
    { value: 'datetime', label: 'Date & Time', description: 'Date and time picker' },
    { value: 'currency', label: 'Currency', description: 'Monetary values' },
    { value: 'boolean', label: 'Boolean', description: 'True/False checkbox' },
    { value: 'select', label: 'Select', description: 'Dropdown selection' },
    { value: 'multiselect', label: 'Multi-Select', description: 'Multiple selections' },
    { value: 'reference', label: 'Reference', description: 'Link to another module' },
    { value: 'file', label: 'File Upload', description: 'File attachment' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleValidationChange = (rule, value) => {
    setValidationRules(prev => ({ ...prev, [rule]: value }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const fieldData = {
      ...formData,
      validation: Object.fromEntries(
        Object.entries(validationRules)?.filter(([_, value]) => value !== '')
      )
    };
    onSave(fieldData);
  };

  const renderValidationRules = () => {
    switch (formData?.type) {
      case 'text': case'textarea':
        return (
          <>
            <Input
              label="Minimum Length"
              type="number"
              placeholder="e.g., 3"
              value={validationRules?.minLength}
              onChange={(e) => handleValidationChange('minLength', e?.target?.value)}
              className="mb-4"
            />
            <Input
              label="Maximum Length"
              type="number"
              placeholder="e.g., 100"
              value={validationRules?.maxLength}
              onChange={(e) => handleValidationChange('maxLength', e?.target?.value)}
              className="mb-4"
            />
            <Input
              label="Pattern (Regex)"
              type="text"
              placeholder="e.g., ^[A-Za-z]+$"
              value={validationRules?.pattern}
              onChange={(e) => handleValidationChange('pattern', e?.target?.value)}
              description="Regular expression for validation"
            />
          </>
        );
      case 'number': case'currency':
        return (
          <>
            <Input
              label="Minimum Value"
              type="number"
              placeholder="e.g., 0"
              value={validationRules?.min}
              onChange={(e) => handleValidationChange('min', e?.target?.value)}
              className="mb-4"
            />
            <Input
              label="Maximum Value"
              type="number"
              placeholder="e.g., 1000"
              value={validationRules?.max}
              onChange={(e) => handleValidationChange('max', e?.target?.value)}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Input
          label="Field Name"
          type="text"
          placeholder="e.g., employee_id"
          value={formData?.name}
          onChange={(e) => handleInputChange('name', e?.target?.value)}
          description="Internal field identifier (no spaces)"
          required
        />
        <Input
          label="Display Label"
          type="text"
          placeholder="e.g., Employee ID"
          value={formData?.label}
          onChange={(e) => handleInputChange('label', e?.target?.value)}
          description="Label shown to users"
          required
        />
      </div>
      <Select
        label="Field Type"
        options={fieldTypeOptions}
        value={formData?.type}
        onChange={(value) => handleInputChange('type', value)}
        description="Choose the type of data this field will store"
        required
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Input
          label="Placeholder Text"
          type="text"
          placeholder="e.g., Enter employee ID"
          value={formData?.placeholder}
          onChange={(e) => handleInputChange('placeholder', e?.target?.value)}
          description="Hint text shown in empty field"
        />
        <Input
          label="Default Value"
          type="text"
          placeholder="Optional default value"
          value={formData?.defaultValue}
          onChange={(e) => handleInputChange('defaultValue', e?.target?.value)}
          description="Pre-filled value for new records"
        />
      </div>
      <Input
        label="Help Text"
        type="text"
        placeholder="Additional guidance for users"
        value={formData?.helpText}
        onChange={(e) => handleInputChange('helpText', e?.target?.value)}
        description="Descriptive text shown below the field"
      />
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <Checkbox
          label="Required Field"
          description="Users must provide a value"
          checked={formData?.required}
          onChange={(e) => handleInputChange('required', e?.target?.checked)}
        />
        <Checkbox
          label="Unique Value"
          description="No duplicate values allowed"
          checked={formData?.unique}
          onChange={(e) => handleInputChange('unique', e?.target?.checked)}
        />
      </div>
      <div className="border-t border-border pt-6">
        <h3 className="text-base font-heading font-semibold text-foreground mb-4">
          Validation Rules
        </h3>
        {renderValidationRules()}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
        <Button type="submit" variant="default" iconName="Save" iconPosition="left">
          Save Field
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default FieldConfigurationForm;