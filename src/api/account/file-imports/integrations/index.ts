import { CsvParser, Integration } from "src/interfaces"

import * as binance from "./binance"
import * as coinmama from "./coinmama"
import * as etherscan from "./etherscan"
import * as etherscanErc20 from "./etherscan-erc20"
import * as mexc from "./mexc"

export const HEADER_MATCHER: Record<string, Integration> = {
  [binance.HEADER]: binance.Identifier,
  [mexc.HEADER]: mexc.Identifier,
  [coinmama.HEADER]: coinmama.Identifier,
  [etherscan.HEADER]: etherscan.Identifier,
  [etherscanErc20.HEADER]: etherscanErc20.Identifier,
}

export const PARSERS: Partial<Record<Integration, CsvParser>> = {
  [binance.Identifier]: binance.parser,
  [mexc.Identifier]: mexc.parser,
  [coinmama.Identifier]: coinmama.parser,
  [etherscan.Identifier]: etherscan.parser,
  [etherscanErc20.Identifier]: etherscanErc20.parser,
}
