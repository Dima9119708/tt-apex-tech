import { CandlesData } from "./types";

export function generateRandomSignals(data: CandlesData['result']) {
    const numDataPoints = data.length;

    const numSignals = numDataPoints < 10 ? numDataPoints : 10;

    const signals = [];
    const minTime = Math.min(...data.map(entry => entry.time));
    const maxTime = Math.max(...data.map(entry => entry.time));
    const minPrice = Math.min(...data.map(entry => +entry.lowest));
    const maxPrice = Math.max(...data.map(entry => +entry.highest));
    const minVolume = Math.min(...data.map(entry => +entry.volume));
    const maxVolume = Math.max(...data.map(entry => +entry.volume));

    for (let i = 0; i < numSignals; i++) {
        const randomTime = Math.floor(Math.random() * (maxTime - minTime + 1) + minTime);
        const randomPrice = (Math.random() * (maxPrice - minPrice)) + minPrice;
        const randomVolume = (Math.random() * (maxVolume - minVolume)) + minVolume;
        const type = Math.random() < 0.5 ? 'buy' : 'sell';
  
        signals.push({
            type,
            time: randomTime,
            price: randomPrice,
            volume: randomVolume,
        });
    }
  
    return signals;
}
