import { Paper, Stack, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"
import { getFullMetadata } from "src/api/external/assets/coingecko-asset-api"
import { getCachedCoingeckoId } from "src/api/external/assets/coingecko-asset-cache"
import { CircularSpinner } from "src/components/CircularSpinner"
import { IdentifierBlock } from "src/components/IdentifierBlock"
import { NoDataAvailable } from "src/components/NoDataAvailable"
import { PlatformBlock } from "src/components/PlatformBlock"
import { SectionTitle } from "src/components/SectionTitle"
import { CoingeckoMetadataFull } from "src/interfaces"
import { getAssetPlatform } from "src/utils/assets-utils"

type AssetInfoProps = {
  assetId: string
}

export function AssetInfo(props: AssetInfoProps) {
  const { assetId } = props
  const [isLoading, setLoading] = useState(false)
  const [metadata, setMetadata] = useState<CoingeckoMetadataFull | null>(null)

  useEffect(() => {
    setLoading(true)
    getCachedCoingeckoId(assetId)
      .then(getFullMetadata)
      .then(setMetadata)
      .finally(() => setLoading(false))
  }, [assetId])

  const isEmpty = metadata === null

  return (
    <Paper sx={{ padding: 2 }}>
      {isLoading || isEmpty ? (
        <Stack justifyContent="center" alignItems="center" sx={{ height: 260 }}>
          {isEmpty && !isLoading && <NoDataAvailable />}
          {isLoading && <CircularSpinner color="secondary" />}
        </Stack>
      ) : (
        <Typography variant="body2" component="div">
          <Stack gap={2}>
            <div>
              <SectionTitle>Coingecko ID</SectionTitle>
              <IdentifierBlock id={metadata.id} />
            </div>
            <div>
              <SectionTitle>Platform</SectionTitle>
              <PlatformBlock platform={getAssetPlatform(assetId)} />
            </div>
            <div>
              <SectionTitle>Description</SectionTitle>
              <span> {metadata?.description.en || "No description available."}</span>
            </div>
            {/* categories */}
            {/* genesis_date */}
            {/* last_updated */}
            {/* market_cap_rank */}
            {/* watchlist_portfolio_users */}
            {/* links */}
            {/* market data */}
            {/* community data */}
            {/* dev data? */}
            {/* tickers */}
            {/* platforms */}
          </Stack>
        </Typography>
      )}
    </Paper>
  )
}
