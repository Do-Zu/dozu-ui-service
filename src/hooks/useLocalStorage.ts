import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = T | ((val: T | undefined) => T);

interface UseLocalStorageOptions {
  serialize?: (value: any) => string;
  deserialize?: (value: string) => any;
  syncAcrossTabs?: boolean;
}

/**
 * A hook that manages localStorage with React state synchronization
 * @param key - The localStorage key
 * @param initialValue - Default value if nothing is stored
 * @param options - Configuration options
 * @returns [storedValue, setValue, removeValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue?: T,
  options: UseLocalStorageOptions = {},
): [T | undefined, (value: SetValue<T>) => void, () => void] {
  const { serialize = JSON.stringify, deserialize = JSON.parse, syncAcrossTabs = true } = options;

  // Get initial value from localStorage
  const [storedValue, setStoredValue] = useState<T | undefined>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      return deserialize(item);
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          if (valueToStore === undefined) {
            window.localStorage.removeItem(key);
          } else {
            window.localStorage.setItem(key, serialize(valueToStore));
          }
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, serialize, storedValue],
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(undefined);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key]);

  // Listen for localStorage changes in other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined' || !syncAcrossTabs) {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.storageArea === window.localStorage) {
        try {
          if (e.newValue === null) {
            setStoredValue(undefined);
          } else {
            setStoredValue(deserialize(e.newValue));
          }
        } catch (error) {
          console.warn(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserialize, syncAcrossTabs]);

  return [storedValue, setValue, removeValue];
}
