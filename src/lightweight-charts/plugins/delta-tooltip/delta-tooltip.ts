/* eslint-disable @typescript-eslint/member-ordering */
import { alpha } from "@mui/material"
import {
  AreaStyleOptions,
  CandlestickData,
  ColorType,
  CrosshairMode,
  ISeriesPrimitive,
  ISeriesPrimitivePaneView,
  LineData,
  LineStyleOptions,
  SeriesAttachedParameter,
  Time,
  WhitespaceData,
} from "lightweight-charts"

import { greenColor, redColor } from "../../../utils/chart-utils"
import { formatNumber } from "../../../utils/formatting-utils"
import { Delegate, ISubscription } from "../../helpers/delegate"
import { convertTime, formattedDateAndTime } from "../../helpers/time"
import { MultiTouchCrosshairPaneView, TooltipCrosshairLineData } from "./crosshair-line-pane"
import {
  DeltaSingleTooltipData,
  DeltaTooltipData,
  DeltaTooltipPaneView,
} from "./delta-tooltip-pane"
import { MultiTouchChartEvents, MultiTouchInteraction } from "./multi-touch-chart-events"

const defaultOptions: TooltipPrimitiveOptions = {
  currencySymbol: "",
  priceExtractor: (
    data: LineData | CandlestickData | WhitespaceData,
    significantDigits: number
  ) => {
    if ((data as LineData).value !== undefined) {
      return [
        (data as LineData).value,
        formatNumber((data as LineData).value, {
          maximumFractionDigits: significantDigits,
          minimumFractionDigits: significantDigits,
        }),
      ]
    }
    if ((data as CandlestickData).close !== undefined) {
      return [
        (data as CandlestickData).close,
        formatNumber((data as CandlestickData).close, {
          maximumFractionDigits: significantDigits,
          minimumFractionDigits: significantDigits,
        }),
      ]
    }
    return [0, ""]
  },
  showTime: false,
  significantDigits: 2,
  topOffset: 15,
}

export interface TooltipPrimitiveOptions {
  priceExtractor: <T extends WhitespaceData>(
    dataPoint: T,
    significantDigits: number
  ) => [number, string]
  showTime: boolean
  topOffset: number
  /**
   * @default 2
   */
  significantDigits: number
  /**
   * @default ""
   */
  currencySymbol: string
}

export interface ActiveRange {
  from: number
  to: number
  positive: boolean
}

export class DeltaTooltipPrimitive implements ISeriesPrimitive<Time> {
  private _options: TooltipPrimitiveOptions
  _crosshairPaneView: MultiTouchCrosshairPaneView
  _deltaTooltipPaneView: DeltaTooltipPaneView
  _paneViews: ISeriesPrimitivePaneView[]
  _crosshairData: TooltipCrosshairLineData[] = []
  _tooltipData: Partial<DeltaTooltipData>
  _attachedParams: SeriesAttachedParameter<Time> | undefined
  _touchChartEvents: MultiTouchChartEvents | null = null

  private _activeRange: Delegate<ActiveRange | null> = new Delegate()

  constructor(options: Partial<TooltipPrimitiveOptions>) {
    this._options = {
      ...defaultOptions,
      ...options,
    }
    this._tooltipData = {
      topSpacing: this._options.topOffset,
    }
    this._crosshairPaneView = new MultiTouchCrosshairPaneView(this._crosshairData)
    this._deltaTooltipPaneView = new DeltaTooltipPaneView(this._tooltipData)
    this._paneViews = [this._crosshairPaneView, this._deltaTooltipPaneView]
  }

  attached(param: SeriesAttachedParameter<Time>): void {
    this._attachedParams = param
    this._setCrosshairMode()
    this._touchChartEvents = new MultiTouchChartEvents(param.chart, {
      simulateMultiTouchUsingMouseDrag: true,
    })
    this._touchChartEvents.leave().subscribe(() => {
      this._activeRange.fire(null)
      this._hideCrosshair()
    }, this)
    this._touchChartEvents.move().subscribe((interactions: MultiTouchInteraction) => {
      this._showTooltip(interactions)
    }, this)
  }

  detached(): void {
    if (this._touchChartEvents) {
      this._touchChartEvents.leave().unsubscribeAll(this)
      this._touchChartEvents.move().unsubscribeAll(this)
      this._touchChartEvents.destroy()
    }
    this._activeRange.destroy()
  }

  paneViews() {
    return this._paneViews
  }

  updateAllViews() {
    this._crosshairPaneView.update(this._crosshairData)
    this._deltaTooltipPaneView.update(this._tooltipData)
  }

  setData(crosshairData: TooltipCrosshairLineData[], tooltipData: Partial<DeltaTooltipData>) {
    this._crosshairData = crosshairData
    this._tooltipData = tooltipData
    this.updateAllViews()
    this._attachedParams?.requestUpdate()
  }

  currentColor() {
    return "rgba(127, 127, 127, 0.5)"
  }

  chart() {
    return this._attachedParams?.chart
  }

  series() {
    return this._attachedParams?.series
  }

  applyOptions(options: Partial<TooltipPrimitiveOptions>) {
    this._options = {
      ...this._options,
      ...options,
    }
    this._tooltipData.topSpacing = this._options.topOffset
  }

  public activeRange(): ISubscription<ActiveRange | null> {
    return this._activeRange
  }

  private _setCrosshairMode() {
    const chart = this.chart()
    if (!chart) {
      throw new Error("Unable to change crosshair mode because the chart instance is undefined")
    }
    chart.applyOptions({
      crosshair: {
        horzLine: {
          labelVisible: false,
          visible: false,
        },
        mode: CrosshairMode.Magnet,
        vertLine: {
          labelVisible: false,
          visible: false,
        },
      },
    })
    const series = this.series()
    if (series) {
      // We need to draw the crosshair markers ourselves since there can be multiple points now.
      series.applyOptions({ crosshairMarkerVisible: false })
    }
  }

  private _hideTooltip() {
    // this.setData([], {
    //   tooltips: [],
    // })
  }

  private _hideCrosshair() {
    this._hideTooltip()
  }

  private _chartBackgroundColor(): string {
    const chart = this.chart()
    if (!chart) {
      return "#FFFFFF"
    }
    const backgroundOptions = chart.options().layout.background
    if (backgroundOptions.type === ColorType.Solid) {
      return backgroundOptions.color
    }
    return backgroundOptions.topColor
  }

  private _seriesLineColor(): string {
    const series = this.series()
    if (!series) {
      return "#888"
    }
    const seriesOptions = series.options()
    return (
      (seriesOptions as LineStyleOptions).color ||
      (seriesOptions as AreaStyleOptions).lineColor ||
      "#888"
    )
  }

  private _showTooltip(interactions: MultiTouchInteraction) {
    const series = this.series()
    if (interactions.points.length < 1 || !series) {
      this._hideCrosshair()
      return
    }
    const topMargin = this._tooltipData.topSpacing ?? 20
    const markerBorderColor = this._chartBackgroundColor()
    const markerColor = this._seriesLineColor()
    const tooltips: DeltaSingleTooltipData[] = []
    const crosshairData: TooltipCrosshairLineData[] = []
    const priceValues: [number, number][] = []
    const firstPointIndex = interactions.points[0].index
    for (let i = 0; i < Math.min(2, interactions.points.length); i++) {
      const point = interactions.points[i]
      const data = series.dataByIndex(point.index)
      if (data) {
        const [priceValue, priceString] = this._options.priceExtractor(
          data,
          this._options.significantDigits
        )
        priceValues.push([priceValue, point.index])
        const priceY = series.priceToCoordinate(priceValue) ?? -1000
        const [date, time] = formattedDateAndTime(data.time ? convertTime(data.time) : undefined)
        const state: DeltaSingleTooltipData = {
          lineContent: [date, `${this._options.currencySymbol}${priceString}`],
          x: point.x,
        }
        if (this._options.showTime) {
          state.lineContent.push(time)
        }
        if (point.index >= firstPointIndex) {
          tooltips.push(state)
        } else {
          tooltips.unshift(state) // place at front so order is correct.
        }

        crosshairData.push({
          color: this.currentColor(),
          markerBorderColor,
          markerColor,
          priceY,
          topMargin,
          visible: true,
          x: point.x,
        })
      }
    }
    const deltaContent: Partial<DeltaTooltipData> = {
      tooltips,
    }
    if (priceValues.length > 1) {
      const barLength = Math.abs(priceValues[1][1] - priceValues[0][1])
      const correctOrder = priceValues[1][1] > priceValues[0][1]
      const firstPrice = correctOrder ? priceValues[0][0] : priceValues[1][0]
      const secondPrice = correctOrder ? priceValues[1][0] : priceValues[0][0]
      const priceChange = secondPrice - firstPrice
      const pctChange = (100 * priceChange) / firstPrice
      const positive = priceChange >= 0
      deltaContent.deltaTopLine = `${barLength} days` // TODO
      deltaContent.deltaBottomLine = `${positive ? "+" : ""}${formatNumber(priceChange, {
        maximumFractionDigits: this._options.significantDigits,
        minimumFractionDigits: this._options.significantDigits,
      })} ${positive ? "+" : ""}${pctChange.toFixed(2)}%`
      deltaContent.deltaBackgroundColor = positive ? alpha(greenColor, 0.2) : alpha(redColor, 0.2)
      deltaContent.deltaTextColor = positive ? greenColor : redColor
      this._activeRange.fire({
        from: priceValues[correctOrder ? 0 : 1][1] + 1,
        positive,
        to: priceValues[correctOrder ? 1 : 0][1] + 1,
      })
    } else {
      deltaContent.deltaTopLine = ""
      deltaContent.deltaBottomLine = ""
      this._activeRange.fire(null)
    }
    this.setData(crosshairData, deltaContent)
  }
}
