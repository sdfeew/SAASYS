import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { getLangText } from '../../../utils/languageUtils';

const AddRecordModal = ({ isOpen, onClose, fields, onSave, isLoading }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const handleChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors = {};
    fields?.forEach(field => {
      if (field?.is_required && !formData[field?.field_name]) {
        newErrors[field?.field_name] = `${getLangText(field?.display_name, 'en')} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSave(formData);
    setFormData({});
    setErrors({});
  };

  if (!isOpen) return null;

  // Helper function to get options string
  const getOptionsString = (options) => {
    if (!options) return '';
    if (typeof options === 'string') return options;
    if (typeof options === 'object' && (options?.ar || options?.en)) {
      return getLangText(options, 'en') || '';
    }
    return String(options) || '';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <h2 className="text-lg font-semibold">Add New Record</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            disabled={isLoading}
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {fields && fields.length > 0 ? (
            fields.map(field => {
              const fieldType = field?.data_type?.toUpperCase();
              const fieldName = field?.field_name;
              const value = formData[fieldName] || '';
              const error = errors[fieldName];

              return (
                <div key={fieldName} className="space-y-2">
                  <label className="text-sm font-medium">
                    {getLangText(field?.display_name, 'en') || fieldName}
                    {field?.is_required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {fieldType === 'TEXTAREA' ? (
                    <textarea
                      value={value}
                      onChange={(e) => handleChange(fieldName, e.target.value)}
                      placeholder={getLangText(field?.display_name, 'en')}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      rows="4"
                    />
                  ) : fieldType === 'DATE' ? (
                    <input
                      type="date"
                      value={value}
                      onChange={(e) => handleChange(fieldName, e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : fieldType === 'NUMBER' ? (
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => handleChange(fieldName, e.target.value)}
                      placeholder={getLangText(field?.display_name, 'en')}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : fieldType === 'BOOLEAN' ? (
                    <select
                      value={value}
                      onChange={(e) => handleChange(fieldName, e.target.value === 'true')}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select...</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  ) : fieldType === 'SELECT' ? (
                    <select
                      value={value}
                      onChange={(e) => handleChange(fieldName, e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select...</option>
                      {getOptionsString(field?.options)?.split(',')?.map(opt => (
                        <option key={opt?.trim()} value={opt?.trim()}>
                          {opt?.trim()}
                        </option>
                      ))}
                    </select>
                  ) : fieldType === 'MULTISELECT' ? (
                    <select
                      multiple
                      value={Array.isArray(value) ? value : []}
                      onChange={(e) => handleChange(fieldName, Array.from(e.target.selectedOptions, option => option.value))}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {getOptionsString(field?.options)?.split(',')?.map(opt => (
                        <option key={opt?.trim()} value={opt?.trim()}>
                          {opt?.trim()}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={fieldType === 'EMAIL' ? 'email' : fieldType === 'PHONE' ? 'tel' : 'text'}
                      value={value}
                      onChange={(e) => handleChange(fieldName, e.target.value)}
                      placeholder={getLangText(field?.display_name, 'en')}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  )}

                  {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
              );
            })
          ) : (
            <p className="text-muted-foreground">No fields available for this module</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !fields || fields.length === 0}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <Icon name="Loader2" size={16} className="animate-spin" />}
              {isLoading ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecordModal;
