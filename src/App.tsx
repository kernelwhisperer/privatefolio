import Container from "@mui/material/Container"
import { a, useTransition } from "@react-spring/web"
import React, { useEffect } from "react"
import { Navigate, Route, Routes, useLocation } from "react-router-dom"

import { findAssets } from "./api/assets-api"
import { findExchanges } from "./api/exchanges-api"
import { Header } from "./components/Header/Header"
import AssetPage from "./pages/AssetPage/AssetPage"
import { AuditLogsPage } from "./pages/AuditLogsPage/AuditLogsPage"
import { BalancesPage } from "./pages/BalancesPage/BalancesPage"
import { ImportDataPage } from "./pages/ImportDataPage/ImportDataPage"
import { $assetMap, $integrationMap, computeFilterMap } from "./stores/metadata-store"
import { SPRING_CONFIGS } from "./utils/utils"

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
    computeFilterMap().then(async (filterMap) => {
      const symbolMap = filterMap.symbol.reduce((map, symbol) => {
        map[symbol] = true
        return map
      }, {} as Record<string, boolean>)

      findAssets(symbolMap).then($assetMap.set)

      const integrationMap = filterMap.integration.reduce((map, integration) => {
        map[integration] = true
        return map
      }, {} as Record<string, boolean>)

      findExchanges(integrationMap).then($integrationMap.set)
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
                maxWidth: 1200 - 48, // TODO
                paddingBottom: 24,
                position: "absolute",
                width: "calc(100% - 48px)",
              } as any
            }
          >
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
                path="/audit-logs"
                element={<AuditLogsPage show={pathname === "/audit-logs"} />}
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </a.div>
        ))}
      </Container>
    </>
  )
}
