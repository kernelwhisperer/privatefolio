import "./index.css"
import "./worker-remote"

import * as React from "react"
import * as ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import App from "./App"
import { ThemeProvider } from "./ThemeProvider"

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter future={{ v7_startTransition: true }}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </BrowserRouter>
)
