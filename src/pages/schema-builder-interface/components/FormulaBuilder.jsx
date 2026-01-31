import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { extractDependencies, evaluateFormula } from '../../../utils/FormulaEngine';

/**
 * FormulaBuilder - Interactive UI for building field formulas
 * Helps users create formulas without writing code
 */
const FormulaBuilder = ({ formula = '', fields = [], onFormulaChange, onDependenciesChange }) => {
  const [mode, setMode] = useState('manual'); // 'manual' or 'builder'
  const [manualFormula, setManualFormula] = useState(formula);
  const [selectedField, setSelectedField] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('+');
  const [operandValue, setOperandValue] = useState('');
  const [preview, setPreview] = useState(null);

  const fieldOptions = fields
    .filter(f => !f.is_calculated) // Don't allow formula to reference other calculated fields yet
    .map(f => ({
      value: f.name,
      label: `${f.label || f.name} (${f.type})`
    }));

  const operators = [
    { value: '+', label: 'Add (+)' },
    { value: '-', label: 'Subtract (-)' },
    { value: '*', label: 'Multiply (*)' },
    { value: '/', label: 'Divide (/)' },
  ];

  const aggregations = [
    { value: 'SUM', label: 'SUM - Sum all values' },
    { value: 'AVG', label: 'AVG - Average of values' },
    { value: 'COUNT', label: 'COUNT - Count non-empty values' },
    { value: 'MAX', label: 'MAX - Maximum value' },
    { value: 'MIN', label: 'MIN - Minimum value' },
  ];

  // Update formula when manual text changes
  useEffect(() => {
    if (mode === 'manual') {
      onFormulaChange(manualFormula);
      const deps = extractDependencies(manualFormula);
      onDependenciesChange(deps);
    }
  }, [manualFormula, mode, onFormulaChange, onDependenciesChange]);

  // Generate preview
  useEffect(() => {
    if (manualFormula) {
      try {
        const result = evaluateFormula(manualFormula, {});
        setPreview(result !== null ? `= ${result}` : '(empty)');
      } catch (error) {
        setPreview(`⚠️ Error: ${error.message}`);
      }
    }
  }, [manualFormula]);

  const addFieldReference = (fieldName) => {
    const newFormula = manualFormula + (manualFormula ? ' ' : '') + `{{${fieldName}}}`;
    setManualFormula(newFormula);
  };

  const addOperator = (op) => {
    if (manualFormula && !manualFormula.endsWith(' ')) {
      setManualFormula(manualFormula + ' ' + op + ' ');
    }
  };

  const addAggregation = (agg, fieldName) => {
    const newSegment = `${agg}({{${fieldName}}})`;
    const newFormula = manualFormula + (manualFormula ? ' ' : '') + newSegment;
    setManualFormula(newFormula);
  };

  const addLiteral = () => {
    if (!operandValue) return;
    const newFormula = manualFormula + (manualFormula ? ' ' : '') + operandValue;
    setManualFormula(newFormula);
    setOperandValue('');
  };

  const clearFormula = () => {
    setManualFormula('');
  };

  return (
    <div className="space-y-4 bg-card border border-border rounded-lg p-4">
      <div className="flex gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            mode === 'manual'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          Formula Editor
        </button>
        <button
          type="button"
          onClick={() => setMode('builder')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            mode === 'builder'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          Interactive Builder
        </button>
      </div>

      {mode === 'manual' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Formula
              <span className="text-xs text-muted-foreground ml-1">
                Use {'{{fieldName}}'} for fields
              </span>
            </label>
            <textarea
              value={manualFormula}
              onChange={(e) => setManualFormula(e.target.value)}
              placeholder="e.g., {{price}} * {{quantity}}"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm font-mono"
              rows={3}
            />
            {preview && (
              <div className="mt-2 text-xs text-muted-foreground">
                Preview: {preview}
              </div>
            )}
          </div>

          <div className="bg-muted/30 border border-border rounded p-3 space-y-2">
            <p className="text-xs font-medium text-foreground">Quick Add:</p>
            <div className="flex flex-wrap gap-2">
              <Select
                options={fieldOptions}
                value={selectedField}
                onChange={setSelectedField}
                placeholder="Select field..."
                className="flex-1 min-w-[150px] text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedField) {
                    addFieldReference(selectedField);
                    setSelectedField('');
                  }
                }}
              >
                Add Field
              </Button>
            </div>

            <div className="flex flex-wrap gap-1">
              {operators.map(op => (
                <button
                  key={op.value}
                  type="button"
                  onClick={() => addOperator(op.value)}
                  className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
                  title={op.label}
                >
                  {op.value}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Aggregations:</p>
              <div className="flex flex-wrap gap-1">
                {aggregations.map(agg => (
                  <button
                    key={agg.value}
                    type="button"
                    onClick={() => {
                      if (selectedField) {
                        addAggregation(agg.value, selectedField);
                        setSelectedField('');
                      }
                    }}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={!selectedField}
                    title={agg.label}
                  >
                    {agg.value}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Literal value (e.g., 10)"
                value={operandValue}
                onChange={(e) => setOperandValue(e.target.value)}
                className="flex-1 text-xs py-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLiteral}
              >
                Add
              </Button>
            </div>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={clearFormula}
            >
              Clear Formula
            </Button>
          </div>
        </div>
      )}

      {mode === 'builder' && (
        <div className="space-y-3 bg-muted/20 p-3 rounded border border-border">
          <p className="text-sm text-muted-foreground">
            Use the controls below to build your formula visually.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-2">
                Field 1
              </label>
              <Select
                options={fieldOptions}
                value={selectedField}
                onChange={setSelectedField}
                placeholder="Select first field..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-2">
                Operation
              </label>
              <Select
                options={operators}
                value={selectedOperator}
                onChange={setSelectedOperator}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-2">
                Field 2 or Value
              </label>
              <div className="flex gap-2">
                <Select
                  options={fieldOptions}
                  placeholder="Field..."
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground py-2">or</span>
                <Input
                  type="number"
                  placeholder="Value"
                  value={operandValue}
                  onChange={(e) => setOperandValue(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="default"
            className="w-full"
            onClick={() => {
              if (selectedField && operandValue) {
                const formula = `{{${selectedField}}} ${selectedOperator} ${operandValue}`;
                setManualFormula(formula);
                setMode('manual');
              }
            }}
          >
            Generate Formula
          </Button>
        </div>
      )}

      <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
        <p className="font-medium mb-1">Formula Examples:</p>
        <ul className="space-y-0.5 pl-4 list-disc">
          <li>{'{{price}} * {{quantity}}'} - Multiply two fields</li>
          <li>{'{{salary}} * 0.1'} - Multiply field by constant</li>
          <li>{'{{field1}} + {{field2}} - {{field3}}'} - Multiple operations</li>
          <li>{'SUM({{amount}})'} - Sum aggregation</li>
          <li>{'AVG({{score}})'} - Average aggregation</li>
        </ul>
      </div>
    </div>
  );
};

export default FormulaBuilder;
