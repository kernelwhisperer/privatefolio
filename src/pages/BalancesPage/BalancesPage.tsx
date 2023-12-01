import { Typography } from "@mui/material"
import React, { useEffect, useState } from "react"

import { getBalances } from "../../api/balances-api"
import { StaggeredList } from "../../components/StaggeredList"
import { Asset, Balance, Exchange } from "../../interfaces"
import { SerifFont } from "../../theme"
import { BalanceTable } from "./BalanceTable"

export function BalancesPage({ show }: { show: boolean }) {
  const [balances, setBalances] = useState<Balance[]>([])
  const [assetMap, setAssetMap] = useState<Record<string, Asset>>({})
  const [integrationMap, setIntegrationMap] = useState<Record<string, Exchange>>({})

  useEffect(() => {
    getBalances().then(async ({ map, timestamp }) => {
      setBalances(Object.keys(map).map((x) => ({ balance: map[x], symbol: x })))

      // const symbolMap = {}
      // const integrationMap = {}
      // balances.forEach((x) => {
      //   symbolMap[x.symbol] = true
      //   integrationMap[x.integration] = true
      // })

      // const assets = await findAssets(symbolMap)
      // setAssetMap(assets)

      // const integrations = await findExchanges(integrationMap)
      // setIntegrationMap(integrations)
    })
  }, [])

  return (
    <StaggeredList gap={1} show={show}>
      <Typography variant="h6" fontFamily={SerifFont}>
        <span>Balances</span>
        {/* <Stack direction="row" alignItems={"baseline"}>
          <Chip
            component={"span"}
            size="small"
            label={
              <Typography variant="h6" fontFamily={SerifFont}>
                {rows.length}
              </Typography>
            }
            sx={{
              // background: alpha(color, 0.075),
              // color: "text.secondary",
              fontFamily: "inherit",

              fontSize: 14,
              fontWeight: 300,
              marginLeft: 1,
              // letterSpacing: 0.5,
            }}
          />
        </Stack> */}
      </Typography>
      <BalanceTable rows={balances} integrationMap={integrationMap} />
    </StaggeredList>
  )
}
