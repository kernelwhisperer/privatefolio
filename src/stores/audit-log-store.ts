import { map } from "nanostores"

import { logAtoms } from "../utils/utils"

export type ActiveFilterMap = {
  integration?: string
  operation?: string
  symbol?: string
  wallet?: string
}

export const $activeFilters = map<ActiveFilterMap>({})

logAtoms({ $activeFilters })
