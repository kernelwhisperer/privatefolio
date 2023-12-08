import { atom } from "nanostores"

import { ResolutionString } from "../interfaces"

export const $favoriteIntervals = atom<ResolutionString[]>([
  "1s" as ResolutionString,
  "1m" as ResolutionString,
  "1h" as ResolutionString,
  "1d" as ResolutionString,
  "1w" as ResolutionString,
])

export const $preferredInterval = atom<ResolutionString>("1d" as ResolutionString)
