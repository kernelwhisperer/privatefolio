import { Stack } from "@mui/material"
import React from "react"

import { StaggeredList } from "../../components/StaggeredList"
import { Subheading } from "../../components/Subheading"
import { ConnectionsTable } from "./connections/ConnectionsTable"
import { DatabaseInfo } from "./DatabaseInfo"
import { FileImportsTable } from "./file-imports/FileImportsTable"
import { ImportDataActions } from "./ImportDataActions"
import { PortfolioInfo } from "./PortfolioInfo"

export function ImportDataPage({ show }: { show: boolean }) {
  return (
    <StaggeredList component="main" gap={2} show={show}>
      <div>
        <Subheading>
          <span>Database info</span>
          <ImportDataActions />
        </Subheading>
        <Stack direction="row" spacing={1}>
          <DatabaseInfo />
          <PortfolioInfo />
        </Stack>
      </div>
      <div>
        <Subheading>Connections</Subheading>
        <ConnectionsTable />
      </div>
      <div>
        <Subheading>File imports</Subheading>
        <FileImportsTable />
      </div>
    </StaggeredList>
  )
}
