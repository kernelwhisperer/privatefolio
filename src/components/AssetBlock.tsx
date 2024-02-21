import { Stack } from "@mui/material"
import { useStore } from "@nanostores/react"
import React from "react"
import { $assetMetaMap } from "src/stores/metadata-store"
import { getAssetTicker } from "src/utils/assets-utils"

import { AssetAvatar, AssetAvatarProps } from "./AssetAvatar"
import { Truncate } from "./Truncate"

type AssetBlockProps = {
  asset?: string
} & Omit<AssetAvatarProps, "alt" | "src">

export function AssetBlock(props: AssetBlockProps) {
  const assetMap = useStore($assetMetaMap)
  const { asset, ...rest } = props

  return (
    <Stack
      direction="row"
      gap={0.75}
      alignItems="center"
      component="div"
      color={asset ? undefined : "text.secondary"}
    >
      <AssetAvatar
        size="small"
        src={asset ? assetMap[asset]?.image : undefined}
        alt={asset ? getAssetTicker(asset) : undefined}
        {...rest}
      />
      <Truncate>{getAssetTicker(asset)}</Truncate>
    </Stack>
  )
}
