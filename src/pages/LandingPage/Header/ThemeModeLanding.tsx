import { IconButton, useTheme } from "@mui/material"
import { useColorScheme } from "@mui/material/styles"
import React, { useRef } from "react"
import { noop } from "src/utils/utils"

import { DarkModeSwitch } from "./DarkModeSwitch"

export function ThemeModeLanding() {
  const { setMode } = useColorScheme()
  const theme = useTheme()

  const { mode } = theme.palette

  const switchOn = useRef<HTMLAudioElement>(null)
  const switchOff = useRef<HTMLAudioElement>(null)

  return (
    <>
      <IconButton
        onClick={() => {
          if (theme.palette.mode === "dark") {
            setMode("light")
            switchOn.current?.play()
          } else {
            setMode("dark")
            switchOff.current?.play()
          }
        }}
      >
        <DarkModeSwitch checked={mode === "dark"} onChange={noop} />
      </IconButton>
      <audio ref={switchOn} src="/switch_sound_on.mp3" />
      <audio ref={switchOff} src="/switch_sound_off.mp3" />
    </>
  )
}
