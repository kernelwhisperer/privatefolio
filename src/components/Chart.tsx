"use client"

import { Box, useTheme } from "@mui/material"
import { createChart, CrosshairMode, IChartApi } from "lightweight-charts"
import React, { memo, MutableRefObject, useEffect, useMemo, useRef } from "react"

import { MonoFont } from "../theme"
import { noop } from "../utils/utils"

export type ChartProps = {
  allowCompactPriceScale?: boolean
  chartRef: MutableRefObject<IChartApi | undefined>
  onChartReady?: () => void
  significantDigits: number
  unitLabel: string
}

function BaseChart(props: ChartProps) {
  const {
    chartRef,
    unitLabel,
    significantDigits,
    allowCompactPriceScale,
    onChartReady = noop,
  } = props

  const theme = useTheme()
  const containerRef = useRef<HTMLElement>()

  const chartOptions = useMemo(
    () => ({
      crosshair: {
        horzLine: {
          labelBackgroundColor: theme.palette.primary.main,
        },
        mode: CrosshairMode.Normal,
        vertLine: {
          labelBackgroundColor: theme.palette.primary.main,
        },
      },
      grid: {
        horzLines: {
          color: theme.palette.divider,
        },
        vertLines: {
          color: theme.palette.divider,
        },
      },
      // handleScale: false,
      // handleScroll: false,

      // handleScroll: {
      // mouseWheel: false,
      // },
      layout: {
        background: {
          color: "transparent", // theme.palette.background.default
        },
        fontFamily: MonoFont,
        textColor: theme.palette.text.primary,
      },
      // localization: {
      //   priceFormatter: createPriceFormatter(significantDigits, unitLabel, allowCompactPriceScale),
      // },
      width: containerRef.current?.clientWidth,
    }),
    [theme]
  )

  useEffect(() => {
    console.log("📜 LOG > BaseChart > useEffect > init", !!containerRef.current)
    if (!containerRef.current) return

    chartRef.current = createChart(containerRef.current, chartOptions)

    chartRef.current.timeScale().applyOptions({
      borderVisible: false,
      // rightOffset: isMobile || window.location.toString().includes("machine=true") ? 4 : 8,
      // secondsVisible: ["Block"].includes($timeframe.get()),
      // timeVisible: ["Hour", "Minute", "Block"].includes($timeframe.get()),
    })

    chartRef.current.priceScale("right").applyOptions({
      borderVisible: false,
      // entireTextOnly: true,
    })

    const handleResize = () => {
      chartRef.current?.applyOptions({
        height: containerRef.current?.clientHeight,
        width: containerRef.current?.clientWidth,
      })
    }
    window.addEventListener("resize", handleResize)

    onChartReady()

    return function cleanup() {
      window.removeEventListener("resize", handleResize)
      chartRef.current?.remove()
      chartRef.current = undefined
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartRef, containerRef])

  useEffect(() => {
    chartRef.current?.applyOptions(chartOptions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartOptions])

  // TODO
  // unitLabel,
  // significantDigits,
  // allowCompactPriceScale,
  // onChartReady,

  return (
    <Box
      sx={{
        "& tr:first-of-type td": { cursor: "crosshair" },
        height: "100%",
        position: "relative",
        width: "100%",
      }}
      ref={containerRef}
    />
  )
}

export const Chart = memo(BaseChart)
