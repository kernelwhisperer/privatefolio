import { ArrowRightAltRounded, CloseRounded } from "@mui/icons-material"
import {
  Avatar,
  Box,
  Button,
  Chip,
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
import { ExternalLink } from "src/components/ExternalLink"
import { SectionTitle } from "src/components/SectionTitle"
import { StaggeredList } from "src/components/StaggeredList"
import { TimestampBlock } from "src/components/TimestampBlock"
import { Truncate } from "src/components/Truncate"
import { Transaction } from "src/interfaces"
import { INTEGRATIONS } from "src/settings"
import { $activeAccount, $activeIndex } from "src/stores/account-store"
import { PopoverToggleProps } from "src/stores/app-store"
import { $integrationMetaMap } from "src/stores/metadata-store"
import { MonoFont } from "src/theme"
import { getAssetSymbol } from "src/utils/assets-utils"
import { greenColor, redColor } from "src/utils/chart-utils"
import { formatHex, getExplorerLink } from "src/utils/utils"
import { clancy } from "src/workers/remotes"

type TransactionDrawerProps = DrawerProps &
  PopoverToggleProps & {
    relativeTime: boolean
    tx: Transaction
  }

export function TransactionDrawer(props: TransactionDrawerProps) {
  const { open, toggleOpen, tx, relativeTime, ...rest } = props
  const activeIndex = useStore($activeIndex)
  const integrationMap = useStore($integrationMetaMap)

  const {
    incoming,
    incomingAsset,
    type,
    timestamp,
    integration,
    wallet,
    price,
    outgoing,
    outgoingAsset,
    fee,
    feeAsset,
    _id,
    txHash,
    ...txMeta
  } = tx

  const [logsNumber, setLogsNumber] = useState<number | null>(null)

  useEffect(() => {
    if (!open) return

    clancy.findAuditLogsForTxId(_id, $activeAccount.get()).then((logs) => {
      setLogsNumber(logs.length)
    })
  }, [_id, open])

  return (
    <Drawer open={open} onClose={toggleOpen} {...rest}>
      <StaggeredList
        paddingX={2}
        paddingY={1}
        gap={2}
        show={open}
        secondary
        sx={(theme) => ({ minWidth: 358, overflowX: "hidden", ...theme.typography.body2 })}
      >
        <Stack marginBottom={2} direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" letterSpacing="0.025rem">
            Transaction details
          </Typography>
          <IconButton onClick={toggleOpen} edge="end" color="secondary">
            <CloseRounded fontSize="small" />
          </IconButton>
        </Stack>
        <div>
          <SectionTitle>Integration</SectionTitle>
          <Stack direction="row" gap={0.5} alignItems="center" component="div">
            <Avatar
              src={integrationMap[integration]?.image}
              sx={{
                borderRadius: "2px",
                height: 16,
                width: 16,
              }}
              alt={INTEGRATIONS[integration]}
            />
            <span>{INTEGRATIONS[integration]}</span>
          </Stack>
        </div>
        <div>
          <SectionTitle>Wallet</SectionTitle>
          {wallet}
        </div>
        <div>
          <SectionTitle>Type</SectionTitle>
          <Chip
            size="small"
            // sx={{ background: alpha(color, 0.075) }}
            label={
              <Stack direction="row" gap={0.5} alignItems="center" paddingRight={0.5}>
                {/* {TypeIconComponent && <TypeIconComponent sx={{ color, fontSize: "inherit" }} />} */}
                <Truncate>{type}</Truncate>
              </Stack>
            }
          />
        </div>
        <div>
          <SectionTitle>Timestamp</SectionTitle>
          <TimestampBlock timestamp={timestamp} relative={relativeTime} />
        </div>
        <div>
          <SectionTitle>Fee</SectionTitle>
          <Box sx={{ color: redColor }}>
            <AmountBlock amount={fee} formatOpts={{ signDisplay: "always" }} />{" "}
            <span>{getAssetSymbol(feeAsset)}</span>
          </Box>
        </div>
        <div>
          <SectionTitle>Cost</SectionTitle>
          <Box sx={{ color: redColor }}>
            <AmountBlock
              amount={outgoing ? `-${outgoing}` : outgoing}
              formatOpts={{ signDisplay: "always" }}
            />{" "}
            <span>{getAssetSymbol(outgoingAsset)}</span>
          </Box>
        </div>
        {price && (
          <div>
            <SectionTitle>Price</SectionTitle>
            <AmountBlock amount={price} />{" "}
            <span>
              {getAssetSymbol(outgoingAsset)}/{getAssetSymbol(incomingAsset)}
            </span>
          </div>
        )}
        <div>
          <SectionTitle>Received</SectionTitle>
          <Box sx={{ color: greenColor }}>
            <AmountBlock amount={incoming} formatOpts={{ signDisplay: "always" }} />{" "}
            <span>{getAssetSymbol(incomingAsset)}</span>
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
        {txHash && (
          <div>
            <SectionTitle>Blockchain Tx</SectionTitle>
            <ExternalLink href={getExplorerLink(0, txHash, "tx")} fontFamily={MonoFont}>
              <span>{formatHex(txHash)}</span>
            </ExternalLink>
          </div>
        )}
        {/* <pre>{JSON.stringify(txMeta, null, 2)}</pre> */}
        {/* <pre>{JSON.stringify(tx, null, 2)}</pre> */}
      </StaggeredList>
    </Drawer>
  )
}
