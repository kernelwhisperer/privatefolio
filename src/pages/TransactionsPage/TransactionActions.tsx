import { CallMergeRounded, DownloadRounded, MemoryRounded, MoreHoriz } from "@mui/icons-material"
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from "@mui/material"
import React from "react"
import { exportTransactionsToCsv } from "src/api/account/file-imports/csv-export-utils"
import { Transaction } from "src/interfaces"
import {
  enqueueAutoMerge,
  enqueueExportAllTransactions,
  enqueueIndexTxnsDatabase,
} from "src/utils/common-tasks"
import { downloadCsv } from "src/utils/utils"

interface TransactionActionsProps {
  tableData: Transaction[]
}

export function TransactionActions(props: TransactionActionsProps) {
  const { tableData } = props
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
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
            const data = exportTransactionsToCsv(tableData)
            downloadCsv(data, "transactions.csv")
            handleClose()
          }}
        >
          <ListItemIcon>
            <DownloadRounded fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export table</ListItemText>
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            enqueueExportAllTransactions()
            handleClose()
          }}
        >
          <ListItemIcon>
            <DownloadRounded fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export all transactions</ListItemText>
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            enqueueAutoMerge()
            handleClose()
          }}
        >
          <ListItemIcon>
            <CallMergeRounded fontSize="small" />
          </ListItemIcon>
          <ListItemText>Auto-merge transactions</ListItemText>
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            enqueueIndexTxnsDatabase()
            handleClose()
          }}
        >
          <ListItemIcon>
            <MemoryRounded fontSize="small" />
          </ListItemIcon>
          <ListItemText>Index transactions database</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}
