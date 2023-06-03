import Decimal from "decimal.js";
import React from "react";

import { AssetInfo } from "../../components/AssetPage/AssetInfo";
import { ServerTrade, Trade } from "../../utils/interfaces";
import { mexcTransformer, readCsv } from "../../utils/utils";

const filePath = "data/preview.csv";

export default async function AssetPage({
  params,
}: {
  params: { assetSymbol: string };
}) {
  const assetSymbol = params.assetSymbol.toLocaleUpperCase();

  let tradeHistory = await readCsv<ServerTrade>(filePath, mexcTransformer);
  tradeHistory = tradeHistory.filter((x) => x.symbol === assetSymbol);

  let amountBought = new Decimal(0);
  let amountSold = new Decimal(0);
  let moneyIn = new Decimal(0);
  let moneyOut = new Decimal(0);

  const frontendTradeHistory: Trade[] = tradeHistory.map((x) => {
    if (x.side === "BUY") {
      amountBought = amountBought.plus(x.amount);
      moneyIn = moneyIn.plus(x.total);
    } else {
      amountSold = amountSold.plus(x.amount);
      moneyOut = moneyOut.plus(x.total);
    }

    return {
      ...x,
      amount: x.amount.toNumber(),
      filledPrice: x.filledPrice.toNumber(),
      total: x.total.toNumber(),
    };
  });

  const holdings = amountBought.minus(amountSold);
  const costBasis = moneyIn.div(amountBought);

  return (
    <AssetInfo
      assetSymbol={assetSymbol}
      amountBought={amountBought.toNumber()}
      amountSold={amountSold.toNumber()}
      moneyIn={moneyIn.toNumber()}
      moneyOut={moneyOut.toNumber()}
      holdings={holdings.toNumber()}
      costBasis={costBasis.toNumber()}
      tradeHistory={frontendTradeHistory}
    />
  );
}
