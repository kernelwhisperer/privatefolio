import { logger } from "@nanostores/logger"
import { atom } from "nanostores"

import { isProduction } from "../utils/utils"

export interface AppVerProps {
  appVer: string
  gitHash: string
}

export interface PopoverToggleProps {
  open: boolean
  toggleOpen: () => void
}

export type ReducedMotionSetting = "always" | "never" | "user"
export const $reducedMotion = atom<ReducedMotionSetting>("user")
export const $loopsAllowed = atom<boolean>(false)

if (!isProduction) {
  logger(
    {
      $loopsAllowed,
      $reducedMotion,
    },
    {
      // messages: {
      //   mount: false,
      //   unmount: false,
      // },
    }
  )
}
