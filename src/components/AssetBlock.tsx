import { Stack, Typography } from "@mui/material"
import { useStore } from "@nanostores/react"
import React, { ReactNode } from "react"
import { PLATFORMS_META } from "src/settings"
import { $assetMap } from "src/stores/metadata-store"
import { getAssetPlatform, getAssetTicker } from "src/utils/assets-utils"

import { AssetAvatar, AssetAvatarProps } from "./AssetAvatar"
import { Truncate } from "./Truncate"

type AssetBlockProps = {
  asset?: string
  secondary?: ReactNode
  showPlatform?: boolean
} & Omit<AssetAvatarProps, "alt" | "src">

export function AssetBlock(props: AssetBlockProps) {
  const assetMap = useStore($assetMap)
  const { asset, secondary, showPlatform, ...rest } = props

  return (
    <Stack
      direction="row"
      gap={props.size === "small" ? 0.75 : 1}
      alignItems="center"
      component="div"
      color={asset ? undefined : "text.secondary"}
    >
      <AssetAvatar
        size="small"
        src={asset ? assetMap[asset]?.logoUrl : undefined}
        alt={asset ? getAssetTicker(asset) : undefined}
        {...rest}
      />
      <Stack>
        <Truncate>
          {getAssetTicker(asset)}
          {showPlatform && asset && getAssetPlatform(asset) !== "ethereum" && (
            <Typography
              color="text.secondary"
              variant="caption"
              fontWeight={300}
              letterSpacing={0.5}
            >
              {" "}
              - {PLATFORMS_META[getAssetPlatform(asset)].name}
            </Typography>
          )}
        </Truncate>
        {secondary && (
          <Typography color="text.secondary" variant="caption" fontWeight={300} letterSpacing={0.5}>
            {secondary}
          </Typography>
        )}
      </Stack>
    </Stack>
  )
}
