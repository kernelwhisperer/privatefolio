import { atom } from "nanostores"

import { logAtoms } from "../utils/utils"

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

logAtoms({ $loopsAllowed, $reducedMotion })
