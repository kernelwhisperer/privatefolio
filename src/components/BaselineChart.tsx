import { IChartApi, ISeriesApi, SeriesDataItemTypeMap } from "lightweight-charts"
import React, { useCallback, useEffect, useRef } from "react"

import { TooltipPrimitive } from "../lightweight-charts/plugins/tooltip/tooltip"
import { Chart, ChartProps } from "./Chart"

export type BaselineDataType = SeriesDataItemTypeMap["Baseline"][]

interface BalanceChartProps extends Omit<ChartProps, "chartRef"> {
  data: BaselineDataType
}

export function BaselineChart(props: BalanceChartProps) {
  const { data, ...rest } = props

  const chartRef = useRef<IChartApi | undefined>(undefined)
  const seriesRef = useRef<ISeriesApi<"Baseline"> | undefined>(undefined)

  const plotSeries = useCallback((data: BaselineDataType) => {
    console.log("📜 LOG > BaselineChart > plotSeries > data:", data.length, !!chartRef.current)
    if (!chartRef.current || data.length === 0) {
      return
    }

    if (seriesRef.current) {
      try {
        chartRef.current.removeSeries(seriesRef.current)
      } catch {}
    }

    seriesRef.current = chartRef.current.addBaselineSeries({
      baseLineColor: "rgba(0, 0, 0, 0)",
      baseLineVisible: false,
      baseValue: { price: 0, type: "price" },
      lineType: 0,
      lineWidth: 1,
      priceLineVisible: false,
    })
    seriesRef.current.setData(data)
    // const tooltipPrimitive = new DeltaTooltipPrimitive({
    //   lineColor: "rgba(0, 0, 0, 0.2)",
    // })

    // seriesRef.current.attachPrimitive(tooltipPrimitive)

    const tooltipPrimitive = new TooltipPrimitive()

    seriesRef.current.attachPrimitive(tooltipPrimitive)

    // chartRef.current.timeScale().fitContent()
  }, [])

  useEffect(() => {
    plotSeries(data)
  }, [plotSeries, data])

  const handleChartReady = useCallback(() => {
    plotSeries(data)
  }, [plotSeries, data])

  return (
    <>
      <Chart chartRef={chartRef} onChartReady={handleChartReady} {...rest} />
    </>
  )
}
