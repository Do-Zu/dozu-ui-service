/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
/**
 * Debounce a function to delay execution until after a specified time period.
 *
 * @param func - The function to be debounced.
 * @param delay - The delay time in milliseconds.
 * @returns A debounced version of the provided function.
 */
const debounce = (func: Function, delay: number): Function => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle a function to ensure it is only called once within a specific time period.
 *
 * @param func - The function to be throttled.
 * @param limit - The time period in milliseconds.
 * @returns A throttled version of the provided function.
 */
const throttle = (func: Function, limit: number): Function => {
  let lastCall = 0;
  return (...args: any[]) => {
    const now = new Date().getTime();
    if (now - lastCall >= limit) {
      func(...args);
      lastCall = now;
    }
  };
};

export { debounce, throttle };
