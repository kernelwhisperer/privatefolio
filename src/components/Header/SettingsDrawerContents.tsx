import { CloseRounded, GitHub, Telegram, Twitter } from "@mui/icons-material"
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

import { $devMode, AppVerProps, PopoverToggleProps } from "../../stores/app-store"
import { MonoFont } from "../../theme"
import { formatDate } from "../../utils/formatting-utils"
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
  const devMode = useStore($devMode)

  return (
    <StaggeredList padding={2} gap={4} show={open} secondary sx={{ overflowX: "hidden" }}>
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
        <CustomLink target="_blank" href="https://t.me/protofun" role="listitem">
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
        <CustomLink target="_blank" href="https://github.com/kernelwhisperer" role="listitem">
          <GitHub fontSize="small" />
          <span>GitHub</span>
        </CustomLink>
      </div>
      <div>
        <SectionTitle id="social-links" role="listitem">
          Debug
        </SectionTitle>
        <Typography sx={{ opacity: 0.5 }} fontFamily={MonoFont} variant="body2">
          App version: {appVer}
        </Typography>
        <Typography sx={{ opacity: 0.5 }} fontFamily={MonoFont} variant="body2">
          App digest: {gitHash.slice(0, 7)}
        </Typography>
        <Typography sx={{ opacity: 0.5 }} fontFamily={MonoFont} variant="body2">
          Release date: {formatDate(new Date())}
        </Typography>

        <FormControlLabel
          sx={{
            "&:hover": {
              color: "text.primary",
            },
            color: "text.secondary",
            display: "flex",
            justifyContent: "space-between",
            marginLeft: 0,
            marginRight: 0,
            paddingY: 1,
          }}
          slotProps={{
            typography: {
              variant: "body2",
            },
          }}
          control={
            <Switch
              color="secondary"
              size="small"
              checked={devMode}
              onChange={(event) => {
                localStorage.setItem("dev-mode", event.target.checked ? "true" : "false")
                $devMode.set(event.target.checked)
              }}
            />
          }
          label="Dev mode"
          labelPlacement="start"
        />
      </div>
    </StaggeredList>
  )
}
