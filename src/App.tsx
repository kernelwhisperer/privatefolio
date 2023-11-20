import Container from "@mui/material/Container"
import { a, useTransition } from "@react-spring/web"
import React from "react"
import { Route, Routes, useLocation } from "react-router-dom"

import { Header } from "./components/Header/Header"
import { AuditLogsPage } from "./pages/AuditLogsPage/AuditLogsPage"
import { ImportDataPage } from "./pages/ImportDataPage/ImportDataPage"

// const Offset = styled("div")(({ theme }) => theme.mixins.toolbar)

// const StyledContainer = styled(Container)`
//   // margin-top: ${(props) => props.theme.mixins.toolbar.minHeight}px;
//   background: red;
// `

export default function App() {
  const location = useLocation()

  const transitions = useTransition(location, {
    config: { friction: 160, mass: 5, tension: 2500 },
    enter: { delay: 133, opacity: 1, y: 0 },
    exitBeforeEnter: true,
    from: { opacity: 0, y: 20 },
    keys: (location) => location.pathname,
    leave: { opacity: 0, y: 20 },
  })

  return (
    <>
      <Header />
      {/* <Offset /> */}
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
              {/* <Route path="/" Component={HomePage} /> */}
              {/* <Route path="/asset/:assetSymbol" Component={AssetPage} /> */}
              {/* <Route path="/transactions" Component={TransactionsPage} /> */}
              <Route path="/import-data" Component={ImportDataPage} />
              <Route path="*" Component={AuditLogsPage} />
            </Routes>
          </a.div>
        ))}
      </Container>
    </>
  )
}
