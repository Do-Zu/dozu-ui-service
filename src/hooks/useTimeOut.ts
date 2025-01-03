import { useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook for managing timeouts in React components.
 * Provides methods to set and clear timeouts and ensures the timeout is properly cleaned up.
 * @param {() => void} callback - The function to be executed after the timeout.
 * @param {number} delay - The timeout duration in milliseconds.
 * @returns {{ set: () => void, clear: () => void }} An object containing methods to set and clear the timeout.
 */
export default function useTimeOut(callback: () => void, delay: number) {
  // Ref to store the latest version of the callback function
  const callbackRef = useRef(callback);
  // Ref to store the timeout ID
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  /**
   * Sets a timeout to execute the callback after the specified delay.
   * Uses `useCallback` to memoize the function.
   */
  const set = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      callbackRef?.current();
    }, delay);
  }, [delay]);

  /**
   * Clears the current timeout.
   * Ensures no stale timeout remains active.
   */
  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null; // Reset the timeout ref
    }
  }, []);

  // Automatically set the timeout when the hook is initialized
  useEffect(() => {
    set();
    return clear; // Cleanup timeout when the component unmounts or delay changes
  }, [delay, set, clear]);

  return { set, clear };
}
