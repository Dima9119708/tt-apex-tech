export function generateNumberRange(minVal: number, maxVal: number, count: number) {
    if (count === 1) {
        return [minVal, maxVal]
    } else if (count === 2) {
        return [minVal, maxVal]
    } else {
        const step = (maxVal - minVal) / (count - 1)
        const result = []
        for (let i = 0; i < count - 1; i++) {
            result.push(minVal + step * i)
        }
        result.push(maxVal)
        return result
    }
}

export function calculatePercentage(value: number, percentage: number) {
    return (value * percentage) / 100
}
