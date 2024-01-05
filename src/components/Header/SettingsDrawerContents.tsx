import { CloseRounded, GitHub, OpenInNew, Telegram, Twitter } from "@mui/icons-material"
import {
  FormControlLabel,
  IconButton,
  Link as MuiLink,
  MenuItem,
  Stack,
  Switch,
  Typography,
} from "@mui/material"
import { useStore } from "@nanostores/react"
import React from "react"
import { GIT_DATE } from "src/settings"
import { formatDate, formatHour } from "src/utils/formatting-utils"

import { $debugMode, $telemetry, AppVerProps, PopoverToggleProps } from "../../stores/app-store"
import { MonoFont } from "../../theme"
import { SectionTitle } from "../SectionTitle"
import { StaggeredList } from "../StaggeredList"
import { ReducedMotion } from "./ReducedMotion"
import { ThemeMode } from "./ThemeMode"

const CustomLink = ({ children, ...rest }: any) => (
  <MenuItem component={MuiLink} tabIndex={0} role="button" sx={{ borderRadius: 0.5 }} {...rest}>
    <Typography
      variant="h6"
      component="div"
      fontWeight={500}
      sx={{
        alignItems: "center",
        display: "flex",
        gap: 1,
      }}
    >
      {children}
    </Typography>
  </MenuItem>
)

type MenuContentsProps = AppVerProps & PopoverToggleProps

export const SettingsDrawerContents = ({
  appVer,
  gitHash,
  open,
  toggleOpen,
}: MenuContentsProps) => {
  const debugMode = useStore($debugMode)
  const telemetry = useStore($telemetry)

  return (
    <StaggeredList
      paddingX={2}
      paddingY={1}
      gap={4}
      show={open}
      secondary
      sx={{ overflowX: "hidden" }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1" letterSpacing="0.025rem">
          Settings
        </Typography>
        <IconButton onClick={toggleOpen} edge="end" color="secondary">
          <CloseRounded fontSize="small" />
        </IconButton>
      </Stack>
      <div>
        <SectionTitle>Theme</SectionTitle>
        <ThemeMode />
      </div>
      <div>
        <SectionTitle>Animations</SectionTitle>
        <ReducedMotion />
      </div>
      <div role="list" aria-labelledby="social-links">
        <SectionTitle id="social-links" role="listitem">
          Community
        </SectionTitle>
        <CustomLink target="_blank" href="https://t.me/privatefolio" role="listitem">
          <Telegram fontSize="small" />
          <span>Telegram</span>
        </CustomLink>
        {/* <CustomLink target="_blank" href="https://discord.gg/J52KU8k4Bd" role="listitem">
          <DiscordIcon width="20px" height="20px" />
          <span>Discord</span>
        </CustomLink> */}
        <CustomLink target="_blank" href="https://twitter.com/kernelwhisperer" role="listitem">
          <Twitter fontSize="small" />
          <span>Twitter</span>
        </CustomLink>
        <CustomLink
          target="_blank"
          href="https://github.com/kernelwhisperer/privatefolio"
          role="listitem"
        >
          <GitHub fontSize="small" />
          <span>GitHub</span>
        </CustomLink>
      </div>
      <div>
        <SectionTitle id="social-links" role="listitem">
          Developer tools
        </SectionTitle>
        <Typography sx={{ opacity: 0.5 }} fontFamily={MonoFont} variant="body2">
          App version: {appVer}
        </Typography>
        <Typography sx={{ opacity: 0.5 }} fontFamily={MonoFont} variant="body2">
          App digest: {gitHash.slice(0, 7)}
        </Typography>
        <Typography sx={{ opacity: 0.5 }} fontFamily={MonoFont} variant="body2">
          Build date: {formatDate(new Date(GIT_DATE))}
          {debugMode && ` at ${formatHour(new Date(GIT_DATE))}`}
        </Typography>
        <MenuItem
          role="listitem"
          component={FormControlLabel}
          tabIndex={0}
          sx={{
            "&:hover": {
              color: "text.primary",
            },
            borderRadius: 0.5,
            color: "text.secondary",
            display: "flex",
            justifyContent: "space-between",
            marginX: -1,
            paddingX: 1,
          }}
          slotProps={{
            typography: {
              variant: "body2",
            },
          }}
          control={
            <Switch
              color="secondary"
              sx={{ marginY: "-3px" }}
              size="small" // TODO this is not implemented
              checked={debugMode}
              onChange={(event) => {
                localStorage.setItem("debug-mode", event.target.checked ? "true" : "false")
                $debugMode.set(event.target.checked)
              }}
            />
          }
          label="Debug mode"
          labelPlacement="start"
        />
        <MenuItem
          role="listitem"
          component={FormControlLabel}
          tabIndex={0}
          sx={{
            "&:hover": {
              color: "text.primary",
            },
            borderRadius: 0.5,
            color: "text.secondary",
            display: "flex",
            justifyContent: "space-between",
            marginX: -1,
            paddingX: 1,
          }}
          slotProps={{
            typography: {
              variant: "body2",
            },
          }}
          control={
            <Switch
              color="secondary"
              size="small" // TODO this is not implemented
              sx={{ marginY: "-3px" }}
              checked={telemetry}
              onChange={(event) => {
                localStorage.setItem("no-telemetry", event.target.checked ? "false" : "true")
                $telemetry.set(event.target.checked)
              }}
            />
          }
          label="Telemetry"
          labelPlacement="start"
        />
        <MenuItem
          target="_blank"
          href="https://github.com/kernelwhisperer/privatefolio/issues/new"
          role="listitem"
          component={MuiLink}
          tabIndex={0}
          sx={{
            "&:hover": {
              color: "text.primary",
            },
            borderRadius: 0.5,
            color: "text.secondary",
            display: "flex",
            gap: 1,
            marginX: -1,
            paddingX: 1,
          }}
        >
          <Typography variant="body2">Report an issue</Typography>
          <OpenInNew fontSize="inherit" />
        </MenuItem>
      </div>
    </StaggeredList>
  )
}
