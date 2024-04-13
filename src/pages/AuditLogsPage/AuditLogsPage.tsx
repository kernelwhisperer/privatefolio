import { Stack } from "@mui/material"
import React, { useRef } from "react"
import { useSearchParams } from "react-router-dom"
import { Subheading } from "src/components/Subheading"
import { AuditLog } from "src/interfaces"

import { StaggeredList } from "../../components/StaggeredList"
import { AuditLogActions } from "./AuditLogActions"
import { AuditLogTable } from "./AuditLogTable"

export default function AuditLogsPage({ show }: { show: boolean }) {
  const [searchParams] = useSearchParams()
  const txId = searchParams.get("txId") || undefined

  const tableDataRef = useRef<AuditLog[]>([])

  return (
    <StaggeredList component="main" gap={2} show={show}>
      <div>
        <Stack direction="row" justifyContent="space-between">
          <Subheading>Audit logs</Subheading>
          <AuditLogActions tableDataRef={tableDataRef} />
        </Stack>
        <AuditLogTable txId={txId} tableDataRef={tableDataRef} />
      </div>
    </StaggeredList>
  )
}
