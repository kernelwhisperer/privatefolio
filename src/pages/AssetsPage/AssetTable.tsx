import { InfoOutlined } from "@mui/icons-material"
import { useStore } from "@nanostores/react"
import React, { useEffect, useMemo, useState } from "react"
import { AttentionBlock } from "src/components/AttentionBlock"
import { MemoryTable } from "src/components/EnhancedTable/MemoryTable"
import { ChartData, FullAsset } from "src/interfaces"
import { $hideUnlisted } from "src/stores/account-settings-store"
import { $activeAccount } from "src/stores/account-store"
import { $assetMap, $filterOptionsMap } from "src/stores/metadata-store"
import { getAssetPlatform, getAssetTicker } from "src/utils/assets-utils"
import { HeadCell } from "src/utils/table-utils"
import { clancy } from "src/workers/remotes"

import { AssetTableRow } from "./AssetTableRow"

export function AssetTable() {
  const { assetId: assetIds } = useStore($filterOptionsMap, { keys: ["assetId"] })

  const assetMap = useStore($assetMap)
  const [priceMap, setPriceMap] = useState<Record<string, ChartData>>()
  const [queryTime, setQueryTime] = useState<number | null>(null)

  useEffect(() => {
    const start = Date.now()
    clancy.getAssetPriceMap($activeAccount.get()).then((priceMap) => {
      setQueryTime(Date.now() - start)
      setPriceMap(priceMap)
    })
  }, [])

  const rows: FullAsset[] = useMemo(
    () =>
      queryTime === null
        ? []
        : assetIds.map((x) => ({
            ...assetMap[x],
            _id: x,
            price: priceMap ? priceMap[x] : null,
            symbol: getAssetTicker(x),
          })),
    [queryTime, assetIds, assetMap, priceMap]
  )

  const hideUnlisted = useStore($hideUnlisted)

  const filteredRows = useMemo(
    () => (hideUnlisted ? rows.filter((x) => x.coingeckoId) : rows),
    [hideUnlisted, rows]
  )

  const headCells: HeadCell<FullAsset>[] = useMemo(
    () => [
      {
        key: "symbol",
        label: "Symbol",
        sortable: true,
        sx: { maxWidth: 360, minWidth: 140, width: "100%" },
      },
      {
        key: "platform" as keyof FullAsset,
        label: "Platform",
        sortable: true,
        sx: { maxWidth: 200, minWidth: 200, width: 200 },
        valueSelector: (row: FullAsset) => getAssetPlatform(row._id),
      },
      {
        key: "priceApiId",
        label: "Price API",
        sortable: true,
        sx: { maxWidth: 200, minWidth: 200, width: 200 },
      },
      {
        key: "price",
        label: "Price",
        numeric: true,
        sortable: true,
        sx: { maxWidth: 200, minWidth: 200, width: 200 },
        valueSelector: (row: FullAsset) => row.price?.value,
      },
    ],
    []
  )

  const hiddenAssets = rows.length - filteredRows.length

  return (
    <>
      <MemoryTable<FullAsset>
        initOrderBy="symbol"
        initOrderDir="asc"
        headCells={headCells}
        TableRowComponent={AssetTableRow}
        rows={filteredRows}
        rowCount={rows.length}
        queryTime={queryTime}
        defaultRowsPerPage={10}
        extraRow={
          !!hiddenAssets && (
            <AttentionBlock>
              <InfoOutlined sx={{ height: 20, width: 20 }} />
              <span>{hiddenAssets} unlisted assets hidden...</span>
            </AttentionBlock>
          )
        }
      />
    </>
  )
}
