import { Stack, Tab, TabProps, Tabs, tabsClasses, Typography } from "@mui/material"
import { grey } from "@mui/material/colors"
import { useStore } from "@nanostores/react"
import React from "react"
import { Navigate, NavLink, useParams, useSearchParams } from "react-router-dom"

import { AssetAvatar } from "../../components/AssetAvatar"
import { BackButton } from "../../components/BackButton"
import { StaggeredList } from "../../components/StaggeredList"
import { $assetMap, $filterOptionsMap } from "../../stores/metadata-store"
import { SerifFont } from "../../theme"
import { AuditLogTable } from "../AuditLogsPage/AuditLogTable"
import { TransactionTable } from "../TransactionPage/TransactionTable"
import { BalanceChart } from "./BalanceChart"
import { PriceChart } from "./PriceChart"

export function NavButton(props: TabProps<typeof NavLink>) {
  return (
    <Tab component={NavLink} LinkComponent={NavLink} sx={{ textTransform: "none" }} {...props} />
  )
}

export default function AssetPage({ show }: { show: boolean }) {
  const params = useParams()
  const symbol = params.symbol?.toLocaleUpperCase()
  const [searchParams] = useSearchParams()
  const tab = searchParams.get("tab") || ""
  const assetMap = useStore($assetMap)

  const filterMap = useStore($filterOptionsMap)

  if (!symbol || (filterMap.symbol && !filterMap.symbol.includes(symbol))) {
    return <Navigate to="/" replace={true} />
  }

  return (
    <StaggeredList component="main" gap={2} show={show}>
      <BackButton to="/" sx={{ marginLeft: 1 }}>
        Home
      </BackButton>
      <Stack direction="row" gap={1} alignItems="center" component="div" sx={{ marginX: 2 }}>
        <AssetAvatar size="large" src={assetMap[symbol]?.image} alt={symbol} />
        <Stack>
          <Typography variant="h6" fontFamily={SerifFont} sx={{ marginBottom: -0.5 }}>
            <span>{symbol}</span>
          </Typography>
          <Typography
            color="text.secondary"
            variant="subtitle2"
            fontWeight={300}
            letterSpacing={0.5}
          >
            {assetMap[symbol]?.name}
          </Typography>
        </Stack>
      </Stack>
      <Stack>
        <Tabs
          value={tab}
          sx={(theme) => ({
            marginX: 2,
            [`& .${tabsClasses.indicator}`]: {
              background: grey[600],
              // borderRadius: 2,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              // bottom: 6,
              height: 4,
            },
            [`& .${tabsClasses.flexContainer}`]: {
              gap: 2,
            },
            [`& .${tabsClasses.flexContainer} > a`]: {
              ...theme.typography.body1,
              fontFamily: SerifFont,
              fontWeight: 500,
              letterSpacing: 0.5,
              minWidth: 0,
              paddingX: 0,
              transition: theme.transitions.create("color"),
            },
            [`& .${tabsClasses.flexContainer} > a:hover`]: {
              color: theme.palette.text.primary,
            },
          })}
        >
          <NavButton value="" to={`/asset/${symbol}`} label="Price history" replace />
          <NavButton
            value="balance"
            to={`/asset/${symbol}?tab=balance`}
            label="Balance history"
            replace
          />
          {/* <NavButton value="pnl" to={`/asset/${symbol}?tab=pnl`} label="Profit & Loss" replace /> */}
          <NavButton
            value="transactions"
            to={`/asset/${symbol}?tab=transactions`}
            label="Transactions"
            replace
          />
          <NavButton
            value="audit-logs"
            to={`/asset/${symbol}?tab=audit-logs`}
            label="Audit logs"
            replace
          />
        </Tabs>
        {tab === "" && <PriceChart symbol={symbol} />}
        {tab === "balance" && <BalanceChart symbol={symbol} />}
        {tab === "transactions" && <TransactionTable symbol={symbol} defaultRowsPerPage={10} />}
        {tab === "audit-logs" && <AuditLogTable symbol={symbol} defaultRowsPerPage={10} />}
      </Stack>
      {/* <AssetInfo
           assetSymbol={assetSymbol}
           amountBought={amounts.amountBought.toNumber()}
           amountSold={amounts.amountSold.toNumber()}
           moneyIn={amounts.moneyIn.toNumber()}
           moneyOut={amounts.moneyOut.toNumber()}
           holdings={amounts.holdings.toNumber()}
           costBasis={amounts.costBasis.toNumber()}
           tradeHistory={tradeHistory}
         /> */}
    </StaggeredList>
  )
}

// const [tradeHistory, setTradeHistory] = useState<Transaction[]>([])
// const [amounts, setAmounts] = useState<any>({})

// useEffect(() => {
// readCsv<ParsedTransaction>(filePath, mexcParser).then((tradeHistory) => {
//   const parsedTradeHistory = tradeHistory.filter((x) => x.symbol === assetSymbol)
//   let amountBought = new Decimal(0)
//   let amountSold = new Decimal(0)
//   let moneyIn = new Decimal(0)
//   let moneyOut = new Decimal(0)
//   const frontendTradeHistory: Transaction[] = parsedTradeHistory.map((x) => {
//     if (x.side === "BUY") {
//       amountBought = amountBought.plus(x.amount)
//       moneyIn = moneyIn.plus(x.total)
//     } else {
//       amountSold = amountSold.plus(x.amount)
//       moneyOut = moneyOut.plus(x.total)
//     }
//     return {
//       ...x,
//       amount: x.amount.toNumber(),
//       filledPrice: x.filledPrice.toNumber(),
//       total: x.total.toNumber(),
//     }
//   })
//   const holdings = amountBought.minus(amountSold)
//   console.log("📜 LOG > readCsv<ServerTrade> > holdings:", holdings)
//   const costBasis = moneyIn.div(amountBought)
//   setTradeHistory(frontendTradeHistory)
//   setAmounts({
//     amountBought,
//     amountSold,
//     costBasis,
//     holdings,
//     moneyIn,
//     moneyOut,
//   })
// })
// }, [])
