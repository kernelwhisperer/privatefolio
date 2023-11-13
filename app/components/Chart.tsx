import { useTheme } from "@mui/material"
import { ColorType, createChart } from "lightweight-charts"
import React, { useEffect, useRef } from "react"

export const Chart = ({ data = [] }) => {
  const theme = useTheme()

  // const data = [
  //   { time: "2018-12-22", value: 32.51 },
  //   { time: "2018-12-23", value: 31.11 },
  //   { time: "2018-12-24", value: 27.02 },
  //   { time: "2018-12-25", value: 27.32 },
  //   { time: "2018-12-26", value: 25.17 },
  //   { time: "2018-12-27", value: 28.89 },
  //   { time: "2018-12-28", value: 25.46 },
  //   { time: "2018-12-29", value: 23.92 },
  //   { time: "2018-12-30", value: 22.68 },
  //   { time: "2018-12-31", value: 22.67 },
  // ];
  const { lineColor = theme.palette.primary.main, textColor = theme.palette.text.primary } = {}

  const chartContainerRef = useRef<HTMLElement>()

  useEffect(() => {
    if (!chartContainerRef.current) return

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth })
    }

    const chart = createChart(chartContainerRef.current, {
      grid: {
        horzLines: {
          color: "transparent",
        },
        vertLines: {
          color: "transparent",
        },
      },
      height: 300,
      layout: {
        background: { color: "transparent", type: ColorType.Solid },
        textColor,
      },
      width: chartContainerRef.current.clientWidth,
    })
    chart.timeScale().applyOptions({
      // barSpacing: 10,
      // timeVisible: true,
    })
    chart.timeScale().fitContent()
    chart.priceScale().applyOptions({
      //  mode: 1
      autoScale: false,
    })

    const newSeries = chart.addHistogramSeries({
      color: lineColor,
    })
    newSeries.setData(data)

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)

      chart.remove()
    }
  }, [data, lineColor, textColor, chartContainerRef])

  return <div ref={chartContainerRef} />
}
