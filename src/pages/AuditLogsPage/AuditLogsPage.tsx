import { Stack, Typography } from "@mui/material"
import React from "react"

import { StaggeredList } from "../../components/StaggeredList"
import { SerifFont } from "../../theme"
import { AuditLogActions } from "./AuditLogActions"
import { AuditLogTable } from "./AuditLogTable"

export function AuditLogsPage({ show }: { show: boolean }) {
  return (
    <StaggeredList gap={1} show={show}>
      <div>
        <Typography variant="h6" fontFamily={SerifFont}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ marginX: 2 }}
          >
            <span>Audit logs</span>
            <AuditLogActions />
          </Stack>
        </Typography>
        <AuditLogTable />
      </div>
    </StaggeredList>
  )
}
