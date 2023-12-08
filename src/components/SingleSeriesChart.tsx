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
import { IChartApi, ISeriesApi, SeriesDataItemTypeMap } from "lightweight-charts"
import React, { useCallback, useEffect, useRef } from "react"

import { useBoolean } from "../hooks/useBoolean"
import { TooltipPrimitive } from "../lightweight-charts/plugins/tooltip/tooltip"
import { $favoriteIntervals, $preferredInterval } from "../stores/chart-store"
import { Chart, ChartProps } from "./Chart"

export type ChartData = SeriesDataItemTypeMap["Histogram"][]

interface SingleSeriesChartProps extends Omit<Partial<ChartProps>, "chartRef"> {
  data: ChartData
}

export function SingleSeriesChart(props: SingleSeriesChartProps) {
  const { data, ...rest } = props

  const chartRef = useRef<IChartApi | undefined>(undefined)
  const seriesRef = useRef<ISeriesApi<"Histogram"> | undefined>(undefined)

  const plotSeries = useCallback((data: ChartData) => {
    console.log("📜 LOG > HistogramChart > plotSeries > data:", data.length, !!chartRef.current)
    if (!chartRef.current || data.length === 0) {
      return
    }

    if (seriesRef.current) {
      try {
        chartRef.current.removeSeries(seriesRef.current)
      } catch {}
    }

    seriesRef.current = chartRef.current.addHistogramSeries({
      priceLineVisible: false,
    })
    seriesRef.current.setData(data)
    //
    const tooltipPrimitive = new TooltipPrimitive()
    seriesRef.current.attachPrimitive(tooltipPrimitive)
  }, [])

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
        sx={{ borderBottom: "1px solid var(--mui-palette-TableCell-border)", minHeight: 34 }}
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
          <Button
            color={logScale ? "accent" : "secondary"}
            size="small"
            variant="text"
            onClick={toggleLogScale}
            sx={{ borderRadius: 0.5 }}
          >
            Log scale
          </Button>
          <IconButton size="small" onClick={toggleFullscreen} color="secondary">
            {fullscreen ? <FullscreenExit fontSize="inherit" /> : <Fullscreen fontSize="inherit" />}
          </IconButton>
          <IconButton size="small" color="secondary">
            <MoreHoriz fontSize="inherit" />
          </IconButton>
        </Stack>
      </Stack>
      <Box
        sx={{
          height: "calc(100% - 32px)",
        }}
      >
        <Chart chartRef={chartRef} onChartReady={handleChartReady} logScale={logScale} {...rest} />
      </Box>
    </Stack>
  )
}
