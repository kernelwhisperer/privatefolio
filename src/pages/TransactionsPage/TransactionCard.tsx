import React from "react"

import { Asset } from "../../interfaces"
import { Transaction, TransactionType } from "../../interfaces"
import { BuyTransaction } from "./Transactions/BuyTransaction"
import { SellTransaction } from "./Transactions/SellTransaction"

interface TransactionCardProps {
  assetMap: Record<string, Asset>
  tx: Transaction
}

const COMPONENTS: Record<TransactionType, React.ElementType> = {
  Buy: BuyTransaction,
  Sell: SellTransaction,
}

export function TransactionCard(props: TransactionCardProps) {
  const Component = COMPONENTS[props.tx.type]
  return <Component {...props} />
}
