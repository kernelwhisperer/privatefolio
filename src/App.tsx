import { Box, Paper, Stack } from "@mui/material"
import Container from "@mui/material/Container"
import { a, useTransition } from "@react-spring/web"
import React, { useEffect } from "react"
import { Navigate, Route, Routes, useLocation } from "react-router-dom"

import { AccountIndexRoute } from "./AccountIndexRoute"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { Header } from "./components/Header/Header"
import { InfoBanner } from "./components/Header/InfoBanner"
import { MenuDrawerContents } from "./components/Header/MenuDrawerContents"
import { APP_VERSION, GIT_HASH } from "./env"
import { useDemoAccount } from "./hooks/useDemoAccount"
import FourZeroFourPage from "./pages/404"
import AssetPage from "./pages/AssetPage/AssetPage"
import AssetsPage from "./pages/AssetsPage/AssetsPage"
import AuditLogsPage from "./pages/AuditLogsPage/AuditLogsPage"
import HomePage from "./pages/HomePage/HomePage"
import ImportDataPage from "./pages/ImportDataPage/ImportDataPage"
import HeaderLanding from "./pages/LandingPage/Header/HeaderLanding"
import LandingPage from "./pages/LandingPage/LandingPage"
import TransactionsPage from "./pages/TransactionsPage/TransactionsPage"
import { $pendingTask } from "./stores/task-store"
import { noop, SPRING_CONFIGS } from "./utils/utils"

export default function App() {
  const location = useLocation()
  const { pathname } = location
  const appPath = pathname.split("/").slice(3).join("/")

  useDemoAccount()

  // TODO: remove
  const transitions = useTransition(location, {
    config: SPRING_CONFIGS.veryQuick,
    enter: {
      immediate: true,
      // delay: 133,
      opacity: 1,
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

  const isLandingPage = pathname === "/"

  return (
    <Stack direction="row">
      {!isLandingPage && (
        <>
          <Box
            sx={{
              "@media (min-width: 1836px)": {
                display: "inline-flex",
              },
              display: "none",
              width: 300,
            }}
          />
          <Paper
            sx={{
              // xl + width
              "@media (min-width: 1836px)": {
                display: "inline-flex",
              },
              borderBottom: 0,
              borderLeft: 0,
              borderRadius: 0,
              borderTop: 0,
              bottom: 0,
              display: "none",
              height: "100%",
              minWidth: 300,
              position: "fixed",
            }}
            elevation={0}
          >
            <MenuDrawerContents
              open={true}
              toggleOpen={noop}
              appVer={APP_VERSION}
              gitHash={GIT_HASH}
            />
          </Paper>
        </>
      )}
      <Box sx={{ flex: 1 }}>
        {/* TODO */}
        {/* <Box
          sx={{
            background: `radial-gradient(
              150vh 150vh at calc(50% + 200px) -40vh,
              rgba(250,220,255,0.1), rgba(250,220,255,0.33), #fff0
            )`,
            height: "100%",
            "html[data-mui-color-scheme='dark'] &": {
              background: `radial-gradient(
                150vh 150vh at calc(50% + 200px) -40vh,
                rgba(250,220,255,0.1), rgba(250,220,255,0.01), #fff0
              )`,
            },
            left: 0,
            pointerEvents: "none",
            position: "absolute",
            right: 0,
            top: 0,
            width: "100%",
            zIndex: -1,
          }}
        /> */}
        {isLandingPage ? <HeaderLanding /> : <Header />}
        <Container disableGutters maxWidth="xl" sx={{ paddingTop: 2, paddingX: { xs: 2 } }}>
          {isLandingPage && <LandingPage />}
          {transitions((styles, item, { key }) => (
            <a.div
              style={
                {
                  ...styles,
                  maxWidth: 1536 - 32,
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
                    <Route index element={<HomePage />} />
                    <Route path="asset/:assetId" element={<AssetPage />} />
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
                      element={
                        <AuditLogsPage show={key === pathname && appPath === "audit-logs"} />
                      }
                    />
                    <Route
                      path="assets"
                      element={<AssetsPage show={key === pathname && appPath === "assets"} />}
                    />
                    <Route path="*" element={<FourZeroFourPage show />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </ErrorBoundary>
              {!isLandingPage && <InfoBanner />}
            </a.div>
          ))}
        </Container>
      </Box>
    </Stack>
  )
}
