import { useStore } from "@nanostores/react"
import React, { memo, useEffect } from "react"
import { Navigate, Outlet, useParams } from "react-router-dom"

import { $accounts, $activeAccount } from "./stores/account-store"

function BaseUserIndexRoute() {
  const { userIndex } = useParams()
  const accounts = useStore($accounts)

  const userId = userIndex ? parseInt(userIndex, 10) : -1
  const isInvalid = isNaN(userId) || userId < 0 || userId >= accounts.length

  useEffect(() => {
    if (isInvalid) return
    if (accounts[userId] === $activeAccount.get()) return

    $activeAccount.set(accounts[userId])
  }, [accounts, isInvalid, userId, userIndex])

  if (isInvalid) {
    return <Navigate to="/u/0" />
  }

  return <Outlet />
}

export const UserIndexRoute = memo(BaseUserIndexRoute)
