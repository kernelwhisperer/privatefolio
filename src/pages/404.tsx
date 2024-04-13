import { Typography } from "@mui/material"
import React from "react"
import { StaggeredList } from "src/components/StaggeredList"
import { Subheading } from "src/components/Subheading"

export default function FourZeroFourPage({ show }: { show: boolean }) {
  return (
    <StaggeredList component="main" gap={2} show={show}>
      <Subheading>Page not found</Subheading>
      <Typography paddingX={2} color="text.secondary">
        We cannot find the page you are looking for.
      </Typography>
    </StaggeredList>
  )
}
