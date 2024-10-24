import { EtherscanConnection, SyncResult } from "src/interfaces"
import { ProgressCallback } from "src/stores/task-store"
import { getAssetPlatform, getEvmChainId } from "src/utils/assets-utils"
import { noop } from "src/utils/utils"

import { parseNormal } from "./etherscan/etherscan"
import { parseBlockReward } from "./etherscan/etherscan-block-reward"
import { parseERC20 } from "./etherscan/etherscan-erc20"
import { parseInternal } from "./etherscan/etherscan-internal"
import { parseStakingWithdrawal } from "./etherscan/etherscan-staking-withdrawal"
import {
  BlockRewardTransaction,
  FullEtherscanProvider,
  StakingWithdrawalTransaction,
} from "./etherscan-rpc"

const parserList = [
  parseNormal,
  parseInternal,
  parseERC20,
  parseStakingWithdrawal,
  parseBlockReward,
]

export async function syncEtherscan(
  progress: ProgressCallback = noop,
  connection: EtherscanConnection,
  since: string,
  until: string
) {
  const chainId = getEvmChainId(getAssetPlatform(connection.platform))
  const rpcProvider = new FullEtherscanProvider(chainId, "3JHR8S44XRG5VAN774EGSBY175A1QE2EZA")

  progress([0, `Starting from block number ${since}`])

  const result: SyncResult = {
    assetMap: {},
    logMap: {},
    newCursor: since,
    operationMap: {},
    rows: 0,
    txMap: {},
    walletMap: {},
  }

  progress([0, `Fetching all transactions`])
  const normal = await rpcProvider.getTransactions(connection.address, since, until)
  progress([10, `Fetched ${normal.length} Normal transactions`])
  const internal = await rpcProvider.getInternalTransactions(connection.address, since, until)
  progress([20, `Fetched ${internal.length} Internal transactions`])
  const erc20 = await rpcProvider.getErc20Transactions(connection.address, since, until)
  progress([30, `Fetched ${erc20.length} ERC20 transactions`])

  let staking: StakingWithdrawalTransaction[] = []
  let blocks: BlockRewardTransaction[] = []

  if (connection.platform === "ethereum") {
    staking = await rpcProvider.getStakingWithdrawalTransactions(connection.address, since, until)
    progress([40, `Fetched ${staking.length} Staking Withdrawal transactions`])
    blocks = await rpcProvider.getBlockRewardTransactions(connection.address, since, until)
    progress([50, `Fetched ${blocks.length} Block Reward transactions`])
  }
  const transactionArrays = [normal, internal, erc20, staking, blocks]

  let blockNumber = 0

  progress([50, "Parsing all transactions"])
  transactionArrays.forEach((txArray, arrayIndex) => {
    const parse = parserList[arrayIndex]
    result.rows += txArray.length

    txArray.forEach((row, rowIndex) => {
      try {
        const { logs, txns = [] } = parse(row, rowIndex, connection)

        // if (logs.length === 0) throw new Error(JSON.stringify(row, null, 2))

        for (const log of logs) {
          result.logMap[log._id] = log
          result.assetMap[log.assetId] = true
          result.walletMap[log.wallet] = true
          result.operationMap[log.operation] = true
        }

        for (const transaction of txns) {
          result.txMap[transaction._id] = transaction
        }
      } catch (error) {
        progress([undefined, `Error parsing row ${rowIndex + 1}: ${String(error)}`])
      }
    })

    const lastBlock = txArray[txArray.length - 1]?.blockNumber

    if (lastBlock && Number(lastBlock) > blockNumber) {
      blockNumber = Number(lastBlock)
    }
  })

  result.newCursor = String(blockNumber + 1)
  return result
}
