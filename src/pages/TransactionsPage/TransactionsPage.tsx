import { Stack } from "@mui/material"
import React, { useRef } from "react"
import { useSearchParams } from "react-router-dom"
import { Subheading } from "src/components/Subheading"
import { Transaction } from "src/interfaces"

import { StaggeredList } from "../../components/StaggeredList"
import { TransactionActions } from "./TransactionActions"
import { TransactionTable } from "./TransactionTable"

export default function TransactionsPage({ show }: { show: boolean }) {
  const [searchParams] = useSearchParams()
  const txId = searchParams.get("id") || undefined

  const tableDataRef = useRef<Transaction[]>([])

  return (
    <StaggeredList component="main" gap={2} show={show}>
      <div>
        <Stack direction="row" justifyContent="space-between">
          <Subheading>Transactions</Subheading>
          <TransactionActions tableDataRef={tableDataRef} />
        </Stack>
        <TransactionTable txId={txId} tableDataRef={tableDataRef} />
      </div>
    </StaggeredList>
  )
}
