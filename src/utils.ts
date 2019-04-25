import { AIRCRAFT_TABLE } from './data/aircraftTable';
import { FlightParameters } from './typings';

export function assert(predicate: any) {
    if (!predicate) {
        console.error(`Assert failed`);
        throw new Error();
    }
}

export function waitUntil(predicate: () => any, interval: number, maxRetries: number) {
    return new Promise(function (resolve, reject) {
        let tries = 0;
        const pollHandle = setInterval(function () {
            if (++tries > maxRetries) {
                clearInterval(pollHandle);
                reject();
                return;
            }

            if (predicate()) {
                clearInterval(pollHandle);
                resolve();
            }
        }, interval);
    });
}

export function getFlightDuration(distance: number, speed: number, flightParameters: FlightParameters) {
    const airTime = Math.ceil(distance * 2 / speed * 4) * 15;
    const logisticTime = (flightParameters.boardingTime * 2 + flightParameters.landingTime * 2 + flightParameters.transitionTime) / 60;
    return airTime + logisticTime;
}

export function sleep(msec: number) {
    return new Promise(function (resolve) {
        setTimeout(resolve, msec);
    });
}

export function getIntFromString(str: string) {
    return parseInt(str.replace(/[^0-9]/g, ''), 10);
}

export function getIntFromElement(element: JQuery<JQuery.Node[]> | JQuery<HTMLElement>) {
    return getIntFromString(element.text());
}

export function copyWithProperties(obj: any, props: string[]) {
    const result: any = {};
    props.forEach(k => {
        result[k] = obj[k];
    });
    return result;
}

export function getAircraftInfo(name: string) {
    for (const aircraft of AIRCRAFT_TABLE) {
        if (aircraft.name == name) {
            return aircraft;
        }
    }
}

export async function isAMPlus() {
    return $($.parseHTML(await $.get('/amplus'))).find('.nbDayAmPlus').length > 0;
}
