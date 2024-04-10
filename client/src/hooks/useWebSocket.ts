import { useEffect, useRef, useState } from "react"
import { Socket, io } from "socket.io-client"

export const useWebSocket = (props: { onConnecting: () => void }) => {
    const socketRef = useRef<Socket>()
    const [isConnected, setConnected] = useState(false)

    useEffect(() => {
        props.onConnecting()

        const socket = io('http://localhost:8001')

        socketRef.current = socket

        socket.on('connect-exchange', () => {
            setConnected(true)
        })
    }, [])

    return {
        isConnected,
        socket: socketRef.current!
    }
}
