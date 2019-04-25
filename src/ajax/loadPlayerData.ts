import { loadNetworkData } from './loadNetworkData';
import { loadPriceData } from './loadPriceData';
import { copyWithProperties } from '../utils';

export async function loadPlayerData() {
    const networkData: any = await loadNetworkData();
    const priceData: any = await loadPriceData();

    const planningList: any = [];

    const aircraftList = networkData.aircraftList.map(function (aircraft: any) {
        $.merge(
            planningList,
            aircraft.planningList.map((planning: any) => {
                return {
                    takeOffTime: planning.takeOffTime,
                    routeId: planning.lineId,
                    aircraftId: planning.aircraftId
                };
            })
        );
        return copyWithProperties(aircraft, [
            "id",
            "name",
            "aircraftListName",
            "category",
            "range",
            "speed",
            "isRental",
            "isCargo",
            "seatsEco",
            "seatsBus",
            "seatsFirst",
            "payloadUsed"
        ]);
    });

    const routeList = networkData.routeList.map(function (route: any) {
        const result = copyWithProperties(route, [
            "id",
            "name",
            "distance",
            "category",
            "paxAttEco",
            "paxAttBus",
            "paxAttFirst",
            "paxAttCargo"
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
