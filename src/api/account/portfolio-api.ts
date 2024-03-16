import { setValue } from "./kv-api"
import { findTransactions } from "./transactions-api"

export async function computeGenesis(accountName: string) {
  const res = await findTransactions({ limit: 1, order: "asc" }, accountName)
  const genesis = res.length === 0 ? 0 : res[0].timestamp
  await setValue("genesis", genesis, accountName)
}

export async function computeLastTx(accountName: string) {
  const res = await findTransactions({ limit: 1, order: "desc" }, accountName)
  const lastTx = res.length === 0 ? 0 : res[0].timestamp
  await setValue("lastTx", lastTx, accountName)
}
