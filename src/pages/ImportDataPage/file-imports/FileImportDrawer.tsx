import { CloseRounded } from "@mui/icons-material"
import { LoadingButton } from "@mui/lab"
import {
  Avatar,
  Drawer,
  DrawerProps,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material"
import { useStore } from "@nanostores/react"
import React, { MouseEvent, useState } from "react"
import { AmountBlock } from "src/components/AmountBlock"
import { FileSizeBlock } from "src/components/FileSizeBlock"
import { IdentifierBlock } from "src/components/IdentifierBlock"
import { PlatformAvatar } from "src/components/PlatformAvatar"
import { SectionTitle } from "src/components/SectionTitle"
import { StaggeredList } from "src/components/StaggeredList"
import { TimestampBlock } from "src/components/TimestampBlock"
import { useConfirm } from "src/hooks/useConfirm"
import { FileImport } from "src/interfaces"
import { PARSERS_META, PLATFORMS_META } from "src/settings"
import { $activeAccount } from "src/stores/account-store"
import { PopoverToggleProps } from "src/stores/app-store"
import { $platformMetaMap } from "src/stores/metadata-store"
import { enqueueTask, TaskPriority } from "src/stores/task-store"
import { handleAuditLogChange } from "src/utils/common-tasks"
import { clancy } from "src/workers/remotes"

type FileImportDrawerProps = DrawerProps &
  PopoverToggleProps & {
    fileImport: FileImport
    relativeTime: boolean
  }

export function FileImportDrawer(props: FileImportDrawerProps) {
  const { open, toggleOpen, fileImport, relativeTime, ...rest } = props

  // const activeIndex = useStore($activeIndex)
  const platformMetaMap = useStore($platformMetaMap)

  const { _id, timestamp, meta, name, lastModified, size } = fileImport

  const parserId = meta?.integration

  // const [logsNumber, setLogsNumber] = useState<number | null>(null)

  // useEffect(() => {
  //   if (!open) return

  //   clancy.findAuditLogsForTxId(_id, $activeAccount.get()).then((logs) => {
  //     setLogsNumber(logs.length)
  //   })
  // }, [_id, open])

  const confirm = useConfirm()
  const [loading, setLoading] = useState(false)

  async function handleRemove(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()

    const { confirmed } = await confirm({
      content: (
        <>
          All audit logs and transactions linked to this file import will be deleted.
          <br /> This action is permanent. Are you sure you wish to continue?
        </>
      ),
      title: "Remove file import",
      variant: "warning",
    })

    if (!confirmed) return

    setLoading(true)
    enqueueTask({
      description: `Remove "${fileImport.name}", alongside its audit logs and transactions.`,
      determinate: true,
      function: async (progress) => {
        try {
          const logsChanged = await clancy.removeFileImport(
            fileImport,
            progress,
            $activeAccount.get()
          )
          if (logsChanged > 0) {
            handleAuditLogChange()
          }
        } finally {
          // setLoading(false)
        }
      },
      name: `Remove file import`,
      priority: TaskPriority.VeryHigh,
    })
  }

  return (
    <Drawer open={open} onClose={toggleOpen} {...rest}>
      <StaggeredList
        paddingX={2}
        paddingY={1}
        gap={2}
        show={open}
        secondary
        sx={(theme) => ({ overflowX: "hidden", width: 359, ...theme.typography.body2 })}
      >
        <Stack marginBottom={2} direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" letterSpacing="0.025rem">
            File import details
          </Typography>
          <IconButton onClick={toggleOpen} edge="end" color="secondary">
            <CloseRounded fontSize="small" />
          </IconButton>
        </Stack>
        <div>
          <SectionTitle>Identifier</SectionTitle>
          <IdentifierBlock id={_id} />
        </div>
        <div>
          <SectionTitle>File</SectionTitle>
          <Stack gap={0.5}>
            <IdentifierBlock id={name} />
            <Typography variant="caption">
              <TimestampBlock timestamp={lastModified} relative={false} hideTime />
              {" • "}
              <FileSizeBlock size={size} />
            </Typography>
          </Stack>
        </div>
        <div>
          <SectionTitle>Integration</SectionTitle>
          {!parserId ? (
            <Skeleton height={20} width={80} />
          ) : (
            <>
              <Stack direction="row" alignItems={"center"} gap={0.5}>
                <PlatformAvatar
                  size="small"
                  src={`/app-images/integrations/${parserId.split("-")[0].toLowerCase()}.svg`}
                  alt={parserId}
                />
                {PARSERS_META[parserId].name}
              </Stack>
            </>
          )}
        </div>
        <div>
          <SectionTitle>Imported</SectionTitle>
          <TimestampBlock timestamp={timestamp} relative={relativeTime} />
        </div>
        <div>
          <SectionTitle>Platform</SectionTitle>
          {!meta ? (
            <Skeleton height={20} width={80} />
          ) : (
            <Stack direction="row" gap={0.5} alignItems="center" component="div">
              <Avatar
                src={platformMetaMap[meta.platform]?.image}
                sx={{
                  borderRadius: "2px",
                  height: 16,
                  width: 16,
                }}
                alt={PLATFORMS_META[meta.platform].name}
              />
              <span>{PLATFORMS_META[meta.platform].name}</span>
            </Stack>
          )}
        </div>
        <div>
          <SectionTitle>Audit logs</SectionTitle>
          {!meta ? <Skeleton height={20} width={80} /> : <AmountBlock amount={meta.logs} />}
        </div>
        <div>
          <SectionTitle>Transactions</SectionTitle>
          {!meta ? <Skeleton height={20} width={80} /> : <AmountBlock amount={meta.transactions} />}
        </div>
        <div>
          <SectionTitle>Actions</SectionTitle>
          <Tooltip
            title={
              loading ? "Removing..." : "This will remove all its transactions and audit logs too"
            }
          >
            <span>
              <LoadingButton
                size="small"
                variant="outlined"
                color="error"
                onClick={handleRemove}
                loading={loading}
              >
                Remove file import
              </LoadingButton>
            </span>
          </Tooltip>
        </div>

        {/* assets */}
        {/* operations */}
        {/* wallets */}
        {/* integration */}

        {/* <pre>{JSON.stringify(txMeta, null, 2)}</pre> */}
        {/* <pre>{JSON.stringify(fileImport, null, 2)}</pre> */}
      </StaggeredList>
    </Drawer>
  )
}
