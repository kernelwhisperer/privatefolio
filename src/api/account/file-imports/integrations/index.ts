import { CsvParser } from "src/interfaces"
import { Integration, ParserId } from "src/settings"

import * as binance from "./binance"
import * as coinmama from "./coinmama"
import * as etherscan from "./etherscan"
import * as etherscanErc20 from "./etherscan-erc20"
import * as etherscanInternal from "./etherscan-internal"
import * as mexc from "./mexc"

export const HEADER_MATCHER: Record<string, ParserId> = {
  [binance.HEADERS[0]]: binance.Identifier,
  [binance.HEADERS[1]]: binance.Identifier,
  [mexc.HEADER]: mexc.Identifier,
  [coinmama.HEADER]: coinmama.Identifier,
  [etherscan.HEADER]: etherscan.Identifier,
  [etherscanInternal.HEADER]: etherscanInternal.Identifier,
  [etherscanErc20.HEADER]: etherscanErc20.Identifier,
}

export const PARSER_MATCHER: Record<ParserId, CsvParser> = {
  [binance.Identifier]: binance.parser,
  [mexc.Identifier]: mexc.parser,
  [coinmama.Identifier]: coinmama.parser,
  [etherscan.Identifier]: etherscan.parser,
  [etherscanInternal.Identifier]: etherscanInternal.parser,
  [etherscanErc20.Identifier]: etherscanErc20.parser,
}

export const INTEGRATION_MATCHER: Record<ParserId, Integration> = {
  [binance.Identifier]: binance.integration,
  [mexc.Identifier]: mexc.integration,
  [coinmama.Identifier]: coinmama.integration,
  [etherscan.Identifier]: etherscan.integration,
  [etherscanInternal.Identifier]: etherscanInternal.integration,
  [etherscanErc20.Identifier]: etherscanErc20.integration,
}
