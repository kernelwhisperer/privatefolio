import { Visibility } from "@mui/icons-material"
import { IconButton, Skeleton, Stack, TableCell, TableRow, Tooltip } from "@mui/material"
import { useStore } from "@nanostores/react"
import React from "react"
import { IntegrationAvatar } from "src/components/IntegrationAvatar"
import { TimestampBlock } from "src/components/TimestampBlock"
import { Truncate } from "src/components/Truncate"
import { useBoolean } from "src/hooks/useBoolean"
import { FileImport } from "src/interfaces"
import { INTEGRATIONS } from "src/settings"
import { $integrationMetaMap } from "src/stores/metadata-store"
import { MonoFont } from "src/theme"
import { formatFileSize, formatNumber } from "src/utils/formatting-utils"
import { TableRowComponentProps } from "src/utils/table-utils"

import { FileImportDrawer } from "./FileImportDrawer"

export function FileImportTableRow(props: TableRowComponentProps<FileImport>) {
  const { row, relativeTime, headCells: _headCells, isMobile: _isMobile, isTablet, ...rest } = props
  const { name, meta, timestamp, lastModified, size } = row
  const integration = meta?.integration

  const integrationMap = useStore($integrationMetaMap)

  const { value: open, toggle: toggleOpen } = useBoolean(false)

  if (isTablet) {
    return (
      <TableRow hover {...rest}>
        <TableCell sx={{ width: "100%" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack gap={0.5}>
              <Stack direction="row" gap={1} alignItems="center" component="div">
                {integration ? (
                  <IntegrationAvatar
                    size="small"
                    src={integrationMap[integration]?.image}
                    alt={INTEGRATIONS[integration]}
                  />
                ) : (
                  <Skeleton></Skeleton>
                )}
                <Tooltip title={name}>
                  <Truncate>{name}</Truncate>
                </Tooltip>
              </Stack>
              <Stack
                direction="row"
                gap={1}
                alignItems="center"
                component="div"
                sx={{ color: "text.secondary", fontSize: "0.75rem" }}
              >
                <TimestampBlock timestamp={timestamp} relative={relativeTime} />
                {" • "}
                <Tooltip
                  title={
                    <Stack>
                      <span>{formatFileSize(size, true)}</span>
                      <i className="secondary">
                        <span>{formatNumber(size)} Bytes</span>
                      </i>
                    </Stack>
                  }
                >
                  <span>{formatFileSize(size)}</span>
                </Tooltip>
              </Stack>
            </Stack>
            <Stack gap={0.5} alignItems={"flex-end"} sx={{ fontSize: "0.75rem" }}>
              {!meta ? (
                <Skeleton></Skeleton>
              ) : (
                <>
                  {meta.logs === meta.rows ? (
                    <span>{formatNumber(meta.logs)} audit logs</span>
                  ) : (
                    <Tooltip
                      title={`${formatNumber(meta.logs)} audit logs extracted from ${formatNumber(
                        meta.rows
                      )} document entries`}
                    >
                      <span>{formatNumber(meta.logs)}</span>
                    </Tooltip>
                  )}
                </>
              )}
              {!meta ? (
                <Skeleton></Skeleton>
              ) : (
                <>
                  <Tooltip
                    title={`${formatNumber(
                      meta.transactions
                    )} transactions extracted from ${formatNumber(meta.rows)} document entries`}
                  >
                    <span>{formatNumber(meta.transactions)} txns</span>
                  </Tooltip>
                </>
              )}
            </Stack>
          </Stack>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <>
      <TableRow hover {...rest}>
        <TableCell sx={{ maxWidth: 180, minWidth: 180, width: 180 }}>
          <TimestampBlock timestamp={timestamp} relative={relativeTime} />
        </TableCell>
        <TableCell sx={{ maxWidth: 160, minWidth: 160, width: 140 }}>
          {integration ? (
            <Stack direction="row" gap={0.5} alignItems="center" component="div">
              <IntegrationAvatar
                size="small"
                src={integrationMap[integration]?.image}
                alt={INTEGRATIONS[integration]}
              />
              <span>{INTEGRATIONS[integration]}</span>
            </Stack>
          ) : (
            <Skeleton></Skeleton>
          )}
        </TableCell>
        <TableCell sx={{ maxWidth: 200, minWidth: 200, width: 200 }}>
          <Tooltip title={name}>
            <Truncate>{name}</Truncate>
          </Tooltip>
        </TableCell>
        <TableCell
          sx={{ fontFamily: MonoFont, maxWidth: 120, minWidth: 120, width: 120 }}
          align="right"
        >
          <Tooltip
            title={
              <Stack>
                <span>{formatFileSize(size, true)}</span>
                <i className="secondary">
                  <span>{formatNumber(size)} Bytes</span>
                </i>
              </Stack>
            }
          >
            <span>{formatFileSize(size)}</span>
          </Tooltip>
        </TableCell>
        <TableCell sx={{ maxWidth: 180, minWidth: 180, width: 180 }}>
          <TimestampBlock timestamp={lastModified} relative={relativeTime} />
        </TableCell>
        <TableCell
          sx={{ fontFamily: MonoFont, maxWidth: 128, minWidth: 128, width: 128 }}
          align="right"
        >
          {!meta ? (
            <Skeleton></Skeleton>
          ) : (
            <>
              {meta.logs === meta.rows ? (
                <span>{formatNumber(meta.logs)}</span>
              ) : (
                <Tooltip
                  title={`${formatNumber(meta.logs)} audit logs extracted from ${formatNumber(
                    meta.rows
                  )} document entries`}
                >
                  <span>{formatNumber(meta.logs)}</span>
                </Tooltip>
              )}
            </>
          )}
        </TableCell>
        <TableCell
          sx={{ fontFamily: MonoFont, maxWidth: 120, minWidth: 120, width: 120 }}
          align="right"
        >
          {!meta ? (
            <Skeleton></Skeleton>
          ) : (
            <>
              <Tooltip
                title={`${formatNumber(
                  meta.transactions
                )} transactions extracted from ${formatNumber(meta.rows)} document entries`}
              >
                <span>{formatNumber(meta.transactions)}</span>
              </Tooltip>
            </>
          )}
        </TableCell>
        <TableCell sx={{ maxWidth: 40, minWidth: 40, width: 40 }}>
          <Tooltip title="Inspect">
            <IconButton
              size="small"
              color="secondary"
              sx={{
                ".MuiTableRow-root:hover &": {
                  visibility: "visible",
                },
                height: 28,
                marginLeft: -1,
                visibility: "hidden",
              }}
              onClick={toggleOpen}
            >
              <Visibility fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
      <FileImportDrawer
        key={row._id}
        open={open}
        toggleOpen={toggleOpen}
        fileImport={row}
        relativeTime={relativeTime}
      />
    </>
  )
}
