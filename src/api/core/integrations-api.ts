import { Blockchain, Exchange } from "../../interfaces"
import {
  BLOCKCHAIN_FILES_LOCATION,
  BLOCKCHAIN_PAGES,
  EXCHANGE_FILES_LOCATION,
  EXCHANGE_PAGES,
} from "../../settings"
import { IntegrationMap } from "../../stores/metadata-store"

export async function findIntegrations(nameMap: Record<string, boolean>) {
  const map: IntegrationMap = {}

  if (Object.keys(nameMap).length === 0) {
    return map
  }

  for (let page = 1; page <= EXCHANGE_PAGES; page++) {
    // console.log(`Exchanges: Fetching page ${page}`)
    const response = await fetch(`${EXCHANGE_FILES_LOCATION}/page-${page}.json`)
    const exchanges: Exchange[] = await response.json()

    for (const exchange of exchanges) {
      if (nameMap[exchange.name.toLowerCase()]) {
        map[exchange.name.toLowerCase()] = exchange
      }
    }
    // TODO: stop if completed
    // console.log(`Exchanges: Parsed page ${page}`)
  }

  for (let page = 1; page <= BLOCKCHAIN_PAGES; page++) {
    // console.log(`Exchanges: Fetching page ${page}`)
    const response = await fetch(`${BLOCKCHAIN_FILES_LOCATION}/page-${page}.json`)
    const chains: Blockchain[] = await response.json()

    for (const chain of chains) {
      if (nameMap[chain.name.toLowerCase()]) {
        map[chain.name.toLowerCase()] = chain
      }
    }
    // TODO: stop if completed
    // console.log(`Exchanges: Parsed page ${page}`)
  }

  return map
}
