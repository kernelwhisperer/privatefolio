import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { groupBy } from "lodash";
import React from "react";

import { readCsv } from "./utils";

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

const filePath =
  "data/history_transaction_recode_ecb12a29519d423a917ee4160ffba82e_1674930394870.csv";

export default async function TickerList() {
  const tradeHistory = await readCsv<Trade>(filePath, (csvRow) => ({
    datetime: csvRow[1],
    executedAmount: csvRow[4],
    fee: csvRow[6],
    filledPrice: csvRow[3],
    role: csvRow[7] as any,
    side: csvRow[2] as any,
    ticker: csvRow[0],
    total: csvRow[5],
  }));
  console.log("📜 LOG > tradeHistory:", tradeHistory[0]);
  const groupedTrades = groupBy(tradeHistory, "ticker");
  console.log("📜 LOG > groupedTrades:", groupedTrades);
  return (
    <div>
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
    </div>
  );
}
