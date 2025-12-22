/**
 * Validates if the given date string matches a specific format (yyyy-mm-dd or variations) and is a valid date.
 *
 * @param {string} dateStr - The input date string.
 * @returns {boolean} - Returns true if the date is valid, otherwise false.
 *
 */
const validateDate = (dateStr: string): boolean => {
    const regex = /^(\d{4})[-/.](\d{2})[-/.](\d{2})$/;

    const match = dateStr.match(regex);
    if (!match) {
        return false;
    }

    const [, year, month, day] = match;
    const parsedYear = parseInt(year, 10);
    const parsedMonth = parseInt(month, 10) - 1;
    const parsedDay = parseInt(day, 10);

    const date = new Date(parsedYear, parsedMonth, parsedDay);

    return date.getFullYear() === parsedYear && date.getMonth() === parsedMonth && date.getDate() === parsedDay;
};

/**
 * Checks if the given input is a valid number.
 * It handles different input types such as string, number, null, undefined, and bigint.
 *
 * @param num - The value to be checked, which can be of type number, string, undefined, null, or bigint.
 * @returns boolean - Returns true if the input is a valid number, otherwise false.
 */
const isNumber = (num: number | string | undefined | null | bigint): boolean => {
    if (num === undefined || num === null) return false;

    if (typeof num === 'string') {
        return !isNaN(Number(num));
    }

    return !isNaN(Number(num));
};

/**
 * Checks if the provided value is a positive number (> 0).
 * Supports number, bigint, and numeric strings.
 * Returns false for: undefined, null, non-numeric strings, NaN, 0, negatives, Infinity.
 */
const isPositiveNumber = (num: number | string | undefined | null | bigint) => {
    if (!isNumber(num)) return false;

    if (typeof num === 'bigint') return num > BigInt(0);

    const value = typeof num === 'string' ? Number(num.trim()) : num;
    if (!isFinite(value as number)) return false;

    return (num as number) > 0;
};

/**
 * Checks if the provided value is a negative number (< 0).
 * Supports number, bigint, and numeric strings.
 * Returns false for: undefined, null, non-numeric strings, NaN, 0, negatives, Infinity.
 */
const isNegative = (num: number | string | undefined | null | bigint) => {
    if (!isNumber(num)) return false;

    if (typeof num === 'bigint') return num < BigInt(0);

    const value = typeof num === 'string' ? Number(num.trim()) : num;
    if (!isFinite(value as number)) return false;

    return (num as number) < 0;
};

export { validateDate, isNumber, isPositiveNumber, isNegative };
