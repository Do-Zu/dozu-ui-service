import { useRef } from 'react';

/**
 * Custom hook to store the previous value of a state or prop.
 * Useful for tracking changes over time in React components.
 * @param {T} value - The current value to track.
 * @returns {T | undefined} - The previous value, or `undefined` if there is no previous value.
 */
export default function usePrevious<T>(value: T): T | undefined {
  const currentRef = useRef<T>(value);
  const previousRef = useRef<T | undefined>();

  if (currentRef.current !== value) {
    previousRef.current = currentRef.current;
    currentRef.current = value;
  }

  return previousRef.current;
}
