import { atom } from "nanostores"

import { logAtoms } from "../utils/browser-utils"

export interface AppVerProps {
  appVer: string
  gitHash: string
}

export interface PopoverToggleProps {
  open: boolean
  toggleOpen: () => void
}

export type ReducedMotionSetting = "always" | "never" | "user"
export const $reducedMotion = atom<ReducedMotionSetting>(
  (localStorage.getItem("reduced-motion") as ReducedMotionSetting) || "user"
)
export const $loopsAllowed = atom<boolean>(false)
export const $devMode = atom<boolean>(localStorage.getItem("dev-mode") === "true")

logAtoms({ $devMode, $loopsAllowed, $reducedMotion })
