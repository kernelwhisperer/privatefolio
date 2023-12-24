import PouchDB from "pouchdb"
import PouchDBFind from "pouchdb-find"

import {
  AuditLog,
  BalanceMap,
  Connection,
  FileImport,
  Networth,
  SavedPrice,
  Transaction,
} from "../interfaces"

if (typeof window !== "undefined") {
  throw new Error(
    "Database should not be initialized in the browser, only in the web worker or node environment"
  )
}

const namespace = process.env.NODE_ENV === "test" ? "test-db" : ""

// try {
//   PouchDB.replicate("file-imports", "http://localhost:5984/file-imports", { live: true })
//   PouchDB.replicate("audit-logs", "http://localhost:5984/audit-logs", { live: true })
// } catch {
//   console.log("Error replicating database")
// }

// declare module "pouchdb-core" {
//   interface Database<Content extends {} = {}> {
//     explain(query: any): Promise<any>
//   }
// }
PouchDB.plugin(PouchDBFind)

const defaultDbOptions = {
  auto_compaction: true,
  revs_limit: 1,
}

// Account database
export function createAccount(account: string) {
  const connectionsDB = new PouchDB<Connection>(
    `${namespace}/${account}/connections`,
    defaultDbOptions
  )
  const fileImportsDB = new PouchDB<FileImport>(
    `${namespace}/${account}/file-imports`,
    defaultDbOptions
  )
  const auditLogsDB = new PouchDB<AuditLog>(`${namespace}/${account}/audit-logs`, defaultDbOptions)
  const transactionsDB = new PouchDB<Transaction>(
    `${namespace}/${account}/transactions`,
    defaultDbOptions
  )
  const balancesDB = new PouchDB<BalanceMap>(`${namespace}/${account}/balances`, defaultDbOptions)
  const networthDB = new PouchDB<Networth>(`${namespace}/${account}/networth`, defaultDbOptions)
  const keyValueDB = new PouchDB<{ value: unknown }>(
    `${namespace}/${account}/key-value`,
    defaultDbOptions
  )
  // transactionsDB.on("indexing", function (event) {
  //   console.log("Indexing", event)
  // })
  // auditLogsDB.on("indexing", function (event) {
  //   console.log("Indexing", event)
  // })

  return {
    auditLogsDB,
    balancesDB,
    connectionsDB,
    fileImportsDB,
    keyValueDB,
    networthDB,
    transactionsDB,
  }
}

export async function deleteAccount(account: string) {
  const {
    auditLogsDB,
    balancesDB,
    connectionsDB,
    fileImportsDB,
    keyValueDB,
    networthDB,
    transactionsDB,
  } = createAccount(account)
  await connectionsDB.destroy()
  await fileImportsDB.destroy()
  await auditLogsDB.destroy()
  await transactionsDB.destroy()
  await balancesDB.destroy()
  await networthDB.destroy()
  await keyValueDB.destroy()
}

export type AccountDatabase = ReturnType<typeof createAccount>

export let main = createAccount("main")

export async function resetAccount(account: string) {
  await deleteAccount(account)
  const accountDb = createAccount(account)

  if (account === "main") {
    main = accountDb
  }

  return accountDb
}

// Core database
export const core = {
  dailyPricesDB: new PouchDB<SavedPrice>(`${namespace}/core/daily-prices`, defaultDbOptions),
  sharedKeyValueDB: new PouchDB<{ value: unknown }>(
    `${namespace}/core/key-value`,
    defaultDbOptions
  ),
}

export function initCoreDatabase() {
  core.dailyPricesDB = new PouchDB<SavedPrice>(`${namespace}/core/daily-prices`, defaultDbOptions)
  core.sharedKeyValueDB = new PouchDB<{ value: unknown }>(
    `${namespace}/core/key-value`,
    defaultDbOptions
  )
}

export async function resetCoreDatabase() {
  await core.dailyPricesDB.destroy()
  await core.sharedKeyValueDB.destroy()
  initCoreDatabase()
}

export type CoreDatabase = ReturnType<typeof initCoreDatabase>
