import { Stack } from "@mui/material"
import React from "react"
import { useSearchParams } from "react-router-dom"
import { NavTab } from "src/components/NavTab"
import { Tabs } from "src/components/Tabs"

import { StaggeredList } from "../../components/StaggeredList"
import { ConnectionsTable } from "./connections/ConnectionsTable"
import { DatabaseInfo } from "./DatabaseInfo"
import { FileImportsTable } from "./file-imports/FileImportsTable"
import { ImportDataActions } from "./ImportDataActions"
import { PortfolioInfo } from "./PortfolioInfo"

const defaultTab = "connections"

export default function ImportDataPage({ show }: { show: boolean }) {
  const [searchParams] = useSearchParams()
  const tab = searchParams.get("tab") || defaultTab

  return (
    <StaggeredList component="main" gap={2} show={show}>
      <Stack>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Tabs value={tab} defaultValue={defaultTab} largeSize>
            <NavTab value="connections" to={"?tab=connections"} label="Connections" />
            <NavTab value="file-imports" to={"?tab=file-imports"} label="File imports" />
            <NavTab value="database-info" to={"?tab=database-info"} label="Database Info" />
          </Tabs>
          <ImportDataActions />
        </Stack>
        {tab === "file-imports" && <FileImportsTable />}
        {tab === "connections" && <ConnectionsTable />}
        {tab === "database-info" && (
          <Stack direction={{ md: "row" }} gap={1}>
            <DatabaseInfo />
            <PortfolioInfo />
          </Stack>
        )}
      </Stack>
    </StaggeredList>
  )
}
