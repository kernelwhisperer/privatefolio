import {
  alpha,
  Chip,
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
} from "@mui/material"
import { grey } from "@mui/material/colors"
import { useStore } from "@nanostores/react"
import React from "react"
import { AmountBlock } from "src/components/AmountBlock"
import { AppLink } from "src/components/AppLink"
import { AssetBlock } from "src/components/AssetBlock"
import { PlatformAvatar } from "src/components/PlatformAvatar"
import { PlatformBlock } from "src/components/PlatformBlock"
import { PRICE_API_IDS, PRICE_APIS_META, PriceApiId } from "src/settings"
import { $quoteCurrency } from "src/stores/account-settings-store"
import { $activeAccount } from "src/stores/account-store"
import { $assetMap } from "src/stores/metadata-store"
import { getAssetPlatform } from "src/utils/assets-utils"
import { clancy } from "src/workers/remotes"

import { FullAsset } from "../../interfaces"
import { TableRowComponentProps } from "../../utils/table-utils"

export function AssetTableRow(props: TableRowComponentProps<FullAsset>) {
  const {
    row,
    relativeTime: _relativeTime,
    headCells: _headCells,
    isMobile: _isMobile,
    isTablet,
    ...rest
  } = props
  const { _id: assetId, name, coingeckoId, priceApiId, price } = row
  const currency = useStore($quoteCurrency)

  const handleChange = (event: SelectChangeEvent<string>) => {
    const newValue: PriceApiId | undefined = (event.target.value as PriceApiId) || undefined
    clancy.updateAsset($activeAccount.get(), assetId, {
      priceApiId: newValue,
    })
    $assetMap.setKey(assetId, { ...row, priceApiId: newValue })
  }

  const priceApiSelect = (
    <Select size="small" onChange={handleChange} value={priceApiId || ""} displayEmpty>
      <MenuItem value="">
        <em>Auto</em>
      </MenuItem>
      {PRICE_API_IDS.map((priceApiId) => (
        <MenuItem key={priceApiId} value={priceApiId}>
          <Stack direction="row" alignItems={"center"} gap={1}>
            <PlatformAvatar
              size="small"
              src={PRICE_APIS_META[priceApiId].logoUrl}
              alt={priceApiId}
            />
            {PRICE_APIS_META[priceApiId].name}
          </Stack>
        </MenuItem>
      ))}
    </Select>
  )

  if (isTablet) {
    return (
      <TableRow hover {...rest}>
        <TableCell colSpan={99} variant="clickable">
          <Stack direction="row" gap={1} justifyContent="space-between" flexWrap="nowrap">
            <AppLink to={`../asset/${encodeURI(assetId)}`}>
              <Stack sx={{ height: 52 }} alignItems="center" direction="row" gap={1}>
                <AssetBlock asset={assetId} secondary={name} size="medium" />
                {!coingeckoId && (
                  <Tooltip title="Not listed on Coingecko.com">
                    <Chip
                      label="Unlisted"
                      size="small"
                      sx={{ background: alpha(grey[500], 0.1), color: "text.secondary" }}
                    />
                  </Tooltip>
                )}
              </Stack>
            </AppLink>
            <Stack alignItems="flex-end" gap={0.5}>
              {priceApiSelect}
              {price === null ? (
                <Skeleton sx={{ minWidth: 30 }}></Skeleton>
              ) : (
                <AmountBlock
                  amount={price?.value}
                  currencySymbol={currency.symbol}
                  currencyTicker={currency.id}
                  significantDigits={currency.maxDigits}
                  maxDigits={currency.maxDigits}
                />
              )}
            </Stack>
          </Stack>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <>
      <TableRow hover {...rest}>
        <TableCell variant="clickable">
          <AppLink to={`../asset/${encodeURI(assetId)}`}>
            <Stack sx={{ height: 52 }} alignItems="center" direction="row" gap={1}>
              <AssetBlock asset={assetId} secondary={name} size="medium" />
              {!coingeckoId && (
                <Tooltip title="Not listed on Coingecko.com">
                  <Chip
                    label="Unlisted"
                    size="small"
                    sx={{ background: alpha(grey[500], 0.1), color: "text.secondary" }}
                  />
                </Tooltip>
              )}
            </Stack>
          </AppLink>
        </TableCell>
        <TableCell>
          <PlatformBlock platform={getAssetPlatform(assetId)} />
        </TableCell>
        <TableCell>{priceApiSelect}</TableCell>
        <TableCell variant="clickable" align="right">
          {price === null ? (
            <Skeleton sx={{ margin: "6px 16px" }}></Skeleton>
          ) : (
            <AmountBlock
              amount={price?.value}
              currencySymbol={currency.symbol}
              currencyTicker={currency.id}
              significantDigits={currency.maxDigits}
              maxDigits={currency.maxDigits}
            />
          )}
        </TableCell>
      </TableRow>
    </>
  )
}
