import { Integration, Parser } from "src/interfaces"

import * as binance from "./binance"
import * as coinmama from "./coinmama"
import * as mexc from "./mexc"

export const HEADER_MATCHER: Record<string, Integration> = {
  [binance.HEADER]: binance.Identifier,
  [mexc.HEADER]: mexc.Identifier,
  [coinmama.HEADER]: coinmama.Identifier,
}

export const PARSERS: Partial<Record<Integration, Parser>> = {
  [binance.Identifier]: binance.parser,
  [mexc.Identifier]: mexc.parser,
  [coinmama.Identifier]: coinmama.parser,
}
