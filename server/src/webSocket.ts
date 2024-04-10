import WebSocket from 'ws'
import { Server } from "socket.io";
import { CandlesData, CandlesDataServer } from './types';
import { generateRandomSignals } from './helper';

const io = new Server(8001, {
    cors: {
        origin: '*'
    }
});

io.on("connection", (socket) => {
    const socketExchange = new WebSocket('wss://api.whitebit.com/ws')

    socket.on('candles-request', (data) => {
        socketExchange.send(JSON.stringify({
            "id": 2,
            "method": "candles_request",
            "params": [
              data.market,
              data.startTime,
              data.endTime,
              data.interval
            ]
          }))
    })

    socketExchange.onopen = () => {
        socket.emit('connect-exchange', true)
    }

    socketExchange.onmessage = (event) => {
        const data: CandlesDataServer = JSON.parse(event.data as string)

        const prepareData = (data.result ?? []).map((d) => {
            return {
                time: d[0],
                open: d[1],
                close: d[2],
                highest: d[3],
                lowest: d[4],
                volume: d[6]
            }
        })

        const candlesData: CandlesData = {
            result: prepareData,
            signals: generateRandomSignals(prepareData),
            error: data.error
        }
        
        socket.emit('candles-data', candlesData)
    }

    socketExchange.onerror = () => {
        socket.emit('error-connect-exchange')
    }

    socketExchange.onclose = () => {
        socket.emit('disconnect-exchange')
    }
});