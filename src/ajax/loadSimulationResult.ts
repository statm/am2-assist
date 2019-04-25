import { getIntFromString, assert } from '../utils';

export function loadSimulationResult(lineId: number, prices: number[]) {
    const [ECO, BUS, FIRST, CARGO] = [0, 1, 2, 3];
    
    assert(prices.length == 4);
    return $.post(`/marketing/pricing/priceSimulation/${lineId}`, {
        priceEco: prices[0],
        priceBus: prices[1],
        priceFirst: prices[2],
        priceCargo: prices[3]
    }).then(function (result) {
        const data = JSON.parse(result);
        if (data.errorCode != 0) {
            throw new Error(data.notifyMessage);
        }

        data[ECO] = {
            pax: data.paxEcoValue,
            paxLeft: data.paxLeftEcoValue,
            turnover: getIntFromString(data.caEcoValue)
        };
        data[BUS] = {
            pax: data.paxBusValue,
            paxLeft: data.paxLeftBusValue,
            turnover: getIntFromString(data.caBusValue)
        };
        data[FIRST] = {
            pax: data.paxFirstValue,
            paxLeft: data.paxLeftFirstValue,
            turnover: getIntFromString(data.caFirstValue)
        };
        data[CARGO] = {
            pax: data.paxCargoValue,
            paxLeft: data.paxLeftCargoValue,
            turnover: getIntFromString(data.caCargoValue)
        };

        return data;
    });
}