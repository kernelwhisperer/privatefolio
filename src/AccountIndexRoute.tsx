import { useStore } from "@nanostores/react"
import React, { memo, useEffect } from "react"
import { Navigate, Outlet, useParams } from "react-router-dom"

import { $accounts, $activeAccount } from "./stores/account-store"

function BaseAccountIndexRoute() {
  const params = useParams()
  const accounts = useStore($accounts)

  const accountIndex = params.accountIndex ? parseInt(params.accountIndex, 10) : -1
  const isInvalid = isNaN(accountIndex) || accountIndex < 0 || accountIndex >= accounts.length

  useEffect(() => {
    if (isInvalid) return
    if (accounts[accountIndex] === $activeAccount.get()) return

    $activeAccount.set(accounts[accountIndex])
  }, [accounts, isInvalid, accountIndex])

  if (isInvalid) {
    return <Navigate to="/u/0" />
  }

  return <Outlet />
}

export const AccountIndexRoute = memo(BaseAccountIndexRoute)
