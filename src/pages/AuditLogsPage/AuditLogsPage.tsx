import React from "react"
import { useSearchParams } from "react-router-dom"

import { StaggeredList } from "../../components/StaggeredList"
import { Subheading } from "../../components/Subheading"
import { AuditLogTable } from "./AuditLogTable"

export default function AuditLogsPage({ show }: { show: boolean }) {
  const [searchParams] = useSearchParams()
  const txId = searchParams.get("txId") || undefined

  return (
    <StaggeredList component="main" gap={2} show={show}>
      <div>
        <Subheading>
          <span>Audit logs</span>
          {/* <AuditLogActions /> */}
        </Subheading>
        <AuditLogTable txId={txId} />
      </div>
    </StaggeredList>
  )
}
