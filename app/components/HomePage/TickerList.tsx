"use client";

import { Typography } from "@mui/material";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { groupBy } from "lodash";
import React from "react";

export interface Trade {
  datetime: string;
  executedAmount: string;
  fee: string;
  filledPrice: string;
  role: "Maker" | "Taker";
  side: "BUY" | "SELL";
  ticker: string;
  total: string;
}

interface TickerListProps {
  tradeHistory: Trade[];
}

export default function TickerList(props: TickerListProps) {
  const { tradeHistory } = props;
  console.log("📜 LOG > tradeHistory:", tradeHistory[0]);
  const groupedTrades = groupBy(tradeHistory, "ticker");
  console.log("📜 LOG > groupedTrades:", groupedTrades);

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Ticker list
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Ticker</TableCell>
              <TableCell align="right">No. of trades</TableCell>
              <TableCell align="right">Cost basis</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(groupedTrades).map((tradeGroup) => (
              <TableRow
                key={tradeGroup}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {tradeGroup}
                </TableCell>
                <TableCell align="right">
                  {groupedTrades[tradeGroup].length}
                </TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
