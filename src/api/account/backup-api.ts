import JSZip, { JSZipObject } from "jszip"
import { ProgressCallback } from "src/stores/task-store"
import { noop } from "src/utils/utils"

import { getAccount } from "../database"
import { validateOperation } from "../database-utils"
import { indexAuditLogs } from "./audit-logs-api"
import { indexDailyPrices } from "./daily-prices-api"
import { indexTransactions } from "./transactions-api"

async function stringifyDatabase(db: PouchDB.Database) {
  const { rows } = await db.allDocs({ include_docs: true })
  const docs = rows.map((row) => row.doc)
  return JSON.stringify(docs, null, 2)
}

export async function backupAccount(accountName: string): Promise<Blob> {
  const account = getAccount(accountName)

  const {
    assetsDB,
    auditLogsDB,
    balancesDB,
    connectionsDB,
    dailyPricesDB,
    fileImportsDB,
    keyValueDB,
    networthDB,
    transactionsDB,
  } = account

  const zip = new JSZip()
  zip.file("audit-logs.json", await stringifyDatabase(auditLogsDB))
  zip.file("transactions.json", await stringifyDatabase(transactionsDB))
  zip.file("assets.json", await stringifyDatabase(assetsDB))
  zip.file("balances.json", await stringifyDatabase(balancesDB))
  zip.file("connections.json", await stringifyDatabase(connectionsDB))
  zip.file("file-imports.json", await stringifyDatabase(fileImportsDB))
  zip.file("networth.json", await stringifyDatabase(networthDB))
  zip.file("daily-prices.json", await stringifyDatabase(dailyPricesDB))
  zip.file("kv-store.json", await stringifyDatabase(keyValueDB))

  const blob = await zip.generateAsync({ type: "blob" })
  return blob
}

async function populateDatabaseWithFile(file: JSZipObject, db: PouchDB.Database) {
  if (!file) throw new Error("File not found")
  const rowsAsString = await file.async("string")
  const rows = JSON.parse(rowsAsString)
  const updates = await db.bulkDocs(rows)
  validateOperation(updates)
}

export async function restoreAccount(
  accountName: string,
  file: File,
  progress: ProgressCallback = noop
) {
  const account = getAccount(accountName)

  const {
    assetsDB,
    auditLogsDB,
    balancesDB,
    connectionsDB,
    dailyPricesDB,
    fileImportsDB,
    keyValueDB,
    networthDB,
    transactionsDB,
  } = account

  const { files } = await JSZip.loadAsync(file)

  progress([0, "Restoring key-value store"])
  await populateDatabaseWithFile(files["kv-store.json"], keyValueDB)
  progress([11, "Restoring networth"])
  await populateDatabaseWithFile(files["networth.json"], networthDB)
  progress([22, "Restoring balances"])
  await populateDatabaseWithFile(files["balances.json"], balancesDB)
  progress([33, "Restoring connections"])
  await populateDatabaseWithFile(files["connections.json"], connectionsDB)
  progress([44, "Restoring file imports"])
  await populateDatabaseWithFile(files["file-imports.json"], fileImportsDB)
  progress([55, "Restoring assets"])
  await populateDatabaseWithFile(files["assets.json"], assetsDB)
  progress([66, "Restoring transactions"])
  await populateDatabaseWithFile(files["transactions.json"], transactionsDB)
  await indexTransactions(accountName)
  progress([77, "Restoring audit logs"])
  await populateDatabaseWithFile(files["audit-logs.json"], auditLogsDB)
  await indexAuditLogs(accountName)
  progress([88, "Restoring daily prices"])
  await populateDatabaseWithFile(files["daily-prices.json"], dailyPricesDB)
  await indexDailyPrices(accountName)
}
