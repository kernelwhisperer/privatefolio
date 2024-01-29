import Container from "@mui/material/Container"
import { a, useTransition } from "@react-spring/web"
import React, { lazy, useEffect } from "react"
import { Navigate, Route, Routes, useLocation } from "react-router-dom"

import { AccountIndexRoute } from "./AccountIndexRoute"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { Header } from "./components/Header/Header"
import LandingPageHeader from "./pages/LandingPage/LandingPageHeader"
import { PnLPage } from "./pages/PnLPage/PnLPage"
import { $pendingTask } from "./stores/task-store"
import { SPRING_CONFIGS } from "./utils/utils"

const LandingPage = lazy(() => import("./pages/LandingPage/LandingPage"))
const AuditLogsPage = lazy(() => import("./pages/AuditLogsPage/AuditLogsPage"))
const ImportDataPage = lazy(() => import("./pages/ImportDataPage/ImportDataPage"))
const TransactionsPage = lazy(() => import("./pages/TransactionsPage/TransactionsPage"))
const BalancesPage = lazy(() => import("./pages/BalancesPage/BalancesPage"))
const AssetPage = lazy(() => import("./pages/AssetPage/AssetPage"))

export default function App() {
  const location = useLocation()
  const { pathname } = location
  const appPath = pathname.split("/").slice(3).join("/")

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
      {pathname !== "/" ? <Header /> : <LandingPageHeader />}
      <Container disableGutters maxWidth="lg" sx={{ paddingTop: 2, paddingX: { xs: 2 } }}>
        {transitions((styles, item, { key }) => (
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
                <Route path="/u/:accountIndex" element={<AccountIndexRoute />}>
                  <Route
                    index
                    element={<BalancesPage show={key === pathname && appPath === ""} />}
                  />
                  <Route
                    path="pnl"
                    element={<PnLPage show={key === pathname && appPath === "pnl"} />}
                  />
                  <Route
                    path="asset/:assetId"
                    element={<AssetPage show={key === pathname && appPath.includes("asset")} />}
                  />
                  <Route
                    path="import-data"
                    element={
                      <ImportDataPage show={key === pathname && appPath === "import-data"} />
                    }
                  />
                  <Route
                    path="transactions"
                    element={
                      <TransactionsPage show={key === pathname && appPath === "transactions"} />
                    }
                  />
                  <Route
                    path="audit-logs"
                    element={<AuditLogsPage show={key === pathname && appPath === "audit-logs"} />}
                  />
                  <Route path="*" element={<Navigate to="/u/0" />} />
                </Route>
                <Route
                  path="/"
                  element={<LandingPage show={key === pathname && pathname === "/"} />}
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
