import { useCallback, useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import СandlestickСhart from './Chart/СandlestickСhart/СandlestickСhart'
import Markets, { MarketsProps } from './components/Markets/Markets'
import TimeFrame, { TimeFrameProps } from './components/TimeFrame/TimeFrame'
import { defaultTimeFrame } from './components/TimeFrame/timeFramesData'
import { SignalParams, СandlestickСhartRef } from './Chart/СandlestickСhart/types/types'
import { ToastContainer, toast } from 'react-toastify';
import { useWebSocket } from './hooks/useWebSocket'
import numbro from 'numbro'

interface CandlesData {
    result: {
        time: number
        open: string
        close: string
        highest: string
        lowest: string
        volume: string
    }[]
    signals: {
        type: SignalParams['type']
        time: number
        price: number
        volume: number
    }[]
    error: { code: 1, message: 'invalid argument'}
}

function App() {
    const [market, setMarket] = useState<MarketsProps['value']>(null)
    const [timeFrame, setTimeFrame] = useState<TimeFrameProps['value']>(defaultTimeFrame)
    const chartRef = useRef<СandlestickСhartRef>(null)

    const { isConnected, socket } = useWebSocket({
        onConnecting: () => chartRef.current!.setLoading(true),
    })

    const axisYFormat = useCallback((num: d3.NumberValue) => {
        return num.toLocaleString('fullwide', { useGrouping: false, maximumSignificantDigits: 4 }).replace(',', '.')
    }, [])

    const axisYVolume = useCallback((num: d3.NumberValue) => {
        return numbro(num).format({ average: true,  mantissa: 2 })
    }, [])

    const unixToTimestamp = useCallback((time: d3.NumberValue) => {
        return d3.timeParse('%s')(`${time}`)!.valueOf()
    }, [])

    useEffect(() => {
        if (!market) return
        if (!isConnected) return

        socket.emit('candles-request', {
            market: market.name,
            startTime: timeFrame.startTime,
            endTime: timeFrame.endTime,
            interval: timeFrame.interval
        })
    }, [market, timeFrame, isConnected])

    useEffect(() => {
        if (!isConnected) return

        socket.on('candles-data', (data: CandlesData) => {
            if (data.error) {
                toast.error(data.error.message);
                return
            }

            const chart = chartRef.current!.create(data.result, {
                x: (d) => unixToTimestamp(d.time),
                highest: (d) => +d.highest,
                lowest: (d) => +d.lowest,
                open: (d) => +d.open,
                close: (d) => +d.close,
                volume: (d) => +d.volume,

                axisXFormat: (d) => d3.timeFormat('%y-%m-%d')(new Date(d as number)),
                axisYFormat: axisYFormat,

                axisYMouseTrackingFormat: axisYFormat,
                axisXMouseTrackingFormat: (d) => d3.timeFormat('%Y-%m-%d %H:%M')(new Date(d as number)),

                axisYVolumeFormat: axisYVolume,
                axisYMouseTrackingVolumeFormat: axisYVolume,
            })

            chart.draw()

            chart.drawSignal(data.signals, {
                x: (signal) => unixToTimestamp(signal.time),
                y: (signal) => signal.price,
                type: (signal) => signal.type,
                jsxTemplate: (signal) => {
                    const date = d3.timeParse('%s')(`${signal.time}`)

                    return (
                    <div className="text-[1.2rem]">
                        <p>
                            <strong>Час:</strong>
                            {' '}
                            { date ? d3.timeFormat('%Y-%m-%d, %H:%M')(date) : '------' }
                        </p>
                        <p>
                            <strong>Ціна:</strong> { signal.price.toLocaleString('fullwide', { useGrouping: false, maximumSignificantDigits: 4 }).replace(',', '.')}
                        </p>
                        <p>
                            <strong>Обсяг:</strong> {signal.volume.toLocaleString('fullwide', { useGrouping: false, maximumSignificantDigits: 4 }).replace(',', '.')}
                        </p>
                    </div>
                )
                }
            })
        })
    }, [isConnected])

    return (
        <div className="flex gap-4 flex-col justify-center items-center pt-[5rem]">
            <div className="flex flex-col gap-4 w-[70%]">
                <div className="flex w-full gap-12">
                    <Markets value={market} onChange={setMarket} />

                    <TimeFrame value={timeFrame} onChange={setTimeFrame} />
                </div>

                <СandlestickСhart ref={chartRef} viewWidth="100%" />
            </div>

            <ToastContainer />
        </div>
    )
}

export default App
