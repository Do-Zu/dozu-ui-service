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
    const d = new Date(date);

    if (isNaN(d.getTime())) {
        throw new Error('Invalid date provided');
    }

    // Extract date components
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours = d.getHours();
    const hours12 = hours % 12 || 12;
    const minutes = d.getMinutes();
    const seconds = d.getSeconds();
    const milliseconds = d.getMilliseconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Prepare the replacement map
    const replacements: Record<string, string> = {
        yyyy: year.toString(),
        YYYY: year.toString(),
        MM: month.toString().padStart(2, '0'),
        M: month.toString(),
        dd: day.toString().padStart(2, '0'),
        DD: day.toString().padStart(2, '0'),
        d: day.toString(),
        HH: hours.toString().padStart(2, '0'),
        H: hours.toString(),
        hh: hours12.toString().padStart(2, '0'),
        h: hours12.toString(),
        mm: minutes.toString().padStart(2, '0'),
        m: minutes.toString(),
        ss: seconds.toString().padStart(2, '0'),
        s: seconds.toString(),
        SSS: milliseconds.toString().padStart(3, '0'),
        a: ampm,
    };

    // Handle timezone offset
    const offset = -d.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offset) / 60)
        .toString()
        .padStart(2, '0');
    const offsetMinutes = (Math.abs(offset) % 60).toString().padStart(2, '0');
    const offsetSign = offset >= 0 ? '+' : '-';
    replacements['XXX'] = `${offsetSign}${offsetHours}:${offsetMinutes}`;

    // Process the pattern
    let result = pattern;

    // Handle special quoted parts (like 'T' and 'Z')
    result = result.replace(/'T'/g, '--T--').replace(/'Z'/g, '--Z--');

    // Replace all tokens
    Object.entries(replacements).forEach(([token, value]) => {
        result = result.replace(new RegExp(token, 'g'), value);
    });

    // Restore special characters
    result = result.replace(/--T--/g, 'T').replace(/--Z--/g, 'Z');

    return result;
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
const formatTime = (time: string | number, pattern: string = DEFAULT_DISPLAY_TIME_FORMAT): string => {
    const date = new Date(time);
    const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: pattern === 'hh:mm',
    };
    return date.toLocaleTimeString('en-US', options).slice(0, 5);
};

/**
 *
 * @param milliseconds - The time in milliseconds to format.
 * @returns
 */
const formatSeconds = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
};

export { formatDate, formatDateCustom, formatTime, formatSeconds };
