/** Standard ISO 8601 format with offset, usually used for sending to server (e.g. 2023-10-27T10:30:00+07:00) */
const ISO_WITH_OFFSET_FORMAT = "yyyy-MM-dd'T'HH:mm:ssXXX";

/** ISO 8601 UTC format (e.g. 2023-10-27T03:30:00Z) */
const ISO_UTC_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";

/** Default full date and time display format for users (e.g. 16/05/2025 17:30:45) */
const DEFAULT_DISPLAY_DATETIME_FORMAT = 'dd/MM/yyyy HH:mm:ss';

/** Default date display format (e.g. 16/05/2025) */
const DEFAULT_DISPLAY_DATE_FORMAT = 'dd/MM/yyyy';

/** Default time display format (e.g. 17:30) */
const DEFAULT_DISPLAY_TIME_FORMAT = 'HH:mm';

/** Format: yyyy-MM-dd (e.g. 2023-10-27) */
const DATE_ISO_FORMAT = 'yyyy-MM-dd';

/** Format: yyyy/MM/dd (e.g. 2023/10/27) */
const DATE_SLASH_FORMAT = 'yyyy/MM/dd';

/** Format: dd/MM/yyyy (e.g. 27/10/2023) - Recommended for display */
const DATE_DMY_FORMAT = 'dd/MM/yyyy';

/** Format: MM/dd/yyyy (e.g. 10/27/2023) */
const DATE_MDY_FORMAT = 'MM/dd/yyyy';

/** Format: dd-MM-yyyy (e.g. 27-10-2023) */
const DATE_DMY_DASH_FORMAT = 'dd-MM-yyyy';

/** Format: MM-dd-yyyy (e.g. 10-27-2023) */
const DATE_MDY_DASH_FORMAT = 'MM-dd-yyyy';

/** Format: HH:mm (24-hour, e.g. 13:45) */
const TIME_24H_FORMAT = 'HH:mm';

/** Format: hh:mm a (12-hour, e.g. 01:45 PM) */
const TIME_12H_FORMAT = 'hh:mm a';

/** Format: HH:mm:ss (24-hour with seconds, e.g. 13:45:30) */
const TIME_24H_SECONDS_FORMAT = 'HH:mm:ss';

/** Format: dd/MM/yyyy HH:mm (e.g. 27/10/2023 13:45) */
const DATETIME_DMY_24H_FORMAT = 'dd/MM/yyyy HH:mm';

/** Format: dd/MM/yyyy hh:mm a (e.g. 27/10/2023 01:45 PM) */
const DATETIME_DMY_12H_FORMAT = 'dd/MM/yyyy hh:mm a';

/** Format: yyyy-MM-dd'T'HH:mm:ss (e.g. 2023-10-27T13:45:30) */
const DATETIME_ISO_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";

const PURETS_ISO_FORMAT_WITH_MILLISECONDS = 'yyyy-MM-ddTHH:mm:ss.SSS';

export {
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
};
