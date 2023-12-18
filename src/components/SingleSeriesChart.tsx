import { BarChartOutlined, CandlestickChartSharp, ShowChart } from "@mui/icons-material"
import { Box, Button, Divider, IconButton, Paper, Skeleton, Stack } from "@mui/material"
import { useStore } from "@nanostores/react"
import { a, useTransition } from "@react-spring/web"
import { IChartApi, ISeriesApi, SeriesType } from "lightweight-charts"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { useBoolean } from "../hooks/useBoolean"
import { ChartData } from "../interfaces"
import { TooltipPrimitive } from "../lightweight-charts/plugins/tooltip/tooltip"
import { $favoriteIntervals, $preferredInterval } from "../stores/chart-store"
import { CHART_HEIGHT } from "../utils/chart-utils"
import { SPRING_CONFIGS } from "../utils/utils"
import { Chart, ChartProps } from "./Chart"
import { QueryTimer } from "./QueryTimer"

export type QueryFunction = () => Promise<ChartData[]>

interface SingleSeriesChartProps extends Omit<Partial<ChartProps>, "chartRef"> {
  height?: number
  /**
   * @default "Candlestick"
   */
  initType?: SeriesType
  queryFn: QueryFunction
}

export function SingleSeriesChart(props: SingleSeriesChartProps) {
  const { queryFn, initType = "Candlestick", height = CHART_HEIGHT, ...rest } = props

  const chartRef = useRef<IChartApi | undefined>(undefined)
  const seriesRef = useRef<ISeriesApi<SeriesType> | undefined>(undefined)
  // const preferredType = useStore($preferredType)
  const [preferredType, setPreferredType] = useState<SeriesType>(initType)
  const [loading, setLoading] = useState<boolean>(true)
  const [queryTime, setQueryTime] = useState<number | null>(null)
  const [data, setData] = useState<ChartData[]>([])

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
          lineType: 2,
          lineWidth: 2,
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

  useEffect(() => {
    setQueryTime(null)
    const start = Date.now()

    queryFn().then((result) => {
      setData(result)
      setLoading(false)
      setQueryTime(Date.now() - start)
    })
  }, [queryFn])

  const transitions = useTransition(loading, {
    config: SPRING_CONFIGS.veryQuick,
    enter: { opacity: 2 },
    exitBeforeEnter: true,
    from: { opacity: 2 },
    leave: { opacity: 1 },
  })

  return (
    <>
      {transitions((styles, isLoading) => (
        <a.div style={styles}>
          {isLoading ? (
            <Stack gap={1.5} sx={{ marginY: 1 }}>
              <Stack direction="row" gap={1.5} alignItems={"flex-end"}>
                <Skeleton animation={false} variant="rounded" width={37} height={320}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={260}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={340}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={280}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={320}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={220}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={340}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={260}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={290}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={300}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={320}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={260}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={340}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={280}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={320}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={220}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={340}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={260}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={290}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={300}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={320}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={260}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={340}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={280}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={320}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={220}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={340}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={260}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={290}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={300}></Skeleton>
              </Stack>
            </Stack>
          ) : (
            <Paper
              sx={{
                height,
                overflow: "hidden", // because of borderRadius
                position: "relative",
                // height: "100%",
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
                sx={{
                  borderBottom: "1px solid var(--mui-palette-TableCell-border)",
                  minHeight: 43,
                }}
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
                  {/* <IconButton size="small" onClick={toggleFullscreen} color="secondary">
                    {fullscreen ? (
                      <FullscreenExit fontSize="inherit" />
                    ) : (
                      <Fullscreen fontSize="inherit" />
                    )}
                  </IconButton>
                  <IconButton size="small" color="secondary">
                    <MoreHoriz fontSize="inherit" />
                  </IconButton> */}
                </Stack>
              </Stack>
              <Box sx={{ height: "calc(100% - 86px)" }}>
                <Chart
                  chartRef={chartRef}
                  onChartReady={handleChartReady}
                  logScale={logScale}
                  {...rest}
                />
              </Box>
              <Stack
                sx={{ borderTop: "1px solid var(--mui-palette-TableCell-border)", minHeight: 43 }}
                alignItems="center"
                justifyContent="space-between"
                direction="row"
                paddingX={1.5}
              >
                <Stack direction="row" gap={1}>
                  {queryTime !== undefined && <QueryTimer queryTime={queryTime} />}
                  {/* <Divider orientation="vertical" flexItem sx={{ marginY: 1 }} />
                  <Button sx={{ borderRadius: 0.5, paddingX: 1 }} size="small" color="secondary">
                    Source: Binance.com
                  </Button> */}
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
            </Paper>
          )}
        </a.div>
      ))}
    </>
  )
}
