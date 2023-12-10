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
import { IChartApi, ISeriesApi, SeriesType } from "lightweight-charts"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { useBoolean } from "../hooks/useBoolean"
import { ChartData } from "../interfaces"
import { TooltipPrimitive } from "../lightweight-charts/plugins/tooltip/tooltip"
import { $favoriteIntervals, $preferredInterval } from "../stores/chart-store"
import { Chart, ChartProps } from "./Chart"
import { QueryTimer } from "./QueryTimer"

interface SingleSeriesChartProps extends Omit<Partial<ChartProps>, "chartRef"> {
  data: ChartData[]
  /**
   * @default "Candlestick"
   */
  initType?: SeriesType
}

export function SingleSeriesChart(props: SingleSeriesChartProps) {
  const { data, initType = "Candlestick", ...rest } = props

  const chartRef = useRef<IChartApi | undefined>(undefined)
  const seriesRef = useRef<ISeriesApi<SeriesType> | undefined>(undefined)
  // const preferredType = useStore($preferredType)
  const [preferredType, setPreferredType] = useState<SeriesType>(initType)

  const activeType = useMemo(() => {
    if (data.length <= 0) return preferredType

    const isCandlestickData = "open" in data[0]

    if (preferredType === "Candlestick" && !isCandlestickData) {
      return "Area"
    }

    return preferredType
  }, [preferredType, data])

  const plotSeries = useCallback(
    (data: ChartData[]) => {
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
      } else if (activeType === "Histogram") {
        seriesRef.current = chartRef.current.addHistogramSeries({
          priceLineVisible: false,
        })
      } else {
        seriesRef.current = chartRef.current.addAreaSeries({
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
  const [queryTime, setQueryTime] = useState<number | null>(1230)

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
                sx={{ borderRadius: 0.5, paddingX: 1 }}
                key={interval}
                disabled={interval !== "1d"}
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
            <IconButton
              size="small"
              sx={{ borderRadius: 0.5 }}
              disabled={data.length > 0 && !("open" in data[0])}
              color={activeType === "Candlestick" ? "accent" : "secondary"}
              onClick={() => {
                setPreferredType("Candlestick")
              }}
            >
              <CandlestickChartSharp fontSize="inherit" />
            </IconButton>
            <IconButton
              size="small"
              sx={{ borderRadius: 0.5 }}
              color={activeType === "Area" ? "accent" : "secondary"}
              onClick={() => {
                setPreferredType("Area")
              }}
            >
              <ShowChart fontSize="inherit" />
            </IconButton>
            <IconButton
              size="small"
              sx={{ borderRadius: 0.5 }}
              color={activeType === "Histogram" ? "accent" : "secondary"}
              onClick={() => {
                setPreferredType("Histogram")
              }}
            >
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
          <Button sx={{ borderRadius: 0.5, paddingX: 1 }} size="small" color="secondary">
            Source: Binance.com
          </Button>
        </Stack>
        <Button
          color={logScale ? "accent" : "secondary"}
          size="small"
          variant="text"
          onClick={toggleLogScale}
          sx={{ borderRadius: 0.5, paddingX: 1 }}
        >
          Log scale
        </Button>
      </Stack>
    </Stack>
  )
}
