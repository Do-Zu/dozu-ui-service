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
export function addTimezoneInfo<T>(data: T) {
    const { timestamp, timezone } = getTimestampWithClientOffset();

    if (data instanceof FormData) {
        return addTimezoneInfoForFormData(data, { timestamp, timezone });
    } else {
        return addTimezoneInfoForAny(data, { timestamp, timezone });
    }
}

export function addTimezoneInfoForAny<T>(data: T, timezoneInfo: IFormatDateSend): T & IFormatDateSend {
    const { timestamp, timezone } = timezoneInfo;

    return {
        ...data,
        timestamp,
        timezone,
    };
}

export function addTimezoneInfoForFormData(data: FormData, timezoneInfo: IFormatDateSend): FormData {
    const { timestamp, timezone } = timezoneInfo;
    data.append('timestamp', timestamp);
    data.append('timezone', timezone);
    return data;
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
