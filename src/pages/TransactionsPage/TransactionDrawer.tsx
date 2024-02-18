import { ArrowRightAltRounded, CloseRounded } from "@mui/icons-material"
import {
  Avatar,
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
import { ActionBlock } from "src/components/ActionBlock"
import { AmountBlock } from "src/components/AmountBlock"
import { ExternalLink } from "src/components/ExternalLink"
import { SectionTitle } from "src/components/SectionTitle"
import { TimestampBlock } from "src/components/TimestampBlock"
import { EtherscanTransaction, Transaction } from "src/interfaces"
import { PLATFORMS_META } from "src/settings"
import { $activeAccount, $activeIndex } from "src/stores/account-store"
import { PopoverToggleProps } from "src/stores/app-store"
import { $platformMetaMap } from "src/stores/metadata-store"
import { MonoFont } from "src/theme"
import { getAssetTicker } from "src/utils/assets-utils"
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
  const platformMetaMap = useStore($platformMetaMap)

  const {
    incoming,
    incomingAsset,
    type,
    timestamp,
    platform,
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

  const method = (tx as EtherscanTransaction).method

  const [logsNumber, setLogsNumber] = useState<number | null>(null)

  useEffect(() => {
    if (!open) return

    clancy.findAuditLogsForTxId(_id, $activeAccount.get()).then((logs) => {
      setLogsNumber(logs.length)
    })
  }, [_id, open])

  return (
    <Drawer open={open} onClose={toggleOpen} {...rest}>
      <Stack
        // config={SPRING_CONFIGS.ultra}
        paddingX={2}
        paddingY={1}
        gap={2}
        // show={open}
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
          <SectionTitle>Platform</SectionTitle>
          <Stack direction="row" gap={0.5} alignItems="center" component="div">
            <Avatar
              src={platformMetaMap[platform]?.image}
              sx={{
                borderRadius: "2px",
                height: 16,
                width: 16,
              }}
              alt={PLATFORMS_META[platform].name}
            />
            <span>{PLATFORMS_META[platform].name}</span>
          </Stack>
        </div>
        <div>
          <SectionTitle>Wallet</SectionTitle>
          {wallet}
        </div>
        <div>
          <SectionTitle>Type</SectionTitle>
          <ActionBlock action={type} />
        </div>
        {method && (
          <div>
            <SectionTitle>Smart Contract Method</SectionTitle>
            <ActionBlock action={method} />
          </div>
        )}
        <div>
          <SectionTitle>Timestamp</SectionTitle>
          <TimestampBlock timestamp={timestamp} relative={relativeTime} />
        </div>
        {feeAsset && (
          <div>
            <SectionTitle>Fee</SectionTitle>
            <AmountBlock
              colorized
              amount={fee}
              showTicker
              showSign
              currencyTicker={getAssetTicker(feeAsset)}
            />
          </div>
        )}
        {outgoingAsset && (
          <div>
            <SectionTitle>Outgoing</SectionTitle>
            <AmountBlock
              colorized
              amount={outgoing ? `-${outgoing}` : outgoing}
              showTicker
              showSign
              currencyTicker={getAssetTicker(outgoingAsset)}
            />
          </div>
        )}
        {price && (
          <div>
            <SectionTitle>Price</SectionTitle>
            <AmountBlock
              colorized
              amount={price}
              currencyTicker={`${getAssetTicker(outgoingAsset)}/${getAssetTicker(incomingAsset)}`}
            />
          </div>
        )}
        {incomingAsset && (
          <div>
            <SectionTitle>Incoming</SectionTitle>
            <AmountBlock
              colorized
              amount={incoming}
              showTicker
              showSign
              currencyTicker={getAssetTicker(incomingAsset)}
            />
          </div>
        )}
        <div>
          <SectionTitle>Audit logs</SectionTitle>
          {logsNumber === null ? (
            <Skeleton height={20} width={80} />
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
      </Stack>
    </Drawer>
  )
}
