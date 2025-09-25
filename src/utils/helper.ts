/**
 * Converts various string formats to a number.
 * Supports thousand separators, comma decimals, underscores, currency symbols, and scientific notation.
 * Returns defaultValue (or undefined) when conversion fails or value is not finite.
 *
 * @param value - Input value (string or number).
 * @param defaultValue - Value to return when parsing fails.
 */
const toNumber = (value: unknown, defaultValue: number): number => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : defaultValue;
    if (typeof value !== 'string' || !value.trim()) return defaultValue;

    let s = value.trim().replace(/\u2212/g, '-');

    // Reject if contains alphabet
    if (/[a-zA-Z]/.test(s)) return defaultValue;

    s = s.replace(/[^\d.,+\-eE]/g, '');

    if (s.includes(',') && s.includes('.')) {
        s = s.replace(/,/g, '');
    } else if (s.includes(',') && !s.includes('.')) {
        s = s.replace(/,/g, '.');
    }

    const n = Number(s);
    return Number.isFinite(n) ? n : defaultValue;
};

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
    if (!str) return true;
    return str.length === 0;
};

/**
 * Returns true if the value is undefined, null, or an empty string.
 *
 * @param val - Value to test.
 */
const isNilOrEmpty = (val: unknown): boolean => val === undefined || val === null || val === '';

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
    return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
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

/**
 * Truncates a string to max characters and appends an ellipsis if needed.
 * @param text - Input string.
 * @param max  - Maximum length before truncating (default 24).
 */
const truncate = (text: string, max = 24): string => {
    if (typeof text !== 'string') return '';
    return text.length > max ? text.slice(0, max) + '…' : text;
};

/**
 *  normalizes and tokenizes the input text into an array of clean word tokens.
 *  toLowerCase(): makes matching case-insensitive.
    replace(/[^a-z0-9\s'-]/gi, ' '): replaces any character not a letter a–z, digit, whitespace, apostrophe (') or hyphen (-) with a space (strips punctuation/symbols).
    split(/\s+/): splits on one or more whitespace chars.
    filter(Boolean): removes empty strings (caused by multiple spaces).
 * @param text - Input string.
 * 
 */
const normalize = (text: string | undefined | null): string[] => {
    if (isNullOrEmpty(text) || typeof text !== 'string') return [];
    return text
        .toLocaleLowerCase()
        .replace(/[^a-z0-9\s'-]/gi, ' ')
        .split(/\s+/)
        .filter(Boolean);
};

export {
    deepClone,
    toTitleCase,
    isNilOrEmpty,
    isEmpty,
    mergeObjects,
    isNullOrEmpty,
    getPropertyPath,
    wait,
    truncate,
    normalize,
    toNumber,
};
