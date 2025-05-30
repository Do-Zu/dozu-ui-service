export interface IFormatDateSend {
  timestamp: string;
  timezone: string;
}

function pad(num: number, size: number = 2): string {
  return String(num).padStart(size, '0');
}

/**
 * Get the client's IANA time zone (e.g. "Asia/Ho_Chi_Minh").
 */
export function getCurrentTimeZoneName(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.warn(
      'Intl.DateTimeFormat().resolvedOptions().timeZone is not available. Use fallback.',
    );
    const offsetMinutes = new Date().getTimezoneOffset();
    const sign = offsetMinutes > 0 ? '-' : '+';
    const absOffsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
    return `Etc/GMT${sign === '+' ? '-' : '+'}${absOffsetHours}`;
  }
}
/**
 * Gets the difference in minutes between Universal Coordinated Time (UTC) and the local computer time.
 * For example, GMT+7 returns -420 minutes.
 *
 * @param date - Date object to get the offset from (defaults to current time)
 * @returns Time zone offset from UTC, in minutes
 */
export function getTimeZoneOffsetMinutes(date: Date = new Date()): number {
  return date.getTimezoneOffset();
}

/**
 * Gets the timezone offset string of the client in ISO 8601 format (e.g., "+07:00" or "-05:00").
 * This format is commonly used for API requests that require timezone information.
 *
 * @param date - Date object to get the offset from (defaults to current time)
 * @returns The formatted timezone offset string
 */
export function getTimezoneOffsetString(date: Date = new Date()): string {
  const offsetMinutes = date.getTimezoneOffset();
  // getTimezoneOffset returns positive if local timezone is behind UTC
  // and negative if ahead. ISO 8601 offset format uses the opposite sign convention.
  const sign = offsetMinutes > 0 ? '-' : '+';
  const absOffset = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absOffset / 60)).padStart(2, '0');
  const minutes = String(absOffset % 60).padStart(2, '0');

  return `${sign}${hours}:${minutes}`;
}

/**
 * Creates an object containing both the ISO timestamp with the client's timezone offset
 * and the IANA timezone name. This is useful for server requests that need
 * precise timezone information.
 *
 * @param date - Date object to process (defaults to current time)
 * @returns Object containing ISO timestamp with offset and timezone name
 */
export function getTimestampWithClientOffset(date: Date = new Date()): IFormatDateSend {
  const timeZoneName = getCurrentTimeZoneName();
  const offsetString = getTimezoneOffsetString();

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const milliseconds = pad(date.getMilliseconds());

  const localISOWithoutTimeZone = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;

  const isoWithOffset = `${localISOWithoutTimeZone}${offsetString}`;

  return {
    timestamp: isoWithOffset,
    timezone: timeZoneName,
  };
}

/**
 * Converts a Date object to an ISO 8601 UTC string (e.g., "2025-05-16T10:30:00.123Z").
 *
 * @param date - Date object to convert (defaults to current time)
 * @returns ISO 8601 string in UTC
 */
export function convertToUTCISOString(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Parses an ISO 8601 string (either UTC or with offset) into a local Date object.
 * The resulting Date object will represent the equivalent local time on the user's machine.
 *
 * @param isoString - ISO 8601 string from the server
 * @returns Parsed Date object, or null if parsing fails
 */
export function parseISOToLocalDate(iosString: string | null | undefined): Date | null {
  if (!iosString) return null;

  try {
    const date = new Date(iosString);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch (error) {
    return null;
  }
}

/**
 * Converts a local Date object to the equivalent UTC Date object.
 * The internal timestamp (milliseconds since epoch) remains unchanged.
 * In JavaScript, all Date objects are technically UTC internally.
 * This function is mainly for clarity of intent or when you need to pass a Date object
 * that should be treated as UTC by another API.
 *
 * @param localDate - A Date object representing local time
 * @returns A new Date object representing the same point in time, but treated as UTC
 */
export function convertLocalToUTCDateObject(localDate: Date): Date {
  if (!(localDate instanceof Date) || isNaN(localDate.getTime())) {
    throw new Error('Invalid Date object provided to convertLocalToUTCDateObject');
  }
  return new Date(localDate.toISOString());
}

/**
 * Converts a UTC Date object (or a Date you want to be treated as UTC)
 * to a Date object representing the equivalent local time.
 *
 * Basically, if you have a Date object (representing a UTC time point),
 * its getHours(), getDate() methods will automatically return local time.
 * This function simply returns a copy for semantic clarity.
 *
 * @param utcDate - A Date object representing UTC time
 * @returns A new Date object representing the equivalent local time
 */
export function convertUTCToLocalDateObject(utcDate: Date): Date {
  if (!(utcDate instanceof Date) || isNaN(utcDate.getTime())) {
    throw new Error('Invalid Date object provided to convertUTCToLocalDateObject');
  }

  return new Date(utcDate.getTime());
}
