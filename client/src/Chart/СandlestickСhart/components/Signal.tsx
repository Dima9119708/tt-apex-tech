import * as d3 from 'd3'
import { Ref, forwardRef, memo, useImperativeHandle } from 'react'
import { SignalRef } from '../types/types'

const Signal = (props, ref: Ref<SignalRef>) => {
    useImperativeHandle(
        ref,
        () => {
            const pathArrowUp = 'M7 7h8.586L5.293 17.293l1.414 1.414L17 8.414V17h2V5H7v2z'
            const pathArrowDown = 'M17 15.586 6.707 5.293 5.293 6.707 15.586 17H7v2h12V7h-2v8.586z'

            const PRESSING_AREA_HEIGHT = 30
            const PRESSING_AREA_WIDTH = 30

            const MARKER_WIDTH = 15
            const MARKER_HEIGHT = 15

            return {
                signal({ selection, id, x, y, pointerenter, pointerleave, type }) {
                    selection
                        .append('defs')
                        .append('marker')
                        .attr('id', id)
                        .attr('viewBox', '0 0 20 20')
                        .attr('refX', 10)
                        .attr('refY', 10)
                        .attr('markerWidth', MARKER_WIDTH)
                        .attr('markerHeight', MARKER_HEIGHT)
                        .attr('orient', 'auto')
                        .append('path')
                        .attr('d', type === 'buy' ? pathArrowUp : pathArrowDown)
                        .attr('fill', type === 'buy' ? '#22c55e' : '#ef4444')

                    selection
                        .append('g')
                        .attr('transform', `translate(${x}, ${y})`)
                        .call((d) => {
                            d.append('rect')
                                .attr('x', -(PRESSING_AREA_WIDTH / 2))
                                .attr('y', -(PRESSING_AREA_HEIGHT / 2))
                                .attr('width', PRESSING_AREA_WIDTH)
                                .attr('height', PRESSING_AREA_HEIGHT)
                                .attr('fill', 'transparent')
                                .on('pointerenter', pointerenter)
                                .on('pointerleave', pointerleave)
                        })
                        .call((d) => {
                            d.append('line')
                                .attr('x1', 0)
                                .attr('y1', 0)
                                .attr('x2', 0)
                                .attr('y2', 0)
                                .attr('stroke-width', 2)
                                .attr('marker-start', `url(#${id})`)
                        })
                },
                positionRelativeToSignal({ selection, evt, x, y, placement }) {
                    const [mx] = d3.pointer(evt, selection.node())

                    if (placement === 'right-start') {
                        const left = x - PRESSING_AREA_WIDTH / 2 - mx + PRESSING_AREA_WIDTH

                        return {
                            top: `${y}px`,
                            left: `${evt.layerX + left}px`
                        }
                    }

                    throw new Error('invalid placement')
                }
            }
        },
        []
    )

    return null
}

export default memo(forwardRef(Signal))
