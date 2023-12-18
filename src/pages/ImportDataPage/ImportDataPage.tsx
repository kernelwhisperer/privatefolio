import React from "react"

import { StaggeredList } from "../../components/StaggeredList"
import { Subheading } from "../../components/Subheading"
import { ConnectionsTable } from "./ConnectionsTable"
import { DatabaseInfo } from "./DatabaseInfo"
import { FileImportTable } from "./FileImportTable"
import { ImportDataActions } from "./ImportDataActions"

export function ImportDataPage({ show }: { show: boolean }) {
  return (
    <StaggeredList component="main" gap={2} show={show}>
      <div>
        <Subheading>
          <span>Database info</span>
          <ImportDataActions />
        </Subheading>
        <DatabaseInfo />
      </div>
      <div>
        <Subheading>Connections</Subheading>
        <ConnectionsTable />
      </div>
      <div>
        <Subheading>File imports</Subheading>
        <FileImportTable />
      </div>
    </StaggeredList>
  )
}
