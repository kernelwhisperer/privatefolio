import { Stack } from "@mui/material"
import { useStore } from "@nanostores/react"
import React from "react"
import { $assetMetaMap } from "src/stores/metadata-store"
import { getAssetTicker } from "src/utils/assets-utils"

import { AssetAvatar } from "./AssetAvatar"

type AssetBlockProps = {
  asset: string
}

export function AssetBlock(props: AssetBlockProps) {
  const assetMap = useStore($assetMetaMap)
  const { asset } = props

  return (
    <Stack direction="row" gap={0.5} alignItems="center" component="div">
      <AssetAvatar size="small" src={assetMap[asset]?.image} alt={getAssetTicker(asset)} />
      <span>{getAssetTicker(asset)}</span>
    </Stack>
  )
}
