import React from "react";

import { AssetInfo } from "../../components/AssetPage/AssetInfo";
import { Trade } from "../../utils/interfaces";
import { mexcTransformer, readCsv } from "../../utils/utils";

const filePath = "data/preview.csv";

export default async function AssetPage({
  params,
}: {
  params: { assetSymbol: string };
}) {
  const assetSymbol = params.assetSymbol.toLocaleUpperCase();

  let tradeHistory = await readCsv<Trade>(filePath, mexcTransformer);
  tradeHistory = tradeHistory.filter((x) => x.symbol === assetSymbol);

  return <AssetInfo assetSymbol={assetSymbol} tradeHistory={tradeHistory} />;
}
