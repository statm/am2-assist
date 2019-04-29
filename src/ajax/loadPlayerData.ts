import { loadNetworkData } from './loadNetworkData';
import { loadPriceData } from './loadPriceData';
import { copyWithProperties } from '../utils';
import { NetworkData, AircraftData, RouteData, PriceData, PlanData } from '../typings';

export async function loadPlayerData() {
    const networkData: NetworkData = await loadNetworkData();
    const priceData: { [routeId: number]: PriceData } = await loadPriceData();

    const planningList: Array<PlanData> = [];

    const aircraftList = networkData.aircraftList.map(function (aircraft: AircraftData) {
        $.merge(
            planningList,
            aircraft.planningList
        );
        return copyWithProperties(aircraft, [
            'id',
            'name',
            'aircraftListName',
            'category',
            'range',
            'speed',
            'isRental',
            'isCargo',
            'seatsEco',
            'seatsBus',
            'seatsFirst',
            'payloadUsed'
        ]);
    });

    const routeList = networkData.routeList.map(function (route: RouteData) {
        const result = copyWithProperties(route, [
            'id',
            'name',
            'distance',
            'category',
            'paxAttEco',
            'paxAttBus',
            'paxAttFirst',
            'paxAttCargo'
        ]);
        result.price = priceData[route.id];
        return result;
    });

    return {
        aircraftList,
        routeList,
        planningList,
        flightParameters: networkData.flightParameters
    };
}
