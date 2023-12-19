import {
  BarChartOutlined,
  CandlestickChartSharp,
  ControlCamera,
  StraightenSharp,
} from "@mui/icons-material"
import {
  alpha,
  Box,
  Button,
  Divider,
  IconButton,
  IconButtonProps,
  Paper,
  Skeleton,
  Stack,
  SvgIcon,
  Tooltip,
} from "@mui/material"
import { useStore } from "@nanostores/react"
import { a, useTransition } from "@react-spring/web"
import {
  DeepPartial,
  IChartApi,
  ISeriesApi,
  SeriesOptionsCommon,
  SeriesType,
} from "lightweight-charts"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { useBoolean } from "../hooks/useBoolean"
import { ChartData } from "../interfaces"
import { DeltaTooltipPrimitive } from "../lightweight-charts/plugins/delta-tooltip/delta-tooltip"
import {
  TooltipPrimitive,
  TooltipPrimitiveOptions,
} from "../lightweight-charts/plugins/tooltip/tooltip"
import { $favoriteIntervals, $preferredInterval } from "../stores/chart-store"
import { candleStickOptions, CHART_HEIGHT, greenColor, greenColorDark } from "../utils/chart-utils"
import { SPRING_CONFIGS } from "../utils/utils"
import { Chart, ChartProps } from "./Chart"
import { QueryTimer } from "./QueryTimer"

export function ChartIconButton({ active, ...rest }: IconButtonProps & { active: boolean }) {
  return (
    <IconButton
      size="small"
      sx={{ borderRadius: 0.5 }}
      color={active ? "accent" : "secondary"}
      {...rest}
    />
  )
}

export type QueryFunction = () => Promise<ChartData[]>

interface SingleSeriesChartProps extends Omit<Partial<ChartProps>, "chartRef"> {
  height?: number
  /**
   * @default "Candlestick"
   */
  initType?: SeriesType
  queryFn: QueryFunction
  seriesOptions?: DeepPartial<SeriesOptionsCommon>
  tooltipOptions?: Partial<TooltipPrimitiveOptions>
}

export function SingleSeriesChart(props: SingleSeriesChartProps) {
  const {
    queryFn,
    initType = "Candlestick",
    height = CHART_HEIGHT,
    seriesOptions = {},
    tooltipOptions = {},
    ...rest
  } = props

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

  const shiftPressedRef = useRef(false)
  const ctrlPressedRef = useRef(false)

  const [cursorType, setCursorType] = useState<"move" | "inspect" | "measure">("move")

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
          ...candleStickOptions,
          priceLineVisible: false,
          ...seriesOptions,
        })
      } else if (activeType === "Histogram") {
        seriesRef.current = chartRef.current.addHistogramSeries({
          color: greenColorDark,
          priceLineVisible: false,
          ...seriesOptions,
        })
      } else {
        seriesRef.current = chartRef.current.addAreaSeries({
          bottomColor: alpha(greenColor, 0),
          lineColor: greenColor,
          // lineType: 2,
          lineWidth: 2,
          priceLineVisible: false,
          ...seriesOptions,
        })
      }
      seriesRef.current.setData(data)
      //
      const regularTooltip = new TooltipPrimitive(tooltipOptions)
      const deltaTooltip = new DeltaTooltipPrimitive({
        currencySymbol: tooltipOptions.currencySymbol,
        significantDigits: tooltipOptions.significantDigits,
      })
      //
      seriesRef.current.attachPrimitive(regularTooltip)

      function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Shift" && !shiftPressedRef.current) {
          shiftPressedRef.current = true
          chartRef.current?.applyOptions({
            handleScale: false,
            handleScroll: false,
          })
          seriesRef.current?.detachPrimitive(regularTooltip)
          seriesRef.current?.attachPrimitive(deltaTooltip)
          setCursorType("measure")
        } else if (event.key === "Control") {
          ctrlPressedRef.current = false
          chartRef.current?.applyOptions({
            handleScale: false,
            handleScroll: false,
          })
          setCursorType("inspect")
        }
      }

      function handleKeyup(event: KeyboardEvent) {
        if (event.key === "Shift") {
          shiftPressedRef.current = false
          chartRef.current?.applyOptions({
            handleScale: true,
            handleScroll: true,
          })
          seriesRef.current?.detachPrimitive(deltaTooltip)
          seriesRef.current?.attachPrimitive(regularTooltip)
          setCursorType("move")
        } else if (event.key === "Control") {
          ctrlPressedRef.current = false
          chartRef.current?.applyOptions({
            handleScale: true,
            handleScroll: true,
          })
          setCursorType("move")
        }
      }

      document.addEventListener("keydown", handleKeydown)
      document.addEventListener("keyup", handleKeyup)

      return () => {
        document.removeEventListener("keydown", handleKeydown)
        document.removeEventListener("keyup", handleKeyup)
      }
    },
    [activeType, seriesOptions, tooltipOptions]
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
            <Stack gap={1.5} sx={{ height, paddingY: 1 }} justifyContent="center">
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
                {/* <Skeleton animation={false} variant="rounded" width={37} height={320}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={220}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={340}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={260}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={290}></Skeleton>
                <Skeleton animation={false} variant="rounded" width={37} height={300}></Skeleton> */}
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
                    <Tooltip title="Move">
                      <span>
                        <ChartIconButton
                          active={cursorType === "move"}
                          onClick={() => setCursorType("move")}
                        >
                          <ControlCamera fontSize="inherit" />
                        </ChartIconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Inspect">
                      <span>
                        <ChartIconButton
                          active={cursorType === "inspect"}
                          onClick={() => setCursorType("inspect")}
                        >
                          <SvgIcon fontSize="inherit">
                            {/* cc https://icon-sets.iconify.design/fluent/cursor-16-filled/ */}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                            >
                              <path
                                fill="currentColor"
                                d="M4.002 2.998a1 1 0 0 1 1.6-.8L13.6 8.2c.768.576.36 1.8-.6 1.8H9.053a1 1 0 0 0-.793.39l-2.466 3.215c-.581.758-1.793.347-1.793-.609z"
                              />
                            </svg>
                          </SvgIcon>
                        </ChartIconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Measure">
                      <span>
                        <ChartIconButton
                          active={cursorType === "measure"}
                          onClick={() => setCursorType("measure")}
                        >
                          <StraightenSharp fontSize="inherit" />
                        </ChartIconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                  <Divider orientation="vertical" flexItem />
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
                  <Divider orientation="vertical" flexItem />
                  <Stack direction="row">
                    <Tooltip title="Candlestick">
                      <span>
                        <ChartIconButton
                          disabled={data.length > 0 && !("open" in data[0])}
                          active={activeType === "Candlestick"}
                          onClick={() => setPreferredType("Candlestick")}
                        >
                          <CandlestickChartSharp fontSize="inherit" />
                        </ChartIconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Area">
                      <span>
                        <ChartIconButton
                          active={activeType === "Area"}
                          onClick={() => setPreferredType("Area")}
                        >
                          {/* <ShowChart fontSize="inherit" /> */}
                          {/* cc https://icon-sets.iconify.design/material-symbols/area-chart/ */}
                          <SvgIcon fontSize="inherit">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                            >
                              <path
                                fill="currentColor"
                                d="m21 16l-9.4-7.35l-3.975 5.475L3 10.5V7l4 3l5-7l5 4h4zM3 20v-7l5 4l4-5.5l9 7.025V20z"
                              />
                            </svg>
                          </SvgIcon>
                        </ChartIconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Histogram">
                      <span>
                        <ChartIconButton
                          active={activeType == "Histogram"}
                          onClick={() => setPreferredType("Histogram")}
                        >
                          <BarChartOutlined fontSize="inherit" />
                        </ChartIconButton>
                      </span>
                    </Tooltip>
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
              <Box sx={{ height: "calc(100% - 43px - 4px)" }}>
                <Chart
                  chartRef={chartRef}
                  onChartReady={handleChartReady}
                  logScale={logScale}
                  cursor={
                    cursorType === "move"
                      ? "move"
                      : cursorType === "inspect"
                      ? "pointer"
                      : "crosshair"
                  }
                  {...rest}
                />
              </Box>
              <Stack
                sx={{
                  "& > *": {
                    alignItems: "center",
                    background: "var(--mui-palette-background-paper)",
                    display: "flex",
                    height: 28,
                    paddingX: 1.5,
                  },
                  bottom: 4,
                  position: "absolute",
                  width: "100%",
                  zIndex: 1,
                }}
                justifyContent="space-between"
                direction="row"
              >
                <div>{queryTime !== undefined && <QueryTimer queryTime={queryTime} />}</div>
                <div>
                  <Button
                    color={logScale ? "accent" : "secondary"}
                    size="small"
                    variant="text"
                    onClick={toggleLogScale}
                    sx={{ borderRadius: 0.5, paddingX: 1 }}
                  >
                    Log scale
                  </Button>
                </div>
              </Stack>
            </Paper>
          )}
        </a.div>
      ))}
    </>
  )
}

/* <Divider orientation="vertical" flexItem sx={{ marginY: 1 }} />
                  <Button sx={{ borderRadius: 0.5, paddingX: 1 }} size="small" color="secondary">
                    Source: Binance.com
                  </Button> */
