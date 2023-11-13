import React from "react";

import { AssetList } from "./AssetList";
// import { ServerTrade, Trade } from "./utils/interfaces";
// import { mexcTransformer, readCsv } from "./utils/utils";

// const filePath = "data/preview.csv";

export default function HomePage() {
  // const tradeHistory = await readCsv<ServerTrade>(filePath, mexcTransformer);
  // const frontendTradeHistory: Trade[] = tradeHistory.map((x) => {
  //   return {
  //     ...x,
  //     amount: x.amount.toNumber(),
  //     filledPrice: x.filledPrice.toNumber(),
  //     total: x.total.toNumber(),
  //   };
  // });
  // console.log("📜 LOG > tradeHistory:", tradeHistory[0]);
  return (
    <>
      <AssetList tradeHistory={[]} />
    </>
  );
}
