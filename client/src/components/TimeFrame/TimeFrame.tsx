import { memo } from 'react'
import { timeFrames } from './timeFramesData'

export interface TimeFrameProps {
    value: (typeof timeFrames)[number]
    onChange: (value: (typeof timeFrames)[number]) => void
}

const TimeFrame = (props: TimeFrameProps) => {
    const { value, onChange } = props

    return (
        <div className="flex space-x-4">
            {timeFrames.map((timeFrame) => (
                <button
                    key={timeFrame.label}
                    onClick={() => onChange(timeFrame)}
                    className={`px-4 py-2 rounded-md ${
                        value === timeFrame ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                    }`}
                >
                    {timeFrame.label}
                </button>
            ))}
        </div>
    )
}

export default memo(TimeFrame)
