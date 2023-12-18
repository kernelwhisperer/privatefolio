import { Skeleton, Stack } from "@mui/material"
import React from "react"

export function TableSkeleton() {
  return (
    <Stack gap={1.5}>
      <Stack direction="row" gap={1.5}>
        <Skeleton variant="rounded" height={56} width={240}></Skeleton>
        <Skeleton variant="rounded" height={56} width={240}></Skeleton>
        <Skeleton variant="rounded" height={56} width={240}></Skeleton>
      </Stack>
      <Skeleton variant="rounded" height={37}></Skeleton>
      <Skeleton variant="rounded" height={37}></Skeleton>
      <Skeleton variant="rounded" height={37}></Skeleton>
      <Skeleton variant="rounded" height={37}></Skeleton>
    </Stack>
  )
}
