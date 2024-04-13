import {
  CalculateOutlined,
  DownloadRounded,
  MemoryRounded,
  MoreHoriz,
  Paid,
  PaidOutlined,
} from "@mui/icons-material"
import {
  IconButton,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
} from "@mui/material"
import { useStore } from "@nanostores/react"
import React, { MutableRefObject, useState } from "react"
import { exportAuditLogsToCsv } from "src/api/account/file-imports/csv-export-utils"
import { AuditLog } from "src/interfaces"
import { $showQuotedAmounts } from "src/stores/account-settings-store"
import { $activeAccount } from "src/stores/account-store"
import {
  enqueueExportAllAuditLogs,
  enqueueIndexAuditLogsDatabase,
  enqueueRecomputeBalances,
} from "src/utils/common-tasks"
import { downloadCsv } from "src/utils/utils"

interface AuditLogsActionsProps {
  tableDataRef: MutableRefObject<AuditLog[]>
}

export function AuditLogActions(props: AuditLogsActionsProps) {
  const { tableDataRef } = props
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const showQuotedAmounts = useStore($showQuotedAmounts)

  return (
    <Stack direction="row">
      <Tooltip
        title={showQuotedAmounts ? "Show amounts in Base Asset" : "Show amounts in Quote Currency"}
      >
        <IconButton
          color="secondary"
          onClick={() => {
            $showQuotedAmounts.set(!showQuotedAmounts)
          }}
        >
          {showQuotedAmounts ? <Paid fontSize="small" /> : <PaidOutlined fontSize="small" />}
        </IconButton>
      </Tooltip>
      <Tooltip title="Actions">
        <IconButton color="secondary" onClick={handleClick}>
          <MoreHoriz fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
      >
        <MenuItem
          dense
          onClick={() => {
            const data = exportAuditLogsToCsv(tableDataRef.current)
            downloadCsv(data, `${$activeAccount.get()}-audit-logs.csv`)
            handleClose()
          }}
        >
          <ListItemAvatar>
            <DownloadRounded fontSize="small" />
          </ListItemAvatar>
          <ListItemText>Export table</ListItemText>
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            enqueueExportAllAuditLogs()
            handleClose()
          }}
        >
          <ListItemAvatar>
            <DownloadRounded fontSize="small" />
          </ListItemAvatar>
          <ListItemText>Export all audit logs</ListItemText>
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            enqueueRecomputeBalances()
            handleClose()
          }}
        >
          <ListItemAvatar>
            <CalculateOutlined fontSize="small" />
          </ListItemAvatar>
          <ListItemText>Recompute balances</ListItemText>
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            enqueueIndexAuditLogsDatabase()
            handleClose()
          }}
        >
          <ListItemAvatar>
            <MemoryRounded fontSize="small" />
          </ListItemAvatar>
          <ListItemText>Index audit logs database</ListItemText>
        </MenuItem>
      </Menu>
    </Stack>
  )
}
