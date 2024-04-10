import dayjs from 'dayjs'

const todayDate = dayjs().unix()

const endDate = dayjs('2022-01-01').unix()

export const timeFrames = [
    {

        unit: 'month',
        interval: 2592000,
        startTime: endDate,
        endTime: todayDate,
        label: '1 місяць'
    },
    {

        unit: 'week',
        startTime: endDate,
        endTime: todayDate,
        interval: 604800,
        label: '1 тиждень'
    },
    {
        unit: 'day',
        startTime: endDate,
        endTime: todayDate,
        interval: 86400,
        label: '1 день'
    }
]

export const defaultTimeFrame = timeFrames.at(-1)!
