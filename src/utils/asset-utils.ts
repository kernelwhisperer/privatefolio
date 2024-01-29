export function getAssetSymbol(assetId: string) {
  const parts = assetId.split(":")
  if (parts.length === 1) return assetId
  return parts[2]
}
