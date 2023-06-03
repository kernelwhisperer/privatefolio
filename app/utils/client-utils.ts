export function formatNumber(number: number) {
  return new Intl.NumberFormat([], {
    maximumFractionDigits: 2,
    notation: "compact",
  }).format(number);
}
