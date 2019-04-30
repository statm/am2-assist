import { Plugin } from '../plugin';
import { PAGE_URL, DAYS_SHORT } from '../constants';
import { loadNetworkData } from '../ajax/loadNetworkData';
import { getIntFromElement, getFlightDuration, getIntFromString } from '../utils';

// TODO: wrong layout with cargo aircrafts
// TODO: reload button on loadNetworkData failure (5 sec)

export const reconfigurationAssist: Plugin = {
    name: 'RECONFIGURATION ASSIST',
    urlPatterns: ['aircraft/show/[0-9]+/reconfigure', 'aircraft/buy/new/[0-9]+/[^/]+/.*'],
    action: async function () {
        $(`
            <style type='text/css'>
                #reconfigBox { float: right; width: 225px; height: 400px; overflow-y: auto; border: 1px solid #aaa; border-radius: 4px; margin-right: 2px; background-color: #fff }
                #reconfigBox::-webkit-scrollbar { width: 10px }
                #reconfigBox::-webkit-scrollbar-track { background-color: #f1f1f1; border-top-right-radius: 4px; border-bottom-right-radius: 4px }
                #reconfigBox::-webkit-scrollbar-thumb { background-color: #c1c1c1 }
                .route-title { width: 100%; height: 23px; display: flex; align-items: center; background-color: #bde9ff; color: #585d69 }
                .route-name { font-weight: bold; padding-left: 5px }
                .route-dist { flex: 1; text-align: right; font-weight: bold; padding-right: 5px }
                .pax-line { display: flex; align-items: center; padding: 4px 5px }
                .pax-line span { display: inline-block; text-align: right }
                .day-box { width: 58px; margin-right: 4px; color: #585d69 }
                .pax-box { width: 36px; font-weight: bold }
                .num-pos { color: #8ecb47 }
                .num-neg { color: #da4e28 }
            </style>
        `).appendTo('head');

        const reconfigBox =$(`
            <div id="reconfigBox">
                <div style="line-height:290px;text-align:center">
                    <img src="//goo.gl/aFrC17" width="20">
                    <span style="vertical-align:middle;margin-left:3px;color:#585d69">Loading...</span>
                </div>
            </div>
        `);
        const ownAircraftMatch = PAGE_URL.match(/aircraft\/show\/([0-9]+)\/reconfigure/);
        if (!ownAircraftMatch) {
            reconfigBox.css({ height: '300px', 'margin-top': '70px' });
        }
        $('#box2').after(reconfigBox);

        const networkData = await loadNetworkData();

        const displayRelevantRoutes = function () {
            let currentAircraftSpeed: number;
            let currentAircraftRange: number;
            let currentAircraftCategory: number;
            let currentAircraftLocation: string;

            if (ownAircraftMatch) {
                const currentAircraftId = getIntFromString(ownAircraftMatch[1]);
                currentAircraftSpeed = networkData.aircraftMap[currentAircraftId].speed;
                currentAircraftRange = networkData.aircraftMap[currentAircraftId].range;
                currentAircraftCategory = networkData.aircraftMap[currentAircraftId].category;
                currentAircraftLocation = $('.aircraftMainInfo span:eq(2)').text().replace(' /', '');
            } else {
                const aircraftPurchaseBox = $('.aircraftPurchaseBox');
                currentAircraftSpeed = getIntFromElement(aircraftPurchaseBox.find("li:contains('Speed') b"));
                currentAircraftRange = getIntFromElement(aircraftPurchaseBox.find("li:contains('Range') b"));
                currentAircraftCategory = getIntFromString(aircraftPurchaseBox.find('.title img').attr('alt')!.replace('cat', ''));
                currentAircraftLocation = $('#aircraft_hub option:selected').text().split(' - ')[0];
            }

            const possibleRoutes = networkData.routeList
                .filter(route => route.distance <= currentAircraftRange && route.category >= currentAircraftCategory && route.name.startsWith(currentAircraftLocation))
                .sort((r1, r2) => r2.distance - r1.distance);

            reconfigBox.empty();
            if (possibleRoutes.length === 0) {
                reconfigBox.html(`<div style="line-height:290px;text-align:center"><span style="vertical-align:middle;margin-left:3px;color:#585d69">No routes available</span></div>`);
            }
            possibleRoutes.forEach(route => {
                const flightTime = getFlightDuration(route.distance, currentAircraftSpeed, networkData.flightParameters);
                const flightTimeH = Math.floor(flightTime / 60);
                const flightTimeM = flightTime % 60;

                const titleBox = $(`
                    <div class="route-title">
                        <span class="route-name">${route.name}</span>
                        <span class="route-dist">${route.distance}km (${flightTimeH}h${flightTimeM})</span>
                    </div>
                `);
                reconfigBox.append(titleBox);

                const paxGroup = [];
                for (let i = 0; i < route.remaining.length; ++i) {
                    const currentPax = route.remaining[i];
                    if (paxGroup.length === 0) {
                        paxGroup.push({ days: [i], pax: currentPax });
                        continue;
                    }

                    const lastPax = paxGroup[paxGroup.length - 1];
                    if (
                        currentPax.eco === lastPax.pax.eco &&
                        currentPax.bus === lastPax.pax.bus &&
                        currentPax.first === lastPax.pax.first &&
                        currentPax.cargo === lastPax.pax.cargo
                    ) {
                        lastPax.days.push(i);
                    } else {
                        paxGroup.push({ days: [i], pax: currentPax });
                    }
                }

                const getPaxTextClass = (pax: number) => (pax >= 0 ? 'num-pos' : 'num-neg');

                paxGroup.forEach(paxSeg => {
                    const dayText =
                        paxSeg.days.length === 1
                            ? `${DAYS_SHORT[paxSeg.days[0]]}`
                            : `${DAYS_SHORT[paxSeg.days[0]]}-${DAYS_SHORT[paxSeg.days[paxSeg.days.length - 1]]}`;
                    const paxData = paxSeg.pax;
                    const paxBox = $(`
                        <div class="pax-line">
                            <span class="day-box">${dayText}</span>
                            <span class="pax-box ${getPaxTextClass(paxData.eco)}">${paxData.eco}</span>
                            <span class="pax-box ${getPaxTextClass(paxData.bus)}">${paxData.bus}</span>
                            <span class="pax-box ${getPaxTextClass(paxData.first)}">${paxData.first}</span>
                            <span class="pax-box ${getPaxTextClass(paxData.cargo)}'>${paxData.cargo}T</span>
                        </div>
                    `);
                    reconfigBox.append(paxBox);
                });
            });
            reconfigBox.scrollTop(0);
        };

        displayRelevantRoutes();
        $('#aircraft_hub').change(displayRelevantRoutes);
    }
};
