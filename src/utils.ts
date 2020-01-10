import { AIRCRAFT_TABLE } from './data/aircraftTable';
import { FlightParameters } from './typings';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function assert(predicate: any) {
  if (!predicate) {
    console.error(`Assert failed`);
    throw new Error();
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function waitUntil(predicate: () => any, interval: number, maxRetries: number) {
  return new Promise(function(resolve, reject) {
    let tries = 0;
    const pollHandle = setInterval(function() {
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

export function getFlightDuration(
  distance: number,
  speed: number,
  flightParameters: FlightParameters,
) {
  const airTime = Math.ceil(((distance * 2) / speed) * 4) * 15;
  const logisticTime =
    (flightParameters.boardingTime * 2 +
      flightParameters.landingTime * 2 +
      flightParameters.transitionTime) /
    60;
  return airTime + logisticTime;
}

export function sleep(msec: number) {
  return new Promise(function(resolve) {
    setTimeout(resolve, msec);
  });
}

export function getIntFromString(str: string) {
  return parseInt(str.replace(/[^0-9]/g, ''), 10);
}

export function getIntFromElement(element: JQuery<JQuery.Node[]> | JQuery<HTMLElement>) {
  return getIntFromString(element.text());
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function copyWithProperties(obj: any, props: string[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {};
  props.forEach(k => {
    result[k] = obj[k];
  });
  return result;
}

export function getAircraftInfo(name: string) {
  for (const aircraft of AIRCRAFT_TABLE) {
    if (aircraft.name === name) {
      return aircraft;
    }
  }
}

export async function isAMPlus() {
  return $($.parseHTML(await $.get('/amplus/'))).find('.nbDayAmPlus').length > 0;
}

export function getPax(eco: number, bus: number, first: number) {
  return Math.ceil(eco + 1.8 * bus + 4.2 * first);
}
