import { getTimestampWithClientOffset, IFormatDateSend } from './timezone';
import { formatDate } from './date.util';
import { ISO_WITH_OFFSET_FORMAT } from './constant';

/**
 * Enhances request data with timezone information for API calls.
 * Adds timestamp and timezone name.
 *
 * @param data - The original request data
 * @returns Enhanced data with timezone information
 */
export function addTimezoneInfo<T>(data: T): T & IFormatDateSend {
  const { timestamp, timezone } = getTimestampWithClientOffset();

  return {
    ...data,
    timestamp,
    timezone,
  };
}

/**
 * Prepares a date object for sending to the API by converting it to ISO format with timezone offset.
 *
 * @param date - Date to format for API
 * @returns ISO formatted date string with timezone offset
 */
export function prepareDateForApi(date: Date | string | number): string {
  return formatDate(date, ISO_WITH_OFFSET_FORMAT);
}
