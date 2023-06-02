import React from "react";

import { AssetList } from "./components/HomePage/AssetList";
import { Trade } from "./utils/interfaces";
import { mexcTransformer, readCsv } from "./utils/utils";

const filePath = "data/preview.csv";

export default async function HomePage() {
  const tradeHistory = await readCsv<Trade>(filePath, mexcTransformer);
  // console.log("📜 LOG > tradeHistory:", tradeHistory[0]);
  return <AssetList tradeHistory={tradeHistory} />;
}
