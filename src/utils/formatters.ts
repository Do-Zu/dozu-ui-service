/**
 * Capitalizes the first letter of a given string.
 *
 * @param {string} str - The input string to capitalize.
 * @returns {string} - The string with the first letter capitalized.
 *
 * Example:
 * capitalizeFirstLetter('hello'); // Returns: "Hello"
 */
const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Formats a number to a currency string.
 *
 * @param {number} amount - The numeric amount to be formatted as currency.
 * @param {string} [currency='USD'] - The currency code (e.g., 'USD', 'EUR', etc.). Default is 'USD'.
 * @returns {string} - The formatted currency string.
 *
 * Example:
 * formatCurrency(1234.56); // Returns: "$1,234.56"
 * formatCurrency(1234.56, 'EUR'); // Returns: "€1,234.56"
 */
const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Format string
 *
 * @param {string | undefined | null} str - The input
 * @param {object} options - Options for format
 * @returns {string} - The formatted string.
 *
 */
const formatString = (
  str: string | undefined | null,
  options: { capitalize?: boolean; trim?: boolean } = {
    trim: true,
    capitalize: false,
  },
) => {
  if (str === undefined || str === null) return '';

  if (options.trim) {
    str.trim();
  }

  // Capitalize the first letter of each word if capitalize option is true
  if (options.capitalize) {
    str = str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
};

/**
 * Formats a number with optional decimal places and thousands separators.
 *
 * @param num - The number or string to be formatted.
 * @param options - An object containing optional formatting options:
 *    - `decimals`: The number of decimal places to round to (optional).
 *    - `thousandsSeparator`: A boolean indicating if a thousands separator (comma) should be used (optional).
 * @returns A string representing the formatted number.
 */
const formatNumber = (
  num: number | string,
  options: { decimals?: number; thousandsSeparator?: boolean } = {},
): string => {
  if (typeof num === 'string') {
    if (isNaN(Number(num))) {
      return '';
    }
  }

  num = Number(num);

  let formattedNumber = '';

  if (options?.decimals) {
    formattedNumber = num.toFixed(options.decimals);
  }

  // Handle the thousandsSeparator option, if provided
  //EX: 10000 => 10,000
  if (options.thousandsSeparator) {
    formattedNumber = formattedNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  return formattedNumber;
};

/**
 * Formats a number as VND currency with thousands separators.
 *
 * @param amount - The numeric amount to be formatted as VND.
 * @returns A string representing the formatted VND amount with commas and "VND" suffix.
 *
 * Example:
 * formatVND(1234567); // Returns: "1,234,567 VND"
 * formatVND(125000); // Returns: "125,000 VND"
 */
const formatVND = (amount: number): string => {
  return `${amount.toLocaleString('vi-VN')} VND`;
};

/**
 * Formats an integer.
 *
 * @param num - The input to be convert.
 * @returns A number representing the formatted integer.
 */
const formatInt = (num: number | string | undefined | null): number => {
  if (num === undefined || num === null) return 0;

  if (typeof num === 'string') {
    num = Number(num);
  }

  if (!Number.isInteger(num)) {
    return 0;
  }
  if (!num) return 0;
  return num;
};

/**
 * Formats a double (floating-point number).
 *
 * @param num - The input
 * @param decimals - The number of decimal places to round to.
 * @returns A number representing the formatted double.
 */
const formatDouble = (
  num: number | string | undefined | null,
  decimals: number = 2,
): number => {
  if (num === undefined || num === null) {
    num = 0;
    return parseFloat(num.toFixed(decimals));
  }

  if (typeof num === 'string') {
    num = Number(num);
  }

  if (isNaN(num)) {
    return 0;
  }

  return parseFloat(num.toFixed(decimals));
};

export {
  capitalizeFirstLetter,
  formatCurrency,
  formatString,
  formatNumber,
  formatInt,
  formatDouble,
  formatVND,
};
