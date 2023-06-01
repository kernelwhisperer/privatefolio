"use client";

import { Avatar, Stack } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import icons from "base64-cryptocurrency-icons";
import { groupBy } from "lodash";
import React from "react";

export interface Trade {
  datetime: string;
  executedAmount: string;
  fee: string;
  filledPrice: string;
  role: "Maker" | "Taker";
  side: "BUY" | "SELL";
  symbol: string;
  ticker: string;
  total: string;
}

interface TradeListProps {
  tradeHistory: Trade[];
}

export function TradeList(props: TradeListProps) {
  const { tradeHistory } = props;
  // console.log("📜 LOG > tradeHistory:", tradeHistory[0]);
  const groupedSymbols = groupBy(tradeHistory, "symbol");
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
                <b>Ticker</b>
              </TableCell>
              <TableCell align="right">
                <b>No. of trades</b>
              </TableCell>
              <TableCell align="right">
                <b>Cost basis</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(groupedSymbols).map((symbol) => (
              <TableRow
                key={symbol}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Stack direction="row" gap={1} alignItems="center">
                    <Avatar
                      alt={symbol}
                      src={icons[symbol]?.icon || "broken-img"}
                      sx={{ fontSize: "14px", height: 18, width: 18 }}
                      // TODO: take fontsize from theme
                    />
                    {symbol}
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  {groupedSymbols[symbol].length}
                </TableCell>
                <TableCell align="right">0</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
