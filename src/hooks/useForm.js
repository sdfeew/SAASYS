/**
 * useForm Hook
 * Handles form state, validation, and submission
 */

import { useState, useCallback } from 'react';

export const useForm = (initialValues = {}, onSubmit = null, onValidate = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const validate = useCallback((fieldValues = values) => {
    let newErrors = {};

    if (onValidate) {
      newErrors = onValidate(fieldValues);
    }

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
    return newErrors;
  }, [values, onValidate]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setValues(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Validate on change if field was touched
    if (touched[name]) {
      const newErrors = onValidate ? onValidate({ ...values, [name]: newValue }) : {};
      setErrors(newErrors);
      setIsValid(Object.keys(newErrors).length === 0);
    }
  }, [values, touched, onValidate]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate on blur
    const newErrors = onValidate ? onValidate(values) : {};
    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  }, [values, onValidate]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = validate(values);
    
    if (Object.keys(newErrors).length === 0 && onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsValid(true);
  }, [initialValues]);

  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError,
    setValues
  };
};

export default useForm;
