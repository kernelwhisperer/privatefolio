import React, { PropsWithChildren, useEffect } from "react"
import { v4 as uuid } from "uuid"

import { APP_VERSION, GIT_HASH, POSTHOG_KEY } from "./settings"
import { $telemetry } from "./stores/app-store"
import { isProduction } from "./utils/utils"

export function getDeviceId() {
  let deviceId = localStorage.getItem("p-device-uuid")

  if (!deviceId) {
    deviceId = uuid()
    localStorage.setItem("p-device-uuid", deviceId as string)
  }

  return deviceId as string
}

export function AnalyticsProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    if (!isProduction) {
      console.log("Telemetry skipped")
      return
    }

    import("posthog-js")
      .then((x) => x.default)
      .then((posthog) => {
        if (!POSTHOG_KEY) {
          console.error(new Error("Posthog token missing"))
          return
        }

        const telemetry = $telemetry.get()

        if (!telemetry) {
          console.log("Telemetry disabled")
          return
        }

        if (window.location.toString().includes("localhost")) {
          posthog.debug()
        }

        posthog.init(POSTHOG_KEY, {
          api_host: "https://ph.protocol.fun",
          ui_host: "https://eu.posthog.com",
        })

        const deviceId = getDeviceId()
        posthog.identify(deviceId, {
          appVer: APP_VERSION,
          gitHash: GIT_HASH,
        })

        console.log("Telemetry enabled")

        // posthog.shutdown() FIXME: this doesn't work
      })
  }, [])

  return <>{children}</>
}
