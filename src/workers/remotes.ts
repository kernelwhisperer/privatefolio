import "./comlink-setup"

import { Remote, wrap } from "comlink"

import type { Clancy } from "./clancy"

const clancyWorker = new Worker(new URL("./clancy.ts", import.meta.url), {
  name: "Clancy",
  type: "module",
})

export const clancy: Remote<Clancy> = wrap(clancyWorker)
