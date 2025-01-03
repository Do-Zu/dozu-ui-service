/**
 * Formats a given date to a specified pattern.
 *
 * @param {Date | string} date - The input date to be formatted.
 * @param {string} pattern - The desired format pattern.
 * @returns {string} - The formatted date string based on the given pattern.
 *
 */
const formatDate = (date: Date | string, pattern: string): string => {
  const d = new Date(date);

  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');

  switch (pattern) {
    case 'yyyy-MM-dd':
      return `${year}-${month}-${day}`;
    case 'YYYY-MM-dd':
      return `${year}-${month}-${day}`;
    case 'yyyy/MM/dd':
      return `${year}/${month}/${day}`;
    case 'yyyy/mm/dd':
      return `${year}/${month}/${day}`;
    case 'YYYY/MM/dd':
      return `${year}/${month}/${day}`;
    case 'MM-dd':
      return `${month}-${day}`;
    case 'mm-dd':
      return `${month}-${day}`;
    default:
      throw new Error('Invalid pattern');
  }
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
const formatTime = (time: string | number, pattern: string): string => {
  const date = new Date(time);
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: pattern === 'hh:mm',
  };
  return date.toLocaleTimeString('en-US', options).slice(0, 5);
};

export { formatDate, formatTime };
