import { ArrowRightAltRounded, CloseRounded } from "@mui/icons-material"
import {
  Box,
  Button,
  Drawer,
  DrawerProps,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material"
import { useStore } from "@nanostores/react"
import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { AmountBlock } from "src/components/AmountBlock"
import { SectionTitle } from "src/components/SectionTitle"
import { StaggeredList } from "src/components/StaggeredList"
import { TimestampBlock } from "src/components/TimestampBlock"
import { Transaction } from "src/interfaces"
import { $activeAccount, $activeIndex } from "src/stores/account-store"
import { PopoverToggleProps } from "src/stores/app-store"
import { greenColor, redColor } from "src/utils/chart-utils"
import { clancy } from "src/workers/remotes"

type TransactionDrawerProps = DrawerProps &
  PopoverToggleProps & {
    relativeTime: boolean
    tx: Transaction
  }

export function TransactionDrawer(props: TransactionDrawerProps) {
  const { open, toggleOpen, tx, relativeTime, ...rest } = props
  const activeIndex = useStore($activeIndex)

  const {
    incomingN,
    incomingSymbol,
    type,
    timestamp,
    integration,
    wallet,
    priceN,
    outgoingN,
    outgoingSymbol,
    feeN,
    feeSymbol,
    _id,
  } = tx

  const [logsNumber, setLogsNumber] = useState<number | null>(null)

  useEffect(() => {
    if (!open) return

    clancy.findAuditLogsForTxId(_id, $activeAccount.get()).then((logs) => {
      console.log("📜 LOG > clancy.findAuditLogsForTxId > logs:", logs)
      setLogsNumber(logs.length)
    })
  }, [_id, open])

  return (
    <Drawer open={open} onClose={toggleOpen} {...rest}>
      <StaggeredList
        paddingX={2}
        paddingY={1}
        gap={4}
        show={open}
        secondary
        sx={(theme) => ({ minWidth: 358, overflowX: "hidden", ...theme.typography.body2 })}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" letterSpacing="0.025rem">
            Transaction details
          </Typography>
          <IconButton onClick={toggleOpen} edge="end" color="secondary">
            <CloseRounded fontSize="small" />
          </IconButton>
        </Stack>
        <div>
          <SectionTitle>Timestamp</SectionTitle>
          <TimestampBlock timestamp={timestamp} relative={relativeTime} />
        </div>
        <div>
          <SectionTitle>Fee</SectionTitle>
          <Box sx={{ color: redColor }}>
            <AmountBlock amount={feeN ? feeN * -1 : feeN} formatOpts={{ signDisplay: "always" }} />{" "}
            <span>{feeSymbol}</span>
          </Box>
        </div>
        <div>
          <SectionTitle>Cost</SectionTitle>
          <Box sx={{ color: redColor }}>
            <AmountBlock
              amount={outgoingN ? outgoingN * -1 : outgoingN}
              formatOpts={{ signDisplay: "always" }}
            />{" "}
            <span>{outgoingSymbol}</span>
          </Box>
        </div>
        <div>
          <SectionTitle>Price</SectionTitle>
          <AmountBlock amount={priceN} />{" "}
          <span>
            {outgoingSymbol}/{incomingSymbol}
          </span>
        </div>
        <div>
          <SectionTitle>Received</SectionTitle>
          <Box sx={{ color: greenColor }}>
            <AmountBlock amount={incomingN} formatOpts={{ signDisplay: "always" }} />{" "}
            <span>{incomingSymbol}</span>
          </Box>
        </div>
        <div>
          <SectionTitle>Audit logs</SectionTitle>
          {logsNumber === null ? (
            <Skeleton height={20} width={80}></Skeleton>
          ) : (
            <>
              {logsNumber}
              <Button
                size="small"
                color="secondary"
                component={Link}
                to={`/u/${activeIndex}/audit-logs?txId=${_id}`}
                sx={{ marginLeft: 2 }}
                // onClick={toggleOpen}
                endIcon={<ArrowRightAltRounded fontSize="inherit" />}
              >
                Inspect
              </Button>
            </>
          )}
        </div>
        {/* type */}
        {/* wallet */}
        {/* integration */}
        {/* <pre>{JSON.stringify(tx, null, 2)}</pre> */}
      </StaggeredList>
    </Drawer>
  )
}
