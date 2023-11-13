"use client"

import { Link, Stack } from "@mui/material"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
// import icons from "base64-cryptocurrency-icons";
import { groupBy } from "lodash"
import NextLink from "next/link"
import React from "react"

import { Trade } from "../../utils/interfaces"

interface TradeListProps {
  tradeHistory: Trade[]
}

export function AssetList(props: TradeListProps) {
  const { tradeHistory } = props
  const buyHistory = tradeHistory.filter((x) => x.side === "BUY")
  const groupedSymbols = groupBy(buyHistory, "symbol")
  // console.log("📜 LOG > groupedTrades:", groupedTrades);

  return (
    <>
      {/* <Typography variant="h5" gutterBottom>
        Ticker list
      </Typography> */}
      <TableContainer>
        <Table sx={{ minWidth: 350 }} size="small" aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>
                <b>Asset</b>
              </TableCell>
              <TableCell>
                <b>Base pair</b>
              </TableCell>
              <TableCell align="right">
                <b>No. of trades</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(groupedSymbols).map((symbol) => {
              return (
                <TableRow key={symbol} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    <Stack direction="row" gap={1} alignItems="center">
                      {/* <Avatar
                        alt={symbol}
                        // src={icons[symbol]?.icon || "broken-img"}
                        sx={{ fontSize: "14px", height: 18, width: 18 }}
                        // TODO: take fontsize from theme
                      /> */}
                      <Link
                        href={`/asset/${symbol}`}
                        component={NextLink}
                        sx={{
                          textDecoration: "none",
                        }}
                      >
                        {symbol}
                      </Link>
                    </Stack>
                  </TableCell>
                  <TableCell>{groupedSymbols[symbol][0].baseSymbol}</TableCell>
                  <TableCell align="right">{groupedSymbols[symbol].length}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}
