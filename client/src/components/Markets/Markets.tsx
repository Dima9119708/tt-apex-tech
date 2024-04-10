import axios from 'axios'
import { useEffect, useState } from 'react'
import Select from 'react-select'
import {toast} from "react-toastify";

export interface MarketData {
    name: string
    stock: string
    money: string
}

export interface MarketsProps {
    value: MarketData | null
    onChange: (value: MarketData) => void
}

const Markets = (props: MarketsProps) => {
    const { value, onChange } = props

    const [data, setData] = useState<MarketData[]>([])
    const [isLoading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
        ;(async () => {
            try {
                const response = await axios.get<MarketData[]>('http://localhost:8002/markets')

                setData(response.data)
                onChange(response.data.at(0)!)
                setLoading(false)
            } catch (e) {
                toast('Не вдалося завантажити дані валют', { type: 'error' })
                setLoading(false)
            }
        })()
    }, [])

    return (
        <Select
            className="w-[20rem] text-[1.6rem]"
            options={data}
            isLoading={isLoading}
            value={value}
            onChange={(newValue) => {
                if (newValue) {
                    onChange(newValue)
                }
            }}
            getOptionValue={(option) => option.name}
            getOptionLabel={(option) => `${option.stock}/${option.money}`}
        />
    )
}

export default Markets
