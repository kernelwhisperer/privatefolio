import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded"
import { ListItemIcon, ListItemText, Stack } from "@mui/material"
import React from "react"
import { downloadCsv } from "src/utils/utils"

export type CsvData = (string | number | undefined)[][]

interface ExportToCsvProps {
  data: CsvData
  filename: string
  text: string
}
export default function ExportToCsv(props: ExportToCsvProps) {
  const { data, filename, text } = props

  return (
    <>
      <Stack
        direction="row"
        onClick={() => {
          downloadCsv(data, filename)
        }}
      >
        <ListItemIcon>
          <DownloadRoundedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>{text}</ListItemText>
      </Stack>
    </>
  )
}
