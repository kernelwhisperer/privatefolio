import "./index.css"

import { CssBaseline, Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material"
import * as React from "react"
import * as ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import App from "./App"
import theme from "./theme"

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter future={{ v7_startTransition: true }}>
    <CssVarsProvider defaultMode="system" theme={theme}>
      <CssBaseline enableColorScheme />
      <App />
    </CssVarsProvider>
  </BrowserRouter>
)
