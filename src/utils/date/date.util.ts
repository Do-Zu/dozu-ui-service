import { format as formatWithDateFns, isValid as isValidDate } from 'date-fns';
import {
    ISO_WITH_OFFSET_FORMAT,
    ISO_UTC_FORMAT,
    DEFAULT_DISPLAY_DATETIME_FORMAT,
    DEFAULT_DISPLAY_DATE_FORMAT,
    DEFAULT_DISPLAY_TIME_FORMAT,
    DATE_ISO_FORMAT,
    DATE_SLASH_FORMAT,
    DATE_DMY_FORMAT,
    DATE_MDY_FORMAT,
    DATE_DMY_DASH_FORMAT,
    DATE_MDY_DASH_FORMAT,
    TIME_24H_FORMAT,
    TIME_12H_FORMAT,
    TIME_24H_SECONDS_FORMAT,
    DATETIME_DMY_24H_FORMAT,
    DATETIME_DMY_12H_FORMAT,
    DATETIME_ISO_FORMAT,
    PURETS_ISO_FORMAT_WITH_MILLISECONDS,
} from './constant';

// Define a type for the standard date format patterns
type DateFormatPattern =
    | typeof ISO_WITH_OFFSET_FORMAT
    | typeof ISO_UTC_FORMAT
    | typeof DEFAULT_DISPLAY_DATETIME_FORMAT
    | typeof DEFAULT_DISPLAY_DATE_FORMAT
    | typeof DEFAULT_DISPLAY_TIME_FORMAT
    | typeof DATE_ISO_FORMAT
    | typeof DATE_SLASH_FORMAT
    | typeof DATE_DMY_FORMAT
    | typeof DATE_MDY_FORMAT
    | typeof DATE_DMY_DASH_FORMAT
    | typeof DATE_MDY_DASH_FORMAT
    | typeof TIME_24H_FORMAT
    | typeof TIME_12H_FORMAT
    | typeof TIME_24H_SECONDS_FORMAT
    | typeof DATETIME_DMY_24H_FORMAT
    | typeof DATETIME_DMY_12H_FORMAT
    | typeof DATETIME_ISO_FORMAT
    | typeof PURETS_ISO_FORMAT_WITH_MILLISECONDS;

/**
 * Formats a given date using a standard format pattern defined in constants.
 *
 * @param {Date | string | number} date - The input date to be formatted.
 * @param {DateFormatPattern} pattern - The standard format pattern from constants.
 * @returns {string} - The formatted date string based on the given pattern.
 */
const formatDate = (date: Date | string | number, pattern: DateFormatPattern = DEFAULT_DISPLAY_DATE_FORMAT): string => {
    return formatDateCustom(date, pattern);
};

/**
 * Formats a date using any custom pattern (not limited to constants).
 *
 * @param {Date | string | number} date - The input date to be formatted.
 * @param {string} pattern - Any custom format pattern.
 * @returns {string} - The formatted date string based on the given pattern.
 */
const formatDateCustom = (date: Date | string | number, pattern: string): string => {
    const parsedDate = new Date(date);

    if (!isValidDate(parsedDate)) {
        throw new Error('Invalid date provided');
    }

    // Normalize legacy tokens to date-fns-compatible tokens (keep existing semantics)
    const normalizedPattern = pattern.replace(/YYYY/g, 'yyyy').replace(/DD/g, 'dd');

    return formatWithDateFns(parsedDate, normalizedPattern);
};

/**
 * Formats a given time (in string or number format) to a specified time pattern.
 *
 * This function takes a time input in the form of a string or number (e.g., timestamp or time string),
 * and returns it as a string in the specified time format: either "HH:mm" for 24-hour format or "hh:mm" for 12-hour format.
 *
 * @param {string | number} time - The input time to be formatted. This can be a valid date string,
 *                                  a number representing milliseconds, or a time string.
 * @param {string} pattern - The desired time format pattern. It can be either 'HH:mm' (24-hour format) or 'hh:mm' (12-hour format).
 * @returns {string} - The formatted time string based on the specified pattern.
 *
 * Example:
 * formatTime('2025-01-01T12:34:56Z', 'HH:mm'); // Returns: "12:34" (24-hour format)
 * formatTime('2025-01-01T12:34:56Z', 'hh:mm'); // Returns: "12:34 PM" (12-hour format with AM/PM)
 * formatTime(1630435600000, 'HH:mm'); // Returns: "12:34" (24-hour format)
 * formatTime(1630435600000, 'hh:mm'); // Returns: "12:34 PM" (12-hour format with AM/PM)
 */
const formatTime = (time: string | number | Date, pattern: string = DEFAULT_DISPLAY_TIME_FORMAT): string => {
    const date = new Date(time);
    const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: pattern === 'hh:mm',
    };
    return date.toLocaleTimeString('en-US', options).slice(0, 5);
};

/**
 * Gets the current system date in the format 'yyyy-MM-dd'.
 * @returns The current system date as a string.z
 */
const getCurrentSystemDate = (): string => {
    return formatDate(new Date(), 'yyyy-MM-dd');
};

/**
 * Gets the current system date and time.
 * @returns The current system date and time as a Date object.
 */
const getCurrentSystemDateTime = (): Date => {
    return new Date();
};

/**
 * Gets the current system time.
 * @returns The current system time as a string.
 */
const getCurrentTime = (): string => {
    return formatTime(getCurrentSystemDateTime(), 'HH:mm');
};

/* Utility: format seconds -> HH:MM:SS */
const formatSeconds = (sec?: number): string => {
    if (sec == null || isNaN(sec)) return '';
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = Math.floor(sec % 60);
    const h = hours.toString().padStart(2, '0');
    const m = minutes.toString().padStart(2, '0');
    const s = seconds.toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

export {
    formatDate,
    formatDateCustom,
    formatTime,
    getCurrentSystemDate,
    getCurrentSystemDateTime,
    getCurrentTime,
    formatSeconds,
};
export enum TimeUnit {
    SECOND = 'seconds',
    MINUTE = 'minutes',
    HOUR = 'hours',
    DAY = 'days',
    WEEK = 'weeks',
    MONTH = 'months',
    YEAR = 'years',
}
