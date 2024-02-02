import { isAddress } from "ethers"
import { AuditLogOperation, EtherscanAuditLog, ParserResult } from "src/interfaces"
import { Platform } from "src/settings"
import { asUTC } from "src/utils/formatting-utils"
import { hashString } from "src/utils/utils"

export const Identifier = "etherscan-erc20"
export const platform: Platform = "ethereum"

export const HEADER =
  '"Txhash","Blockno","UnixTimestamp","DateTime (UTC)","From","To","TokenValue","USDValueDayOfTx","ContractAddress","TokenName","TokenSymbol"'

export function parser(
  csvRow: string,
  index: number,
  fileImportId: string,
  parserContext: Record<string, unknown>
): ParserResult {
  const userAddress = parserContext.userAddress as string

  if (!userAddress) {
    throw new Error("'userAddress' is required for this type of file import")
  }

  if (!isAddress(userAddress)) {
    throw new Error("'userAddress' is not valid.")
  }

  const columns = csvRow
    .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
    .map((column) => column.replaceAll('"', ""))

  //
  const txHash = columns[0]
  const blockNumber = columns[1]
  // const unixTimestamp = columns[2]
  const datetimeUtc = columns[3]
  const from = columns[4]
  const to = columns[5]
  const tokenValue = columns[6].replaceAll(",", "")
  const tokenValueHistorical = columns[7]
  const contractAddress = columns[8]
  const tokenName = columns[9]
  const symbol = columns[10].trim()

  if (tokenValue === "0") {
    return { logs: [] }
  }

  const txMeta = {
    blockNumber,
    contractAddress,
    from,
    to,
    tokenName,
    tokenSymbol: symbol,
    tokenValue,
    tokenValueHistorical,
    txHash,
  }

  //
  const hash = hashString(`${index}_${csvRow}`)
  const _id = `${fileImportId}_${hash}`
  const timestamp = asUTC(new Date(datetimeUtc))

  const operation: AuditLogOperation =
    to.toLowerCase() === userAddress.toLowerCase() ? "Deposit" : "Withdraw"

  const change = operation === "Deposit" ? tokenValue : `-${tokenValue}`
  const changeN = parseFloat(change)

  const wallet = operation === "Deposit" ? to : from

  const logs: EtherscanAuditLog[] = [
    {
      _id,
      assetId: `ethereum:${contractAddress}:${symbol}`,
      change,
      changeN,
      importId: fileImportId,
      importIndex: index,
      operation,
      platform,
      timestamp,
      wallet,
      ...txMeta,
    },
  ]

  return { logs }
}
