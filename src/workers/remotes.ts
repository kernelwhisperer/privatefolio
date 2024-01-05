import "./comlink-setup"

import { Remote, wrap } from "comlink"

import type { Clancy as BaseType } from "./clancy"

const clancyWorker = new Worker(new URL("./clancy.ts", import.meta.url), {
  name: "Clancy",
  type: "module",
})

type Clancy = Omit<Remote<BaseType>, "getValue"> & {
  getValue<T>(key: string, defaultValue: T | null, accountName?: string): Promise<T | null>
}

export const clancy = wrap(clancyWorker) as Clancy
