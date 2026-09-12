export type FormatDateInput = Date | string | number

export function formatDate(
  date: FormatDateInput,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
  locale = 'en-US',
): string {
  const value = date instanceof Date ? date : new Date(date)

  return new Intl.DateTimeFormat(locale, options).format(value)
}
