import { Ref, forwardRef, memo, useImperativeHandle, useRef, useState } from 'react'
import * as d3 from 'd3'
import { calculatePercentage, generateNumberRange } from './utils'
import { SignalRef, TooltipRef, СandlestickСhartProps as CandlestickСhartProps, СandlestickСhartRef } from './types/types'
import Tooltip from './components/Tooltip'
import Signal from './components/Signal'
import ReactLoading from 'react-loading';

const CandlestickСhart = (props: CandlestickСhartProps, ref: Ref<СandlestickСhartRef>) => {
    const {
        marginBottom = 20,
        marginTop = 20,
        marginLeft = 50,
        marginRight = 50,
        axisYSpaceBetween = 30,
        candlesSpaceBetween = 15,
        сandlesChartPercentageHeight = 70,
        volumeChartPercentageHeight = 30,
        candleBodyWidth = 50,
        viewHeight = 600,
        viewWidth = 'auto'
    } = props

    const [width, setWidth] = useState<string | number>(0)
    const [axisYWidth, setAxisYWidth] = useState(0)
    const [isLoading, setLoading] = useState(false)

    const chartRef = useRef<SVGSVGElement>(null)
    const axisYRef = useRef<SVGSVGElement>(null)
    const tooltipRef = useRef<TooltipRef>(null)
    const signalRef = useRef<SignalRef>(null)
    const overflowElementRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(
        ref,
        () => {
            const chart = d3.select(chartRef.current!)
            const axisY = d3.select(axisYRef.current!)

            return {
                setLoading: setLoading,
                create: (data, methods) => {
                    chart.selectAll('*').remove()
                    axisY.selectAll('*').remove()

                    const widthD3 = data.length * (candleBodyWidth + candlesSpaceBetween)
                    const halfCandleWidth = candleBodyWidth / 2
                    const widthSVG = widthD3 + marginRight + halfCandleWidth

                    const yMin = d3.min(data, methods.lowest) as number
                    const yMax = d3.max(data, methods.highest) as number
                    const xMin = d3.min(data, methods.x) as number
                    const xMax = d3.max(data, methods.x) as number

                    const volumeMin = d3.min(data, methods.volume) as number
                    const volumeMax = d3.max(data, methods.volume) as number

                    const сandlesChartPX = calculatePercentage(viewHeight, сandlesChartPercentageHeight)
                    const volumeChartPX = calculatePercentage(viewHeight, volumeChartPercentageHeight)

                    const x = d3.scaleLinear([xMin, xMax], [halfCandleWidth + marginLeft, widthD3])
                    const y = d3.scaleLinear([yMin, yMax], [сandlesChartPX, marginTop])

                    const yVolume = d3.scaleLinear(
                        [0, volumeMax],
                        [сandlesChartPX + volumeChartPX - marginBottom, сandlesChartPX + axisYSpaceBetween]
                    )

                    const сandlesChartNumberRange = generateNumberRange(yMin, yMax, 10)

                    const volumeChartNumberRange = generateNumberRange(
                        volumeMin,
                        volumeMax,
                        data.length > 4 ? 4 : data.length - 1
                    )

                    setLoading(false)

                    return {
                        handleContainerWidthChange() {
                            const resizeObserver = new ResizeObserver((entries) => {
                                const { contentRect } = entries[0]

                                if (contentRect.width > widthSVG) {
                                    setWidth('100%')
                                } else {
                                    setWidth(widthSVG)
                                }
                            })

                            resizeObserver.observe(overflowElementRef.current!)
                        },
                        calculateMaxAxisYWidth() {
                            const textNodes = axisY.selectAll('.axisY text').nodes()

                            const max = d3.max(textNodes, (node) => {
                                const n = node as SVGTextElement
                                return n.scrollWidth + +n.getAttribute('x')!
                            })

                            setAxisYWidth(max!)
                        },
                        drawMouseTracking() {
                            const REACT_WIDTH = 100
                            const REACT_HEIGHT = 20
                            const TEXT_Y_Y = 6
                            const TEXT_Y_X = 4
                            const TEXT_X_Y = 4
                            const TEXT_X_X = 12

                            const coordinatesX = d3.map(data, (d, i) => {
                                const xDataValue = methods.x(d)
                                const coordX = x(xDataValue)
                                const nextX = data.at(i + 1) ? x(methods.x(data[i + 1])) : widthSVG;
                                const minX = data.at(i - 1) ? marginLeft : 0
                                const maxX = data.at(i + 1) ? 0 : widthD3

                                return {
                                        min: (coordX - (nextX - coordX ) / 2) - minX,
                                        value: coordX,
                                        max: (coordX + (nextX - coordX) / 2) + maxX
                                }
                            })

                            const lineX = chart.append('line')
                                            .attr('x1', 0)
                                            .attr('x2', 0)
                                            .attr('y1', 0)
                                            .attr('y2', `calc(100% - ${marginBottom}px)`)
                                            .attr('stroke', 'black')
                                            .attr('stroke-width', 1.5)
                                            .attr('stroke-dasharray', '4')
                                            .style("display", "none")

                            const lineY = chart.append('line')
                                            .attr('x1', 0)
                                            .attr('x2', '100%')
                                            .attr('y1', 0)
                                            .attr('y2', 0)
                                            .attr('stroke', 'black')
                                            .attr('stroke-width', 1.5)
                                            .attr('stroke-dasharray', '4')
                                            .style("display", "none")

                            const gInfoY = axisY.append('g')
                                                .style("display", "none")
                                                .call((g) => {
                                                    g.append('rect')
                                                     .attr('x', 0)
                                                     .attr('y', -(REACT_HEIGHT / 2))
                                                     .attr('height', REACT_HEIGHT)
                                                     .attr('width', '100%')
                                                     .attr('fill', '#e5e7eb')
                                                     .attr('rx', '5')
                                                })

                            const gInfoX = chart.append('g')
                                                .style("display", "none")
                                                .call((g) => {
                                                    g.append('rect')
                                                     .attr('x', -(REACT_WIDTH / 2))
                                                     .attr('y', 0)
                                                     .attr('height', REACT_HEIGHT)
                                                     .attr('width', REACT_WIDTH)
                                                     .attr('fill', '#e5e7eb')
                                                     .attr('rx', '5')
                                                })

                            const textY = gInfoY.append('text').attr('x', TEXT_Y_X).attr('y', (REACT_HEIGHT / 2) - TEXT_Y_Y).attr('fill', '#0f172a')
                            const textX = gInfoX.append('text').attr('x', (-(REACT_WIDTH / 2) + TEXT_X_X)).attr('y', (REACT_HEIGHT / 2) + TEXT_X_Y).attr('fill', '#0f172a')

                            const pointermove = (event: PointerEvent) => {
                                const coordinateX = coordinatesX.find((d) => {
                                    const mx = d3.pointer(event)[0]
                                    return mx > d.min && mx < d.max
                                })

                                if (!coordinateX) {
                                    lineX.style("display", "none");
                                    gInfoX.style("display", "none")
                                } else {
                                    lineX.attr('x1', coordinateX.value).attr('x2', coordinateX.value).style("display", "block");
                                    gInfoX.style("display", "block").attr('transform', `translate(${coordinateX.value}, ${viewHeight - marginBottom})`)

                                    textX.text(methods.axisXMouseTrackingFormat(x.invert(coordinateX.value)))
                                }

                                if (d3.pointer(event)[1] > viewHeight - marginBottom) {
                                    lineY.style("display", "none");
                                    lineX.style("display", "none");
                                    gInfoY.style("display", "none");
                                    gInfoX.style("display", "none");
                                } else {
                                    lineY.attr('y1', d3.pointer(event)[1]).attr('y2', d3.pointer(event)[1]).style("display", "block");
                                    gInfoY.style("display", "block").attr('transform', `translate(0, ${d3.pointer(event)[1]})`)
                                }

                                if (d3.pointer(event)[1] < сandlesChartPX + (axisYSpaceBetween / 2)) {
                                    textY.text(methods.axisYMouseTrackingFormat(y.invert(d3.pointer(event)[1])));
                                }
                                if (d3.pointer(event)[1] > сandlesChartPX + (axisYSpaceBetween / 2) ) {
                                    textY.text(methods.axisYMouseTrackingVolumeFormat(yVolume.invert(d3.pointer(event)[1])));
                                }

                            }

                            const pointerleave = () => {
                                lineX.style("display", "none");
                                lineY.style("display", "none");
                                gInfoX.style("display", "none");
                                gInfoY.style("display", "none");
                            }

                            chart.on('pointermove', pointermove);
                            chart.on('pointerleave', pointerleave);
                        },
                        draw() {
                            this.handleContainerWidthChange()
                            this.drawAxisY()
                            this.drawGrid()
                            this.drawAxisX()
                            this.drawCandles()
                            this.drawLineBetweenCharts()
                            this.drawMouseTracking()
                        },
                        drawGrid: () => {
                            chart
                                .selectAll('.horizontal-line-top')
                                .data(сandlesChartNumberRange)
                                .enter()
                                .append('line')
                                .attr('class', 'top-line')
                                .attr('stroke', 'gray')
                                .attr('stroke-width', 0.5)
                                .attr('opacity', 0.4)
                                .attr('x1', 0)
                                .attr('y1', (d) => y(d))
                                .attr('x2', '100%')
                                .attr('y2', (d) => y(d))

                            chart
                                .selectAll('.horizontal-line-bottom')
                                .data(volumeChartNumberRange)
                                .enter()
                                .append('line')
                                .attr('class', 'bottom-line')
                                .attr('stroke', 'gray')
                                .attr('stroke-width', 0.5)
                                .attr('opacity', 0.4)
                                .attr('x1', 0)
                                .attr('y1', (d) => yVolume(d))
                                .attr('x2', '100%')
                                .attr('y2', (d) => yVolume(d))

                            chart
                                .selectAll('.vertical-line')
                                .data(data)
                                .enter()
                                .append('line')
                                .attr('stroke', 'gray')
                                .attr('stroke-width', 0.5)
                                .attr('opacity', 0.4)
                                .attr('x1', (d) => x(methods.x(d)))
                                .attr('y1', 0)
                                .attr('x2', (d) => x(methods.x(d)))
                                .attr('y2', viewHeight - marginBottom)
                        },
                        drawLineBetweenCharts: () => {
                            chart
                                .append('line')
                                .attr('opacity', '0.7')
                                .attr('x1', 0)
                                .attr('x2', '100%')
                                .attr('y1', yVolume(volumeMax) - axisYSpaceBetween / 2)
                                .attr('y2', yVolume(volumeMax) - axisYSpaceBetween / 2)
                                .attr('stroke', 'gray')
                                .attr('stroke-width', 2)
                        },
                        drawCandles: () => {
                            data.forEach((candle) => {
                                const valueX = methods.x(candle)
                                const valueOpen = methods.open(candle)
                                const valueClose = methods.close(candle)
                                const valueHighest = methods.highest(candle)
                                const valueLowest = methods.lowest(candle)
                                const valueVolume = methods.volume(candle)

                                const colorCandle = valueClose > valueOpen ? 'green' : 'red'
                                const valueY = valueClose > valueOpen ? valueClose : valueOpen

                                const coordCandleX = x(valueX)
                                const coordCandleY = y(valueY)
                                const coordHighest = y(valueHighest)
                                const coordLowest = y(valueLowest)
                                const coordOpen = y(valueOpen)
                                const coordClose = y(valueClose)
                                const coordVolumeValue = yVolume(valueVolume)
                                const coordVolumeZero = yVolume(0)

                                chart
                                    .append('g')
                                    .attr('transform', `translate(${coordCandleX},${coordHighest})`)
                                    .attr('fill', colorCandle)
                                    .attr('stroke', colorCandle)
                                    .call((g) =>
                                        g
                                            .append('line')
                                            .attr('stroke-width', 1.5)
                                            .attr('x1', 0)
                                            .attr('y1', 0)
                                            .attr('x2', 0)
                                            .attr('y2', Math.abs(coordLowest - coordHighest))
                                    )
                                    .call((g) =>
                                        g
                                            .append('rect')
                                            .attr('x', -(candleBodyWidth / 2))
                                            .attr('y', Math.abs(coordCandleY - coordHighest))
                                            .attr('width', candleBodyWidth)
                                            .attr('height', Math.abs(coordOpen - coordClose))
                                    )

                                chart
                                    .append('rect')
                                    .attr('fill', colorCandle)
                                    .attr('stroke', colorCandle)
                                    .attr('opacity', '0.5')
                                    .attr('x', coordCandleX - candleBodyWidth / 2)
                                    .attr('y', coordVolumeValue)
                                    .attr('width', candleBodyWidth)
                                    .attr('height', coordVolumeZero - coordVolumeValue)
                            })
                        },
                        drawAxisY() {
                            axisY
                                .append('g')
                                .attr('class', `axisY`)
                                .call(
                                    d3
                                        .axisRight(y)
                                        .tickValues(сandlesChartNumberRange)
                                        .tickFormat(methods.axisYFormat)
                                )
                                .call((g) => {
                                    g.select('.domain').remove()
                                })

                            axisY
                                .append('g')
                                .attr('class', `axisY`)
                                .call(
                                    d3
                                        .axisRight(yVolume)
                                        .tickValues(volumeChartNumberRange)
                                        .tickFormat(methods.axisYVolumeFormat)
                                )
                                .call((g) => g.select('.domain').remove())

                            this.calculateMaxAxisYWidth()
                        },
                        drawAxisX: () => {
                            chart
                                .append('g')
                                .attr('transform', `translate(0, ${viewHeight - marginBottom})`)
                                .call(
                                    d3
                                        .axisBottom(x)
                                        .tickValues(data.map(methods.x))
                                        .tickFormat(methods.axisXFormat)
                                )
                        },
                        drawSignal: (data, methods) => {
                            data.forEach((signal) => {
                                const type = signal.type
                                const signalX = methods.x(signal)
                                const signalY = methods.y(signal)
                                const jsxTempate = methods.jsxTemplate(signal)

                                signalRef.current?.signal({
                                    type: type,
                                    selection: chart,
                                    id: `${signalX}`,
                                    x: x(signalX),
                                    y: y(signalY),
                                    pointerenter: (evt) => {
                                        const position = signalRef.current?.positionRelativeToSignal({
                                            selection: chart,
                                            evt,
                                            x: x(signalX) + 10,
                                            y: y(signalY),
                                            placement: 'right-start'
                                        })

                                        tooltipRef.current
                                            ?.setStyle(position!)
                                            .setClassName('bg-gray-100 p-[1.6rem] visible rounded-md')
                                            .setTemplate(jsxTempate)
                                    },
                                    pointerleave: () => {
                                        tooltipRef.current?.setClassName('invisible')
                                    }
                                })
                            })
                        }
                    }
                }
            }
        },
        []
    )

    return (
        <div
            style={{
                position: 'relative',
                width: `calc(${viewWidth})`
            }}
        >
            {
                isLoading && (
                    <div className="absolute inset-0 bg-gray-50 flex items-center justify-center" style={{ right: -axisYWidth }}>
                        <ReactLoading type="cylon" color={'black'} width={'20%'} height={'20%'} />
                    </div>
                )
            }

            <svg
                ref={axisYRef}
                height={viewHeight}
                style={{
                    position: 'absolute',
                    zIndex: 1,
                    right: -axisYWidth,
                    width: axisYWidth
                }}
            />
            <Tooltip ref={tooltipRef} />
            <Signal ref={signalRef} />
            <div ref={overflowElementRef} className="overflow-x-auto">
                <svg ref={chartRef} width={width} height={viewHeight} />
            </div>
        </div>
    )
}

export default memo(forwardRef(CandlestickСhart))
