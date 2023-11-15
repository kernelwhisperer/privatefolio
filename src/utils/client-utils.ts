import { formatDistance } from "date-fns"

export function formatNumber(number: number) {
  return new Intl.NumberFormat(window.navigator.language, {
    maximumFractionDigits: 4,
    notation: "standard",
  }).format(number)
}

// TODO
export const TZ_OFFSET = new Date().getTimezoneOffset() * 60 * 1000

export function formatDateRelative(date: Date | number) {
  return formatDistance(date, new Date(), {
    addSuffix: true,
  })
}

export function formatDate(date: Date | number) {
  return new Intl.DateTimeFormat(window.navigator.language, {
    dateStyle: "long",
  }).format(date)
}

export function formatHour(date: Date | number) {
  return new Intl.DateTimeFormat(window.navigator.language, {
    hour: "numeric",
    hour12: false,
    minute: "numeric",
    // second: "numeric",
    // ...opts,
  }).format(date)
}

export function formatDateWithHour(date: Date | number, opts: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat(window.navigator.language, {
    day: "numeric",
    hour: "numeric",
    hour12: false,
    minute: "numeric",
    month: "short",
    second: "numeric",
    // timeZoneName: "short",
    year: "numeric",
    ...opts,
  }).format(date)
}
