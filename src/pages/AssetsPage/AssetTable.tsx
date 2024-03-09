import { useStore } from "@nanostores/react"
import React, { useMemo } from "react"
import { MemoryTable } from "src/components/EnhancedTable/MemoryTable"
import { Asset } from "src/interfaces"
import { $assetMetaMap, $filterOptionsMap } from "src/stores/metadata-store"
import { HeadCell } from "src/utils/table-utils"

import { AssetTableRow } from "./AssetTableRow"

export function AssetTable() {
  const { assetId: assetIds } = useStore($filterOptionsMap, { keys: ["assetId"] })

  const queryTime = assetIds === undefined ? null : 0
  const assetMap = useStore($assetMetaMap)

  const rows = useMemo(
    () =>
      assetIds === undefined
        ? []
        : assetIds.map((x) => ({
            _id: x,
            ...assetMap[x],
          })),
    [assetIds, assetMap]
  )

  const headCells: HeadCell<Asset>[] = useMemo(
    () => [
      {
        key: "symbol",
        label: "Symbol",
        sortable: true,
        sx: { maxWidth: 360, minWidth: 140, width: "100%" },
      },
      {
        label: "Platform",
        sortable: true,
        sx: { maxWidth: 200, minWidth: 200, width: 200 },
      },
      // {
      //   label: "Price",
      //   sortable: true,
      //   sx: { maxWidth: 200, minWidth: 200, width: 200 },
      // },
    ],
    []
  )

  return (
    <>
      <MemoryTable<Asset>
        initOrderBy="symbol"
        headCells={headCells}
        TableRowComponent={AssetTableRow}
        rows={rows}
        queryTime={queryTime}
        defaultRowsPerPage={10}
      />
    </>
  )
}
