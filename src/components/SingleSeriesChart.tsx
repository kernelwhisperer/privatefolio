import {
  BarChartOutlined,
  CandlestickChartSharp,
  Fullscreen,
  FullscreenExit,
  MoreHoriz,
  ShowChart,
} from "@mui/icons-material"
import { Box, Button, Divider, IconButton, Stack } from "@mui/material"
import { useStore } from "@nanostores/react"
import { IChartApi, ISeriesApi, SeriesDataItemTypeMap, SeriesType } from "lightweight-charts"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { useBoolean } from "../hooks/useBoolean"
import { TooltipPrimitive } from "../lightweight-charts/plugins/tooltip/tooltip"
import { $favoriteIntervals, $preferredInterval, $preferredType } from "../stores/chart-store"
import { Chart, ChartProps } from "./Chart"
import { QueryTimer } from "./QueryTimer"

export type ChartData = SeriesDataItemTypeMap[SeriesType][]

interface SingleSeriesChartProps extends Omit<Partial<ChartProps>, "chartRef"> {
  data: ChartData
}

export function SingleSeriesChart(props: SingleSeriesChartProps) {
  const { data, ...rest } = props

  const chartRef = useRef<IChartApi | undefined>(undefined)
  const seriesRef = useRef<ISeriesApi<SeriesType> | undefined>(undefined)
  const preferredType = useStore($preferredType)

  const activeType = useMemo(() => {
    if (data.length <= 0) return preferredType

    const isCandlestickData = "open" in data[0]

    if (preferredType === "Candlestick" && !isCandlestickData) {
      return "Histogram"
    }

    return preferredType
  }, [preferredType, data])

  const plotSeries = useCallback(
    (data: ChartData) => {
      console.log("📜 LOG > HistogramChart > plotSeries > data:", data.length, !!chartRef.current)
      if (!chartRef.current || data.length <= 0) {
        return
      }

      if (seriesRef.current) {
        try {
          chartRef.current.removeSeries(seriesRef.current)
        } catch {}
      }

      if (activeType === "Candlestick") {
        seriesRef.current = chartRef.current.addCandlestickSeries({
          priceLineVisible: false,
        })
      } else {
        seriesRef.current = chartRef.current.addHistogramSeries({
          priceLineVisible: false,
        })
      }
      seriesRef.current.setData(data)
      //
      const tooltipPrimitive = new TooltipPrimitive()
      seriesRef.current.attachPrimitive(tooltipPrimitive)
    },
    [activeType]
  )

  useEffect(() => {
    plotSeries(data)
  }, [plotSeries, data])

  const handleChartReady = useCallback(() => {
    plotSeries(data)
  }, [plotSeries, data])

  const { value: logScale, toggle: toggleLogScale } = useBoolean(false)
  const { value: fullscreen, toggle: toggleFullscreen } = useBoolean(false)

  const favoriteIntervals = useStore($favoriteIntervals)
  const activeInterval = useStore($preferredInterval)
  const [queryTime, setQueryTime] = useState<number | null>(2)

  return (
    <Stack
      sx={{
        height: "100%",
        ...(fullscreen
          ? {
              bottom: 0,
              left: 0,
              position: "absolute",
              right: 0,
              top: 0,
            }
          : {
              // height: "calc(100% - 32px)",
            }),
      }}
    >
      <Stack
        sx={{ borderBottom: "1px solid var(--mui-palette-TableCell-border)", minHeight: 43 }}
        alignItems="center"
        justifyContent="space-between"
        paddingX={1.5}
        direction="row"
      >
        <Stack direction="row" gap={1}>
          <Stack direction="row">
            {favoriteIntervals.map((interval) => (
              <Button
                size="small"
                sx={{ borderRadius: 0.5 }}
                key={interval}
                // disabled={timeframes ? !timeframes.includes(interval as Timeframe) : false}
                // className={timeframe === interval ? "active" : undefined}
                title={interval}
                aria-label={interval}
                color={interval === activeInterval ? "accent" : "secondary"}
                onClick={() => {
                  $preferredInterval.set(interval)
                }}
              >
                {interval.replace("1d", "D").replace("1w", "W")}
              </Button>
            ))}
          </Stack>
          <Divider orientation="vertical" flexItem sx={{ marginY: 1 }} />
          <Stack direction="row">
            <IconButton size="small" color="accent">
              <CandlestickChartSharp fontSize="inherit" />
            </IconButton>
            <IconButton size="small" color="secondary">
              <ShowChart fontSize="inherit" />
            </IconButton>
            <IconButton size="small" color="secondary">
              <BarChartOutlined fontSize="inherit" />
            </IconButton>
          </Stack>
        </Stack>

        <Stack direction="row">
          <IconButton size="small" onClick={toggleFullscreen} color="secondary">
            {fullscreen ? <FullscreenExit fontSize="inherit" /> : <Fullscreen fontSize="inherit" />}
          </IconButton>
          <IconButton size="small" color="secondary">
            <MoreHoriz fontSize="inherit" />
          </IconButton>
        </Stack>
      </Stack>
      <Box sx={{ height: "calc(100%)" }}>
        <Chart chartRef={chartRef} onChartReady={handleChartReady} logScale={logScale} {...rest} />
      </Box>
      <Stack
        sx={{ borderTop: "1px solid var(--mui-palette-TableCell-border)", minHeight: 43 }}
        alignItems="center"
        justifyContent="space-between"
        paddingRight={1.5}
        direction="row"
      >
        <Stack direction="row" gap={1}>
          {queryTime !== undefined && <QueryTimer queryTime={queryTime} />}
          <Divider orientation="vertical" flexItem sx={{ marginY: 1 }} />
          <Button size="small" color="secondary">
            Source: Binance.com
          </Button>
        </Stack>
        <Button
          color={logScale ? "accent" : "secondary"}
          size="small"
          variant="text"
          onClick={toggleLogScale}
          sx={{ borderRadius: 0.5 }}
        >
          Log scale
        </Button>
      </Stack>
    </Stack>
  )
}
