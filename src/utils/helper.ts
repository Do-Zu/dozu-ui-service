/**
 * Converts various string formats to a number.
 * Supports thousand separators, comma decimals, underscores, currency symbols, and scientific notation.
 * Returns defaultValue (or undefined) when conversion fails or value is not finite.
 *
 * @param value - Input value (string or number).
 * @param defaultValue - Value to return when parsing fails.
 */
const toNumberNormalize = (value: unknown, defaultValue: number = NaN): number => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : defaultValue;
    if (typeof value !== 'string' || !value.trim()) return defaultValue;

    let s = value.trim().replace(/\u2212/g, '-');

    s = s.replace(/[^\d.,+\-eE]/g, '');

    // Reject if any characters outside digits, decimal separators, signs, or exponent markers remain
    if (/[a-zA-Z]/.test(s)) return defaultValue;

    if (s.includes(',') && s.includes('.')) {
        s = s.replace(/,/g, '');
    } else if (s.includes(',') && !s.includes('.')) {
        s = s.replace(/,/g, '.');
    }

    const n = Number(s);
    return Number.isFinite(n) ? n : defaultValue;
};

/**
 * Safely converts a value to a number.
 * Returns defaultValue if conversion fails or result is not finite.
 *
 * @param value - Any input value.
 * @param defaultValue - Value to return when parsing fails.
 */
const toNumber = (value: unknown, defaultValue: number = NaN): number => {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : defaultValue;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return defaultValue;

        const parsed = Number(trimmed);
        return Number.isFinite(parsed) ? parsed : defaultValue;
    }

    return defaultValue;
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
 *
 * @param value
 * @returns True if list is empty, false otherwise.
 */
const isListEmpty = (value: unknown[]): boolean => {
    return value.length === 0;
};

/**
 *
 * @param obj
 * @returns True if the object is empty, false otherwise.
 */
const isObjectEmpty = (obj: object): boolean => {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * Checks if an object is empty (has no own properties).
 *
 * @param obj - The object to be checked.
 * @returns return empty for unknown type
 */
const isEmpty = (value: unknown): boolean => {
    if (value === null || value === undefined) return true;

    if (typeof value === 'string') return isNullOrEmpty(value);

    if (Array.isArray(value)) return isListEmpty(value);

    if (typeof value === 'object') {
        return isObjectEmpty(value);
    }

    return false;
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

/**
 * Utility function for safe destructuring without React hooks.
 * Can be used in any TypeScript/JavaScript context.
 *
 * @template T - The expected type of the object
 * @param {T | undefined | null} object - The object to safely destructure
 * @param {Partial<T>} defaultValues - Default values for missing properties
 * @returns {T} A safe object that won't crash on destructuring
 *
 * @example
 * ```tsx
 * const { name, age } = safeDestructure(user, { name: '', age: 0 });
 * ```
 */
const safeDestructure = <T extends object>(object: T | undefined | null, defaultValues: Partial<T> = {}): T => {
    if (isNilOrEmpty(object)) return defaultValues as T;

    return { ...defaultValues, ...object } as T;
};

/**
 * @description Normalizes a string by trimming whitespace and converting to lowercase.
 *  Returns an empty string for nullish input.
 * @param str1
 * @param str - The string to normalize.
 * @returns The normalized string, or empty string if input is nullish.
 */
const lowercase = (str: string | null | undefined): string => {
    return str ? str.trim().toLowerCase() : '';
};

/**
 * @description Compares two strings for equality without considering capitalization.
 * This function is useful for case-insensitive comparisons, such as when checking user input or comparing
 * @param str1
 * @param str2
 * @returns boolean - Returns true if both strings are equal ignoring case, false otherwise.
 */
const compareIgnoreCapitalization = (str1: string, str2: string) => {
    if (str1 === str2) return true;
    return lowercase(str1) === lowercase(str2);
};

/**
 * Validates that a value is an array. Optionally ensures all items pass a type guard.
 * Returns [] when invalid.
 *
 * @example
 * const numbers = validateArray<number>(maybeNumbers, (v): v is number => typeof v === 'number');
 * const anyArray = validateArray<any>(maybeArray); // only checks Array.isArray
 */
const validateArray = <T>(value: unknown, isItem?: (v: unknown) => v is T): T[] => {
    if (!Array.isArray(value)) return [];
    if (isItem && !value.every(isItem)) return [];
    return value as T[];
};

/**
 *
 * @param value
 * @returns
 */
const safeJsonParse: <T>(value: string) => T = <T>(value: string): T => {
    try {
        return JSON.parse(value) as T;
    } catch {
        return {} as T;
    }
};

/**
 *
 * @param val
 * @returns
 */
const isNil = (val: unknown) => {
    return val === null || val === undefined;
};

/**
 *
 * @param text
 * @returns
 */
const countWords = (text: string): number => {
    if (!text || typeof text !== 'string') {
        return 0;
    }

    const wordPattern = /\b[\w'-]+\b/g;
    const matches = text.match(wordPattern);

    return matches ? matches.length : 0;
};

/**
 *
 * @param ms
 * @param isThrowError
 * @returns
 */
const sleepThread = (ms: number, isThrowError = false) =>
    new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            if (isThrowError) {
                reject(new Error('Mock Error'));
            } else {
                resolve();
            }
        }, ms);
    });

export {
    deepClone,
    toTitleCase,
    isNilOrEmpty,
    isListEmpty,
    isEmpty,
    mergeObjects,
    isNullOrEmpty,
    getPropertyPath,
    wait,
    truncate,
    normalize,
    toNumberNormalize,
    toNumber,
    safeDestructure,
    lowercase,
    compareIgnoreCapitalization,
    validateArray,
    isNil,
    countWords,
    safeJsonParse,
    sleepThread,
};
