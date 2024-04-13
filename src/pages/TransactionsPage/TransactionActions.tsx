import {
  CallMergeRounded,
  DownloadRounded,
  MemoryRounded,
  MoreHoriz,
  Paid,
  PaidOutlined,
  RemoveCircle,
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
import React, { MutableRefObject } from "react"
import { exportTransactionsToCsv } from "src/api/account/file-imports/csv-export-utils"
import { Transaction } from "src/interfaces"
import { $showQuotedAmounts } from "src/stores/account-settings-store"
import { $activeAccount } from "src/stores/account-store"
import {
  enqueueAutoMerge,
  enqueueDetectSpamTransactions,
  enqueueExportAllTransactions,
  enqueueIndexTxnsDatabase,
} from "src/utils/common-tasks"
import { downloadCsv } from "src/utils/utils"

interface TransactionActionsProps {
  tableDataRef: MutableRefObject<Transaction[]>
}

export function TransactionActions(props: TransactionActionsProps) {
  const { tableDataRef } = props
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
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
            const data = exportTransactionsToCsv(tableDataRef.current)
            downloadCsv(data, `${$activeAccount.get()}-transactions.csv`)
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
            enqueueExportAllTransactions()
            handleClose()
          }}
        >
          <ListItemAvatar>
            <DownloadRounded fontSize="small" />
          </ListItemAvatar>
          <ListItemText>Export all transactions</ListItemText>
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            enqueueAutoMerge()
            handleClose()
          }}
        >
          <ListItemAvatar>
            <CallMergeRounded fontSize="small" />
          </ListItemAvatar>
          <ListItemText>Auto-merge transactions</ListItemText>
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            enqueueDetectSpamTransactions()
            handleClose()
          }}
        >
          <ListItemAvatar>
            <RemoveCircle fontSize="small" />
          </ListItemAvatar>
          <ListItemText>Detect spam transactions</ListItemText>
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            enqueueIndexTxnsDatabase()
            handleClose()
          }}
        >
          <ListItemAvatar>
            <MemoryRounded fontSize="small" />
          </ListItemAvatar>
          <ListItemText>Index transactions database</ListItemText>
        </MenuItem>
      </Menu>
    </Stack>
  )
}
