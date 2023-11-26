import { CloseRounded, GitHub, Telegram, Twitter } from "@mui/icons-material"
import {
  Divider,
  IconButton,
  Link as MuiLink,
  MenuItem,
  Stack,
  Typography,
  TypographyProps,
} from "@mui/material"
import React from "react"

import { AppVerProps, PopoverToggleProps } from "../../stores/app-store"
import { MonoFont } from "../../theme"
import { SPRING_CONFIGS } from "../../utils/utils"
import { StaggeredList } from "../StaggeredList"
import { ReducedMotion } from "./ReducedMotion"
import { ThemeMode } from "./ThemeMode"

const CustomLink = ({ children, ...rest }: any) => (
  <MenuItem component={MuiLink} tabIndex={0} role="button" {...rest}>
    <Typography
      variant="h6"
      component="div"
      fontWeight={600}
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

const SectionTitle = (props: TypographyProps) => (
  <Typography
    variant="subtitle2"
    letterSpacing="0.05rem"
    sx={{
      marginBottom: 0.5,
      // textTransform: "uppercase",
    }}
    {...props}
  />
)

type MenuContentsProps = AppVerProps & PopoverToggleProps

export const SettingsDrawerContents = ({
  appVer,
  gitHash,
  open,
  toggleOpen,
}: MenuContentsProps) => {
  return (
    <StaggeredList
      config={open ? SPRING_CONFIGS.quick : SPRING_CONFIGS.veryQuick}
      padding={2}
      gap={4}
      show={open}
    >
      <div>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            variant="subtitle1"
            // letterSpacing="0.05rem"
            sx={
              {
                // marginBottom: 0.5,
                // textTransform: "uppercase",
              }
            }
          >
            Settings
          </Typography>
          <IconButton onClick={toggleOpen} edge="end">
            <CloseRounded />
          </IconButton>
        </Stack>
        <Divider />
      </div>
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
          Social
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
        <CustomLink target="_blank" href="https://github.com/kernelwhisperer/" role="listitem">
          <GitHub fontSize="small" />
          <span>GitHub</span>
        </CustomLink>
      </div>
      <div>
        <Typography sx={{ opacity: 0.5 }} fontFamily={MonoFont} variant="body2">
          App version: {appVer}
        </Typography>
        <Typography sx={{ opacity: 0.5 }} fontFamily={MonoFont} variant="body2">
          App digest: {gitHash.slice(0, 7)}
        </Typography>
      </div>
    </StaggeredList>
  )
}
