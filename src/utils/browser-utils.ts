import { logger } from "@nanostores/logger"
import { AnyStore } from "nanostores"

export const SITE_DOMAIN = "https://privatefolio.app"
export const isProduction = Boolean(window.location.toString().includes(SITE_DOMAIN))

export function logAtoms(atoms: { [key: string]: AnyStore }) {
  if (!isProduction) {
    logger(atoms, {
      messages: {
        mount: false,
        unmount: false,
      },
    })
  }
}
