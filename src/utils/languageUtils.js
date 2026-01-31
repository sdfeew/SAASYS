/**
 * Utility functions to handle multilingual JSONB fields
 * Extracts text from {ar, en} format objects
 */

/**
 * Extract text from multilingual JSONB field
 * @param {string|object} field - The field value (could be string or {ar, en} object)
 * @param {string} lang - Language code ('en' or 'ar'), defaults to 'en'
 * @returns {string} The extracted text or empty string
 */
export const getLangText = (field, lang = 'en') => {
  if (!field) return '';
  
  // If it's a string, return it directly
  if (typeof field === 'string') {
    return field;
  }
  
  // If it's an object, extract the language text
  if (typeof field === 'object') {
    return field[lang] || field['en'] || '';
  }
  
  return '';
};

/**
 * Get text in user's preferred language
 * Fallback to English if preferred language not available
 */
export const getLocalizedText = (field, userLanguage = 'en') => {
  return getLangText(field, userLanguage);
};

/**
 * Convert array of records with JSONB fields to display-ready format
 * @param {array} records - Array of database records
 * @param {string} lang - Language code
 * @returns {array} Records with converted text fields
 */
export const convertRecordsForDisplay = (records, lang = 'en') => {
  if (!Array.isArray(records)) return [];
  
  return records.map(record => ({
    ...record,
    // Convert common multilingual fields
    name: getLangText(record.name, lang),
    label: getLangText(record.label, lang),
    description: getLangText(record.description, lang),
    title: getLangText(record.title, lang),
  }));
};

/**
 * Safe render function - handles both strings and JSONB objects
 * Use this in components when rendering text
 * @param {*} value - The value to render
 * @param {string} lang - Language code
 * @returns {string} Safe string to render
 */
export const safeRender = (value, lang = 'en') => {
  if (!value) return '';
  
  // Handle JSONB multilingual fields
  if (typeof value === 'object') {
    return getLangText(value, lang);
  }
  
  // Handle strings
  if (typeof value === 'string') {
    return value;
  }
  
  // Fallback
  return String(value);
};
