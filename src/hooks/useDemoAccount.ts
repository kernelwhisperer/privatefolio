import { useStore } from "@nanostores/react"
import { useEffect } from "react"
import { Timestamp } from "src/interfaces"
import { $accounts, demoAccountName } from "src/stores/account-store"
import { $infoBanner } from "src/stores/info-banner-store"
import { enqueueRestore } from "src/utils/common-tasks"
import { clancy } from "src/workers/remotes"

async function setupDemoAccount() {
  const lastTx = await clancy.getValue<Timestamp>("lastTx", 0, demoAccountName)
  const dataAvailable = lastTx !== null && lastTx !== 0

  if (dataAvailable) {
    console.log("Demo account already set up")
    return
  }

  console.log("Setting up demo account")
  $infoBanner.set("Please be patient while the demo gets loaded...")
  const backup = await fetch("/app-data/demo-backup.zip")
  const buffer = await backup.arrayBuffer()
  const file = new File([new Blob([buffer])], "demo-backup.zip")

  await enqueueRestore(file)
  // $accountReset.set(Math.random())
  console.log("Demo account setup finished")
  $infoBanner.set(null)
}

export function useDemoAccount() {
  const accounts = useStore($accounts)

  useEffect(() => {
    if (accounts.length === 1 && accounts[0] === demoAccountName) {
      setupDemoAccount()
    }
  }, [accounts])
}
