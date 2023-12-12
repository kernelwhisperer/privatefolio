import { Remote, wrap } from "comlink"

import { Clancy } from "./interfaces"

const worker = new Worker(new URL("./workers/clancy.ts", import.meta.url), {
  name: "Clancy",
  type: "module",
})

export const clancy: Remote<Clancy> = wrap(worker)
