import { formatDistance } from "date-fns"
import { Timestamp } from "src/interfaces"

const locale = typeof window !== "undefined" ? window.navigator.language : "en-US"

export function formatNumber(number: number, opts: Intl.NumberFormatOptions = {}) {
  return new Intl.NumberFormat(locale, {
    notation: "standard",
    // minimumIntegerDigits: 2,
    ...opts,
  }).format(number)
}

export function asUTC(date: Date): Timestamp {
  return Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  )
}

export function formatDateRelative(date: Date | number) {
  return formatDistance(date, new Date(), {
    addSuffix: true,
  })
}

export function formatDate(date: Date | number) {
  return new Intl.DateTimeFormat(locale, {
    // dateStyle: "medium",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function formatHour(date: Date | number, opts: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    hour12: false,
    minute: "numeric",
    // second: "numeric",
    // fractionalSecondDigits: 3,
    ...opts,
  }).format(date)
}

export function formatDateWithHour(date: Date | number, opts: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    hour: "numeric",
    hour12: false,
    minute: "numeric",
    month: "long",
    // second: "numeric",
    // timeZoneName: "short",
    year: "numeric",
    ...opts,
  }).format(date)
}

export function formatFileSize(bytes: number, longFormat = false) {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = longFormat
    ? ["Bytes", "Kibibytes", "Mebibytes", "Gibibytes", "Tebibytes", "Pebibytes"]
    : ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${formatNumber(bytes / Math.pow(k, i), {
    maximumFractionDigits: longFormat ? undefined : 2,
  })} ${sizes[i]}`
}
