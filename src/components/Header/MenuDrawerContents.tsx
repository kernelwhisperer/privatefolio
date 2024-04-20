import {
  DownloadRounded,
  HomeRounded,
  ReceiptLong,
  Settings,
  StorageRounded,
  SyncAltRounded,
  Workspaces,
} from "@mui/icons-material"
import {
  Button,
  Chip,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Stack,
  useMediaQuery,
} from "@mui/material"
import React, { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useBoolean } from "src/hooks/useBoolean"

import { AppVerProps, PopoverToggleProps } from "../../stores/app-store"
import { NavMenuItem } from "../NavMenuItem"
import { Logo } from "./Logo"
import { SettingsDrawer } from "./SettingsDrawer"

type MenuContentsProps = AppVerProps & PopoverToggleProps

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

export const MenuDrawerContents = ({ appVer, gitHash, open, toggleOpen }: MenuContentsProps) => {
  // const debugMode = useStore($debugMode)
  // const telemetry = useStore($telemetry)

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const isInstalled = useMediaQuery("(display-mode: standalone)")

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
  }, [])

  const promptInstall = () => {
    if (installPrompt) {
      installPrompt.prompt()
      installPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt")
        } else {
          console.log("User dismissed the install prompt")
        }
        setInstallPrompt(null)
      })
    }
  }

  const location = useLocation()
  const { pathname } = location
  const accountIndex = pathname.split("/")[2]

  const { value: openSettings, toggle: toggleSettingsOpen } = useBoolean(false)

  return (
    <>
      <Stack
        paddingX={2}
        paddingY={1}
        gap={1}
        sx={{ height: "100%", width: "100%" }}
        justifyContent="space-between"
      >
        <Stack gap={0.25}>
          <Button
            to="/"
            aria-label="Visit Homepage"
            component={Link}
            fullWidth
            sx={{
              borderRadius: 0.5,
              justifyContent: "flex-start",
              marginBottom: 2,
              paddingX: 2.5,
              paddingY: 1,
              textTransform: "none",
            }}
          >
            <Logo />
          </Button>
          <NavMenuItem
            value=""
            to={`/u/${accountIndex}/`}
            label="Home"
            aria-label="Visit Home"
            onClick={toggleOpen}
            avatar={<HomeRounded />}
          />
          <NavMenuItem
            value="transactions"
            to={`/u/${accountIndex}/transactions`}
            label="Transactions"
            aria-label="Visit Transactions"
            onClick={toggleOpen}
            avatar={<SyncAltRounded />}
          />
          <NavMenuItem
            value="assets"
            to={`/u/${accountIndex}/assets`}
            label="Assets"
            aria-label="Visit Assets"
            onClick={toggleOpen}
            avatar={<Workspaces />}
          />
          <NavMenuItem
            value="audit-logs"
            to={`/u/${accountIndex}/audit-logs`}
            label="Audit logs"
            aria-label="Visit Audit logs"
            onClick={toggleOpen}
            avatar={<ReceiptLong />}
          />
          <NavMenuItem
            value="import-data"
            to={`/u/${accountIndex}/import-data`}
            label="Import data"
            aria-label="Visit Import data"
            onClick={toggleOpen}
            avatar={<StorageRounded />}
          />
        </Stack>
        <Stack>
          <MenuItem
            sx={{
              "&:hover": {
                color: "text.primary",
              },
              borderRadius: 0.5,
              color: "text.secondary",
              display: isInstalled ? "none" : "inline-flex",
            }}
            onClick={promptInstall}
            aria-label="Install app"
          >
            <ListItemAvatar>
              <DownloadRounded />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  Install app{" "}
                  <Chip
                    size="small"
                    color="secondary"
                    sx={{ fontSize: "0.65rem", height: 18 }}
                    label="Coming soon"
                  />
                </Stack>
              }
            />
          </MenuItem>
          <MenuItem
            onClick={() => {
              toggleOpen()
              toggleSettingsOpen()
            }}
            sx={{
              "&:hover": {
                color: "text.primary",
              },
              borderRadius: 0.5,
              color: "text.secondary",
            }}
            aria-label="Open Settings"
          >
            <ListItemAvatar>
              <Settings
                sx={{
                  "li:hover &": {
                    transform: "rotate(-30deg)",
                  },
                  transition: "transform 0.33s",
                }}
              />
            </ListItemAvatar>
            <ListItemText primary="Settings" />
          </MenuItem>
          <SettingsDrawer open={openSettings} toggleOpen={toggleSettingsOpen} />
        </Stack>
      </Stack>
    </>
  )
}
