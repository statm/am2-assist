import { waitUntil } from '../utils';
import { NetworkData, AircraftData, RouteData } from '../typings';

export function loadNetworkData(): Promise<NetworkData> {
  return new Promise(function(resolve) {
    const networkIFrame = $("<iframe src='/network/planning' width='0' height='0'/>");
    networkIFrame.on('load', async function() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contentWindow: any = (networkIFrame[0] as HTMLIFrameElement).contentWindow;
      await waitUntil(() => contentWindow.hasAlreadyRegroupedData, 100, 50);

      const aircraftList = contentWindow.aircraftListLoaded as Array<AircraftData>;
      const routeList = contentWindow.lineListLoaded as Array<RouteData>;
      const aircraftMap: { [id: number]: AircraftData } = {};
      const routeMap: { [id: number]: RouteData } = {};

      for (const route of routeList) {
        route.remaining = [];
        for (let i = 0; i < 7; ++i) {
          route.remaining.push({
            eco: route.paxAttEco,
            bus: route.paxAttBus,
            first: route.paxAttFirst,
            cargo: route.paxAttCargo,
          });
        }

        routeMap[route.id] = route;
      }

      for (const aircraft of aircraftList) {
        for (let i = 0; i < aircraft.planningList.length; ++i) {
          const trip = aircraft.planningList[i];
          const remaining = routeMap[trip.lineId].remaining[Math.floor(trip.takeOffTime / 86400)];
          remaining.eco -= aircraft.seatsEco * 2;
          remaining.bus -= aircraft.seatsBus * 2;
          remaining.first -= aircraft.seatsFirst * 2;
          remaining.cargo -= aircraft.payloadUsed * 2;
        }

        aircraftMap[aircraft.id] = aircraft;
      }

      const flightParameters = JSON.parse(
        networkIFrame
          .contents()
          .find('#jsonAirlineFlightParameters')
          .text(),
      );

      resolve({
        aircraftList,
        routeList,
        aircraftMap,
        routeMap,
        flightParameters,
      });
    });
    $('html').append(networkIFrame);
  });
}
