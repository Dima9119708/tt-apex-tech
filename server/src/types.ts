export interface CandlesDataServer {
    result: [number, string, string, string, string, string, string][] | null,
    error: { code: 1, message: 'invalid argument'} | null
}

export interface CandlesData {
    result: {
        time: number,
        open: string,
        close: string,
        highest: string,
        lowest: string,
        volume: string
    }[],
    signals: {
        time: number,
        price: number,
        volume: number
    }[],
    error: CandlesDataServer['error']
}
