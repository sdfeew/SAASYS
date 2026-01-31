/**
 * FormulaEngine.js - Evaluates calculated field formulas
 * Supports: arithmetic operations, field references, aggregations
 */

/**
 * Parse and evaluate a formula string
 * @param {string} formula - Formula like "{{price}} * {{quantity}}"
 * @param {Object} record - Record object with field values
 * @param {Array} allRecords - All records in the module (for aggregations)
 * @returns {number|string|null} - Calculated result or null if invalid
 */
export const evaluateFormula = (formula, record = {}, allRecords = []) => {
  try {
    if (!formula || typeof formula !== 'string') return null;

    let evaluableFormula = formula;

    // Replace field references {{fieldName}} with actual values
    const fieldReferences = formula.match(/\{\{([^}]+)\}\}/g) || [];
    
    for (const ref of fieldReferences) {
      const fieldName = ref.replace(/[\{\}]/g, '').trim();
      const value = getFieldValue(record, fieldName);
      
      // Wrap strings in quotes for proper evaluation
      const safeValue = typeof value === 'string' ? `"${value}"` : value ?? 'null';
      evaluableFormula = evaluableFormula.replace(ref, safeValue);
    }

    // Replace aggregation functions
    evaluableFormula = replaceAggregations(evaluableFormula, record, allRecords);

    // Safely evaluate the formula
    const result = safeEval(evaluableFormula);
    
    // Return null if result is NaN or undefined
    return isNaN(result) ? null : result;
  } catch (error) {
    console.error('Formula evaluation error:', error);
    return null;
  }
};

/**
 * Get field value from record, handling nested and JSONB fields
 */
const getFieldValue = (record, fieldName) => {
  if (!record || !fieldName) return null;

  // Handle nested paths (e.g., "user.name")
  const parts = fieldName.split('.');
  let value = record;

  for (const part of parts) {
    if (value === null || value === undefined) return null;
    value = value[part];
  }

  // If value is JSONB object with en/ar, extract the en version
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value.en || value.ar || null;
  }

  return value;
};

/**
 * Replace aggregation functions like SUM(), AVG(), COUNT()
 */
const replaceAggregations = (formula, record, allRecords = []) => {
  let result = formula;

  // SUM(fieldName)
  result = result.replace(/SUM\(\{\{([^}]+)\}\}\)/gi, (match, fieldName) => {
    const sum = allRecords.reduce((total, rec) => {
      const val = getFieldValue(rec, fieldName.trim());
      return total + (parseFloat(val) || 0);
    }, 0);
    return sum;
  });

  // AVG(fieldName)
  result = result.replace(/AVG\(\{\{([^}]+)\}\}\)/gi, (match, fieldName) => {
    const values = allRecords
      .map(rec => parseFloat(getFieldValue(rec, fieldName.trim())) || 0)
      .filter(v => v !== 0);
    
    const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    return avg;
  });

  // COUNT(fieldName)
  result = result.replace(/COUNT\(\{\{([^}]+)\}\}\)/gi, (match, fieldName) => {
    const count = allRecords.filter(rec => {
      const val = getFieldValue(rec, fieldName.trim());
      return val !== null && val !== undefined && val !== '';
    }).length;
    return count;
  });

  // MAX(fieldName)
  result = result.replace(/MAX\(\{\{([^}]+)\}\}\)/gi, (match, fieldName) => {
    const values = allRecords
      .map(rec => parseFloat(getFieldValue(rec, fieldName.trim())) || -Infinity)
      .filter(v => v !== -Infinity);
    
    return values.length > 0 ? Math.max(...values) : 0;
  });

  // MIN(fieldName)
  result = result.replace(/MIN\(\{\{([^}]+)\}\}\)/gi, (match, fieldName) => {
    const values = allRecords
      .map(rec => parseFloat(getFieldValue(rec, fieldName.trim())) || Infinity)
      .filter(v => v !== Infinity);
    
    return values.length > 0 ? Math.min(...values) : 0;
  });

  return result;
};

/**
 * Safely evaluate a mathematical expression
 * Only allows numbers, operators, and functions
 */
const safeEval = (expression) => {
  // Whitelist allowed characters: numbers, operators, parentheses, decimals
  const sanitized = expression.replace(/[^\d+\-*/(). ]/g, '');
  
  if (sanitized !== expression) {
    throw new Error('Invalid formula: contains unauthorized characters');
  }

  // Use Function constructor instead of eval for slightly better security
  try {
    // eslint-disable-next-line no-new-func
    return new Function('return (' + sanitized + ')')();
  } catch (error) {
    throw new Error(`Invalid formula expression: ${error.message}`);
  }
};

/**
 * Extract field dependencies from a formula
 * @param {string} formula - Formula string
 * @returns {Array<string>} - Array of field names referenced
 */
export const extractDependencies = (formula) => {
  if (!formula || typeof formula !== 'string') return [];

  const matches = formula.match(/\{\{([^}]+)\}\}/g) || [];
  return matches
    .map(match => match.replace(/[\{\}]/g, '').trim())
    .filter((field, index, self) => self.indexOf(field) === index); // Remove duplicates
};

/**
 * Check if formulas have circular dependencies
 * @param {Array<Object>} fields - Fields with formulas
 * @returns {Object} - { hasCircular: boolean, cycles: Array<Array<string>> }
 */
export const detectCircularDependencies = (fields) => {
  const cycles = [];
  const visited = new Set();
  const recursionStack = new Set();

  const dfs = (fieldName, path = []) => {
    visited.add(fieldName);
    recursionStack.add(fieldName);
    path.push(fieldName);

    const field = fields.find(f => f.name === fieldName);
    if (!field || !field.dependencies) {
      recursionStack.delete(fieldName);
      return;
    }

    for (const depName of field.dependencies) {
      if (!visited.has(depName)) {
        dfs(depName, [...path]);
      } else if (recursionStack.has(depName)) {
        // Found a cycle
        const cycleStart = path.indexOf(depName);
        cycles.push([...path.slice(cycleStart), depName]);
      }
    }

    recursionStack.delete(fieldName);
  };

  fields.forEach(field => {
    if (!visited.has(field.name) && field.is_calculated) {
      dfs(field.name);
    }
  });

  return {
    hasCircular: cycles.length > 0,
    cycles
  };
};

/**
 * Get calculation order for fields to avoid circular dependency issues
 * @param {Array<Object>} fields - Fields with formulas
 * @returns {Array<string>} - Field names in calculation order (dependencies first)
 */
export const getCalculationOrder = (fields) => {
  const order = [];
  const visited = new Set();

  const visit = (fieldName) => {
    if (visited.has(fieldName)) return;
    visited.add(fieldName);

    const field = fields.find(f => f.name === fieldName);
    if (!field) return;

    // Visit dependencies first
    if (field.dependencies && Array.isArray(field.dependencies)) {
      for (const dep of field.dependencies) {
        const depField = fields.find(f => f.name === dep);
        if (depField && depField.is_calculated) {
          visit(dep);
        }
      }
    }

    // Then add this field
    if (field.is_calculated) {
      order.push(fieldName);
    }
  };

  // Start with all calculated fields
  fields.forEach(field => {
    if (field.is_calculated) {
      visit(field.name);
    }
  });

  return order;
};

/**
 * Calculate all calculated fields in a record
 * @param {Object} record - Record object with field values
 * @param {Array<Object>} fields - Field definitions with formulas
 * @param {Array<Object>} allRecords - All records (for aggregations)
 * @returns {Object} - Updated record with calculated values
 */
export const calculateRecordFields = (record, fields, allRecords = []) => {
  const updated = { ...record };
  const calculatedFields = fields.filter(f => f.is_calculated);

  // Check for circular dependencies
  const { hasCircular, cycles } = detectCircularDependencies(calculatedFields);
  if (hasCircular) {
    console.warn('Circular dependencies detected:', cycles);
    return updated;
  }

  // Get correct calculation order
  const order = getCalculationOrder(calculatedFields);

  // Calculate fields in dependency order
  for (const fieldName of order) {
    const field = fields.find(f => f.name === fieldName);
    if (field && field.formula) {
      updated[fieldName] = evaluateFormula(field.formula, updated, allRecords);
    }
  }

  return updated;
};

export default {
  evaluateFormula,
  extractDependencies,
  detectCircularDependencies,
  getCalculationOrder,
  calculateRecordFields
};
