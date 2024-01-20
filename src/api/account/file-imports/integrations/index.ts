import { CsvParser } from "src/interfaces"
import { Integration, ParserId } from "src/settings"

import * as binance from "./binance"
import * as coinmama from "./coinmama"
import * as etherscan from "./etherscan"
import * as etherscanErc20 from "./etherscan-erc20"
import * as mexc from "./mexc"

export const HEADER_MATCHER: Record<string, ParserId> = {
  [binance.HEADER]: binance.Identifier,
  [mexc.HEADER]: mexc.Identifier,
  [coinmama.HEADER]: coinmama.Identifier,
  [etherscan.HEADER]: etherscan.Identifier,
  [etherscanErc20.HEADER]: etherscanErc20.Identifier,
}

export const PARSER_MATCHER: Record<ParserId, CsvParser> = {
  [binance.Identifier]: binance.parser,
  [mexc.Identifier]: mexc.parser,
  [coinmama.Identifier]: coinmama.parser,
  [etherscan.Identifier]: etherscan.parser,
  [etherscanErc20.Identifier]: etherscanErc20.parser,
}

export const INTEGRATION_MATCHER: Record<ParserId, Integration> = {
  [binance.Identifier]: binance.integration,
  [mexc.Identifier]: mexc.integration,
  [coinmama.Identifier]: coinmama.integration,
  [etherscan.Identifier]: etherscan.integration,
  [etherscanErc20.Identifier]: etherscanErc20.integration,
}
