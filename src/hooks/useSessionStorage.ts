import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = T | ((val: T | undefined) => T);

interface UseSessionStorageOptions {
  serialize?: (value: any) => string;
  deserialize?: (value: string) => any;
}

/**
 * A hook that manages sessionStorage with React state synchronization
 * @param key - The sessionStorage key
 * @param initialValue - Default value if nothing is stored
 * @param options - Serialization options
 * @returns [storedValue, setValue, removeValue]
 */
export function useSessionStorage<T>(
  key: string,
  initialValue?: T,
  options: UseSessionStorageOptions = {},
): [T | undefined, (value: SetValue<T>) => void, () => void] {
  const { serialize = JSON.stringify, deserialize = JSON.parse } = options;

  // Get initial value from sessionStorage
  const [storedValue, setStoredValue] = useState<T | undefined>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      return deserialize(item);
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update sessionStorage when state changes
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          if (valueToStore === undefined) {
            window.sessionStorage.removeItem(key);
          } else {
            window.sessionStorage.setItem(key, serialize(valueToStore));
          }
        }
      } catch (error) {
        console.warn(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, serialize, storedValue],
  );

  // Remove value from sessionStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(undefined);
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key]);

  // Listen for sessionStorage changes in other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.storageArea === window.sessionStorage) {
        try {
          if (e.newValue === null) {
            setStoredValue(undefined);
          } else {
            setStoredValue(deserialize(e.newValue));
          }
        } catch (error) {
          console.warn(`Error parsing sessionStorage value for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserialize]);

  return [storedValue, setValue, removeValue];
}
