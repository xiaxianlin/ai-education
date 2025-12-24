import { useCallback, useState } from "react";
import { ValidationResult } from "../lib/validators";

export function useFormValidation<T extends Record<string, any>>() {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const validate = useCallback(
    (field: keyof T, value: string, validator: (val: string) => ValidationResult): boolean => {
      const result = validator(value);
      if (!result.valid) {
        setErrors((prev) => ({ ...prev, [field]: result.error }));
        return false;
      }
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
      return true;
    },
    []
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearError = useCallback((field: keyof T) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  return { errors, validate, clearErrors, clearError };
}
