import { AircraftInfo } from '../typings';

export async function loadAircraftInfo() {
    const aircraftInfo: Array<AircraftInfo> = [];

    for (const pageId of ["short", "middle", "long"]) {
        const page = $($.parseHTML(await $.get(`/aircraft/buy/new/0/${pageId}`)));
        page.find(".aircraftPurchaseBox").each(function () {
            const aircraft = JSON.parse($(this).find(".hidden.aircraftJson").text());
            aircraft.name = $(this).find("img.mini-aircraft").prop("alt");
            aircraft.price = $(this).data("price");
            aircraft.seats = $(this).data("seats");
            aircraft.payload = $(this).data("payload");
            aircraftInfo.push(aircraft);
        })
    }

    return aircraftInfo.sort((a, b) => a.id - b.id);
}
