import { ReactNode } from 'react'

export interface СandlestickСhartProps {
    viewHeight?: number
    viewWidth?: 'auto' | string
    marginTop?: number
    marginLeft?: number
    marginRight?: number
    marginBottom?: number
    axisYWidth?: number
    axisYSpaceBetween?: number
    candlesSpaceBetween?: number
    сandlesChartPercentageHeight?: number
    volumeChartPercentageHeight?: number
    candleBodyWidth?: number
}

export type IData = Array<Record<string, any>>

export type SignalData = Array<Record<string, any>>

export interface DrawSignalMethods<Signal extends SignalData> {
    type: (signal: Signal[number]) => SignalParams['type']
    x: (signal: Signal[number]) => number
    y: (signal: Signal[number]) => number
    jsxTemplate: (signal: Signal[number]) => ReactNode
}

export interface InitMethods<InitialData extends IData> {
    x: (d: InitialData[number]) => number
    highest: (d: InitialData[number]) => number
    lowest: (d: InitialData[number]) => number
    open: (d: InitialData[number]) => number
    close: (d: InitialData[number]) => number
    volume: (d: InitialData[number]) => number
    axisYFormat: (d: d3.NumberValue) => string
    axisYMouseTrackingFormat: (d: d3.NumberValue) => string
    axisYVolumeFormat: (d: d3.NumberValue) => string
    axisYMouseTrackingVolumeFormat: (d: d3.NumberValue) => string
    axisXFormat: (d: d3.NumberValue) => string
    axisXMouseTrackingFormat: (d: d3.NumberValue) => string
}

export interface СandlestickСhartRef {
    setLoading: (value: boolean) => void
    create: <InitialData extends IData>(
        data: InitialData,
        methods: InitMethods<InitialData>
    ) => {
        draw: () => void
        handleContainerWidthChange: () => void
        calculateMaxAxisYWidth: () => void
        drawMouseTracking: () => void
        drawCandles: () => void
        drawAxisX: () => void
        drawAxisY: () => void
        drawLineBetweenCharts: () => void
        drawSignal: <Signal extends SignalData>(data: Signal, methods: DrawSignalMethods<Signal>) => void
    }
}

export interface SignalParams {
    selection: d3.Selection<SVGSVGElement, unknown, null, undefined>
    id: string
    x: number
    y: number
    type: 'buy' | 'sell'
    pointerenter: (evt: PointerEvent) => void
    pointerleave: (evt: PointerEvent) => void
}

export interface SignalRef {
    signal: (params: SignalParams) => void
    positionRelativeToSignal: (params: {
        selection: d3.Selection<SVGSVGElement, unknown, null, undefined>
        evt: PointerEvent
        x: number
        y: number
        placement: 'right-start'
    }) => { top: string; left: string }
}

export interface TooltipRef {
    setStyle: (newState: React.CSSProperties) => this
    setTemplate: (reactNode: React.ReactNode) => this
    setClassName: (setClassName: string) => this
}
