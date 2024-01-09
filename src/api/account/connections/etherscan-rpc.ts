import type { BlockTag, Transaction } from "ethers"
import { EtherscanProvider } from "ethers"

export type BlockchainTransaction = Transaction & {
  blockNumber: string
  /**
   * @example "1443428683"
   */
  timeStamp: string // Time as string
}

export class FullEtherscanProvider extends EtherscanProvider {
  async getErc20Transactions(
    address: string,
    startBlock?: BlockTag,
    endBlock?: BlockTag
  ): Promise<Array<BlockchainTransaction>> {
    const params = {
      action: "tokentx",
      address,
      endblock: endBlock == null ? 99_999_999_999 : endBlock,
      sort: "asc",
      startblock: startBlock == null ? 0 : startBlock,
    }

    return this.fetch("account", params)
  }

  async getInternalTransactions(
    address: string,
    startBlock?: BlockTag,
    endBlock?: BlockTag
  ): Promise<Array<BlockchainTransaction>> {
    const params = {
      action: "txlistinternal",
      address,
      endblock: endBlock == null ? 99_999_999_999 : endBlock,
      sort: "asc",
      startblock: startBlock == null ? 0 : startBlock,
    }

    return this.fetch("account", params)
  }

  async getTransactions(
    address: string,
    startBlock?: BlockTag,
    endBlock?: BlockTag
  ): Promise<Array<BlockchainTransaction>> {
    const params = {
      action: "txlist",
      address,
      endblock: endBlock == null ? 99_999_999_999 : endBlock,
      sort: "asc",
      startblock: startBlock == null ? 0 : startBlock,
    }

    return this.fetch("account", params)
  }
}

// {
//   "blockNumber": "302086",
//   "timeStamp": "1443428683",
//   "hash": "0x9b629147b75dc0b275d478fa34d97c5d4a26926457540b15a5ce871df36c23fd",
//   "nonce": "109",
//   "blockHash": "0xa3c3db0ff0bb72b859d670b04bcd2831731b7c36ba578ece204f49de9ffea05c",
//   "transactionIndex": "1",
//   "from": "0x1db3439a222c519ab44bb1144fc28167b4fa6ee6",
//   "to": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
//   "value": "250000000000000000",
//   "gas": "90000",
//   "gasPrice": "50000000000",
//   "isError": "0",
//   "txreceipt_status": "",
//   "input": "0x",
//   "contractAddress": "",
//   "cumulativeGasUsed": "42000",
//   "gasUsed": "21000",
//   "confirmations": "18568510",
//   "methodId": "0x",
//   "functionName": ""
// }

// type Transaction = {
//   blockHash: string;
//   blockNumber: string;
//   confirmations: string;
//   contractAddress: string;
//   cumulativeGasUsed: string;
//   from: string;
//   functionName: string;
//   gas: string;
//   gasPrice: string;
//   gasUsed: string;
//   hash: string;
//   input: string;
//   isError: string;
//   methodId: string;
//   nonce: string;
//   timeStamp: string;
//   to: string;
//   transactionIndex: string;
//   txreceipt_status: string;
//   value: string;
// };
