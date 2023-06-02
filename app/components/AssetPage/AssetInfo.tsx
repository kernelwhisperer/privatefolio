"use client";

import { Box, Stack, Typography } from "@mui/material";
// import icons from "base64-cryptocurrency-icons";
import React from "react";

import { Trade } from "../../utils/interfaces";
import EnhancedTable, { HeadCell } from "../EnhancedTable";

interface AssetInfoProps {
  assetSymbol: string;
  tradeHistory: Trade[];
}

const headCells: readonly HeadCell<Trade>[] = [
  {
    disablePadding: true,
    id: "id",
    label: "Id",
  },
  {
    id: "datetime",
    label: "Datetime",
  },
  {
    id: "ticker",
    label: "Ticker",
  },
  {
    id: "side",
    label: "Side",
  },
  {
    id: "filledPrice",
    label: "Price",
    numeric: true,
  },
  {
    id: "executedAmount",
    label: "Amount",
    numeric: true,
  },
];

export function AssetInfo(props: AssetInfoProps) {
  const { tradeHistory, assetSymbol } = props;
  // const buyHistory = tradeHistory.filter((x) => x.side === "BUY");
  // console.log("📜 LOG > groupedTrades:", groupedTrades);
  const amountBought = tradeHistory.reduce(
    (accumulator, x) =>
      x.side === "BUY" ? accumulator + x.amount : accumulator,
    0
  );
  const amountSold = tradeHistory.reduce(
    (accumulator, x) =>
      x.side === "SELL" ? accumulator + x.amount : accumulator,
    0
  );
  const holdings = amountBought - amountSold;

  const moneyInAmount = tradeHistory.reduce(
    (accumulator, x) =>
      x.side === "BUY" ? accumulator + x.total : accumulator,
    0
  );
  const moneyOutAmount = tradeHistory.reduce(
    (accumulator, x) =>
      x.side === "SELL" ? accumulator + x.total : accumulator,
    0
  );

  const costBasis = moneyInAmount / amountBought;

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h3" marginBottom={1}>
        {assetSymbol}
      </Typography>
      <Stack gap={1} marginBottom={2}>
        <Typography variant="body1">
          <span>No. of trades</span> <span>{tradeHistory.length}</span>
        </Typography>
        <Typography variant="body1">
          <span>Amount bought</span>{" "}
          <span>
            {amountBought} {assetSymbol}
          </span>
        </Typography>
        <Typography variant="body1">
          <span>Amount sold</span>{" "}
          <span>
            {amountSold} {assetSymbol}
          </span>
        </Typography>
        <Typography variant="body1">
          <span>Holdings</span>{" "}
          <span>
            {holdings} {assetSymbol}
          </span>
        </Typography>
        <Typography variant="body1">
          <span>Money in</span> <span>{moneyInAmount} USDT</span>
        </Typography>
        <Typography variant="body1">
          <span>Money out</span> <span>{moneyOutAmount} USDT</span>
        </Typography>
        <Typography variant="body1">
          <span>Cost basis</span> <span>{costBasis} USDT</span>
        </Typography>
      </Stack>
      <EnhancedTable<Trade> rows={tradeHistory} headCells={headCells} />
    </Box>
  );
}
