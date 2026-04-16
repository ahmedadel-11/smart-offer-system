const ISO_TIMEZONE_SUFFIX_REGEX = /(Z|[+-]\d{2}:\d{2})$/i;

export const parseUtcTimestamp = (timestamp: string): Date => {
  if (!timestamp) {
    return new Date(NaN);
  }

  const normalized = ISO_TIMEZONE_SUFFIX_REGEX.test(timestamp)
    ? timestamp
    : `${timestamp}Z`;

  return new Date(normalized);
};

export const formatUtcToLocalDateTime = (
  timestamp: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const date = parseUtcTimestamp(timestamp);

  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return date.toLocaleString(undefined, options);
};

export const formatUtcToLocalDate = (
  timestamp: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const date = parseUtcTimestamp(timestamp);

  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return date.toLocaleDateString(undefined, options);
};
