import { Typography } from "@mui/material"
import React from "react"

import { StaggeredList } from "../../components/StaggeredList"
import { SerifFont } from "../../theme"
import { TransactionTable } from "./TransactionTable"

export function TransactionsPage({ show }: { show: boolean }) {
  return (
    <StaggeredList gap={1} show={show}>
      <Typography variant="h6" fontFamily={SerifFont}>
        Transactions
      </Typography>
      <TransactionTable />
    </StaggeredList>
  )
}
