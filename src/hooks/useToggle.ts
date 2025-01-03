import { useState } from 'react';

/**
 * Custom hook to toggle a value between different states.
 * @param {boolean | string | number} defaultValue - The initial value of the toggle.
 * @returns {[boolean | string | number, (value: boolean | string | number) => void]}
 * - An array containing the current value and a function to toggle it.
 */
export default function useToggle<T extends boolean | string | number>(
  defaultValue: T,
): [T, (newValue?: T) => void] {
  const [value, setValue] = useState<T>(defaultValue);

  /**
   * Toggles the current value.
   * If `newValue` is provided, it sets the value to `newValue`.
   * If `defaultValue` is a boolean and no `newValue` is provided, it negates the current value.
   */
  const toggleValue = (newValue?: T) => {
    setValue((currentValue) => {
      if (typeof newValue === 'boolean') {
        return newValue as T;
      }
      if (typeof currentValue == 'boolean') {
        return !currentValue as T; // Negate for booleans
      }
      return currentValue;
    });
  };

  return [value, toggleValue];
}
