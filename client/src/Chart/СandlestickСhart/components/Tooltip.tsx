import { Ref, forwardRef, memo, useImperativeHandle, useRef, useState } from 'react'
import { TooltipRef } from '../types/types'

const Tooltip = (props, ref: Ref<TooltipRef>) => {
    const tooltipRef = useRef(null)

    const [style, setStyle] = useState<React.CSSProperties>({
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1
    })

    const [template, setTemplate] = useState<React.ReactNode>(null)
    const [className, setClassName] = useState<string>('')

    useImperativeHandle(
        ref,
        () => {
            return {
                setStyle(newStyle) {
                    setStyle((prevState) => {
                        return { ...prevState, ...newStyle }
                    })
                    return this
                },
                setClassName(className) {
                    setClassName(className)
                    return this
                },
                setTemplate(reactNode) {
                    setTemplate(reactNode)
                    return this
                }
            }
        },
        []
    )

    return (
        <div ref={tooltipRef} className={className} style={style}>
            {template}
        </div>
    )
}

export default memo(forwardRef(Tooltip))
