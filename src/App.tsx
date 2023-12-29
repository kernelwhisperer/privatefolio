import Container from "@mui/material/Container"
import { a, useTransition } from "@react-spring/web"
import { proxy } from "comlink"
import React, { useEffect } from "react"
import { Navigate, Route, Routes, useLocation } from "react-router-dom"

import { ErrorBoundary } from "./components/ErrorBoundary"
import { Header } from "./components/Header/Header"
import AssetPage from "./pages/AssetPage/AssetPage"
import { AuditLogsPage } from "./pages/AuditLogsPage/AuditLogsPage"
import { BalancesPage } from "./pages/BalancesPage/BalancesPage"
import { ImportDataPage } from "./pages/ImportDataPage/ImportDataPage"
import { TransactionsPage } from "./pages/TransactionPage/TransactionsPage"
import { computeMetadata, computeMetadataDebounced } from "./stores/metadata-store"
import { $pendingTask } from "./stores/task-store"
import { SPRING_CONFIGS } from "./utils/utils"
import { clancy } from "./workers/remotes"

export default function App() {
  const location = useLocation()
  const { pathname } = location

  const transitions = useTransition(location, {
    config: SPRING_CONFIGS.veryQuick,
    enter: {
      // delay: 133,
      opacity: 2,
    },
    exitBeforeEnter: true,
    from: { opacity: 1 },
    keys: (location) => location.pathname,
    leave: { opacity: 1 },
  })

  useEffect(() => {
    computeMetadata()

    const unsubscribePromise = clancy.subscribeToAuditLogs(proxy(computeMetadataDebounced))

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        unsubscribe()
      })
    }
  }, [])

  useEffect(() => {
    const beforeUnloadHandler = (event) => {
      // Recommended
      event.preventDefault()
      // Included for legacy support, e.g. Chrome/Edge < 119
      event.returnValue = true
    }

    $pendingTask.listen((pendingTask) => {
      if (pendingTask) {
        window.addEventListener("beforeunload", beforeUnloadHandler)
      } else {
        window.removeEventListener("beforeunload", beforeUnloadHandler)
      }
    })
  }, [])

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ paddingTop: 3 }}>
        {transitions((styles, item) => (
          <a.div
            style={
              {
                ...styles,
                maxWidth: 1200 - 32,
                paddingBottom: 24,
                position: "absolute",
                width: "calc(100% - 32px)",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any
            }
          >
            <ErrorBoundary>
              <Routes location={item}>
                <Route path="/" element={<BalancesPage show={pathname === "/"} />} />
                <Route
                  path="/asset/:symbol"
                  element={<AssetPage show={pathname.includes("/asset")} />}
                />
                <Route
                  path="/import-data"
                  element={<ImportDataPage show={pathname === "/import-data"} />}
                />
                <Route
                  path="/transactions"
                  element={<TransactionsPage show={pathname === "/transactions"} />}
                />
                <Route
                  path="/audit-logs"
                  element={<AuditLogsPage show={pathname === "/audit-logs"} />}
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </ErrorBoundary>
          </a.div>
        ))}
      </Container>
    </>
  )
}
