import React from "react"

import { Asset, AuditLog } from "../../interfaces"
import { DefaultAuditLogCard } from "./Cards/DefaultAuditLogCard"

interface TransactionCardProps {
  assetMap: Record<string, Asset>
  auditLog: AuditLog
}

// const COMPONENTS: Record<TransactionType, React.ElementType> = {
//   Buy: BuyTransaction,
//   Sell: SellTransaction,
// }

export function AuditLogCard(props: TransactionCardProps) {
  // const Component = COMPONENTS[props.auditLog.type] || DefaultAuditLogCard
  const Component = DefaultAuditLogCard
  return <Component {...props} />
}
