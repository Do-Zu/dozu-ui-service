/**
 * Creates a deep clone of an object.
 *
 * @param obj - The object to be cloned.
 * @returns A new object that is a deep clone of the original.
 */
const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Converts a string to title case.
 *
 * @param str - The string to be converted to title case.
 * @returns The string in title case format.
 */
const toTitleCase = (str: string): string => {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Generates a unique identifier (UUID).
 *
 * @returns A string representing the unique identifier.
 */
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Checks if an object is empty (has no own properties).
 *
 * @param obj - The object to be checked.
 * @returns True if the object is empty, false otherwise.
 */
const isEmpty = (obj: object): boolean => {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * Checks if a value is an string and not empty.
 *
 * @param value - The value to be checked.
 * @returns True if the value is an string, false otherwise.
 */
const isNullOrEmpty = (str: string | null | undefined): boolean => {
  if (!str) return false;
  return str.length > 0;
};

/**
 * Merges two objects. Properties from the second object override the first.
 *
 * @param obj1 - The first object.
 * @param obj2 - The second object.
 * @returns A new object that is the result of merging obj1 and obj2.
 */
const mergeObjects = <T, U>(obj1: T, obj2: U): T & U => {
  return { ...obj1, ...obj2 };
};

/**
 * Retrieves the value of a nested property by its path in the object.
 *
 * @param obj - The object to search.
 * @param path - The path of the property as a string (e.g., "a.b.c").
 * @returns The value of the property or undefined if not found.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getPropertyPath = (obj: any, path: string): any => {
  return path
    .split('.')
    .reduce(
      (acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
      obj,
    );
};

/**
 * Pauses execution for a specified time.
 *
 * @param ms - The number of milliseconds to wait.
 * @returns A promise that resolves after the specified time.
 */
const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export {
  deepClone,
  toTitleCase,
  generateUUID,
  isEmpty,
  mergeObjects,
  isNullOrEmpty,
  getPropertyPath,
  wait,
};
