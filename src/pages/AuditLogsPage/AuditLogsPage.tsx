import React from "react"

import { StaggeredList } from "../../components/StaggeredList"
import { Subheading } from "../../components/Subheading"
import { AuditLogTable } from "./AuditLogTable"

export function AuditLogsPage({ show }: { show: boolean }) {
  return (
    <StaggeredList component="main" gap={2} show={show}>
      <div>
        <Subheading>
          <span>Audit logs</span>
          {/* <AuditLogActions /> */}
        </Subheading>
        <AuditLogTable />
      </div>
    </StaggeredList>
  )
}
