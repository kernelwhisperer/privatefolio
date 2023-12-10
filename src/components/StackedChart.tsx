import { Box, Button, Stack } from "@mui/material"
import { IChartApi, ISeriesApi, WhitespaceData } from "lightweight-charts"
import React, { useCallback, useEffect, useRef } from "react"

import { useBoolean } from "../hooks/useBoolean"
import { StackedAreaData } from "../lightweight-charts/plugins/stacked-area-series/data"
import { StackedAreaSeries } from "../lightweight-charts/plugins/stacked-area-series/stacked-area-series"
import { TooltipPrimitive } from "../lightweight-charts/plugins/tooltip/tooltip"
import { Chart, ChartProps } from "./Chart"

export type StackedDataType = (StackedAreaData | WhitespaceData)[]

interface StackedChartProps extends Omit<Partial<ChartProps>, "chartRef"> {
  data: StackedDataType
}

export function StackedChart(props: StackedChartProps) {
  const { data, ...rest } = props

  const chartRef = useRef<IChartApi | undefined>(undefined)
  const seriesRef = useRef<ISeriesApi<any> | undefined>(undefined)

  const plotSeries = useCallback((data: StackedDataType) => {
    // console.log("📜 LOG > StackedChart > plotSeries > data:", data.length, !!chartRef.current)
    if (!chartRef.current || data.length === 0) {
      return
    }

    if (seriesRef.current) {
      try {
        chartRef.current.removeSeries(seriesRef.current)
      } catch {}
    }

    const customSeriesView = new StackedAreaSeries()
    seriesRef.current = chartRef.current.addCustomSeries(customSeriesView, {
      /* Options */
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

  return (
    <>
      <Stack
        sx={{ borderBottom: "1px solid var(--mui-palette-TableCell-border)", height: 32 }}
        alignItems="flex-end"
        justifyContent="center"
        paddingX={0.5}
      >
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
      <Box sx={{ height: "calc(100% - 32px)" }}>
        <Chart chartRef={chartRef} onChartReady={handleChartReady} logScale={logScale} {...rest} />
      </Box>
    </>
  )
}
