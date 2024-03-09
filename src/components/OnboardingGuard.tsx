import { useStore } from "@nanostores/react"
import { proxy } from "comlink"
import React, { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { Timestamp } from "src/interfaces"
import { $accountReset, $activeAccount, $activeIndex } from "src/stores/account-store"
import { clancy } from "src/workers/remotes"

export function OnboardingGuard() {
  const [genesis, setGenesis] = useState<Timestamp | null>(null)

  const accountReset = useStore($accountReset)
  const activeIndex = useStore($activeIndex)

  useEffect(() => {
    function fetchData() {
      clancy.getValue<Timestamp>("genesis", 0, $activeAccount.get()).then(setGenesis)
    }

    fetchData()

    const unsubscribePromise = clancy.subscribeToKV(
      "genesis",
      proxy(fetchData),
      $activeAccount.get()
    )

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        unsubscribe()
      })
    }
  }, [accountReset])

  if (genesis === 0) {
    return <Navigate to={`/u/${activeIndex}/import-data`} />
  }

  return null
}
