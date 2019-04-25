import { Plugin } from '../plugin';
import { loadAircraftInfo } from '../ajax/loadAircraftInfo';
import { AIRCRAFT_TABLE } from '../data/aircraftTable';
import { assert } from '../utils';
import { AircraftInfo } from '../typings';

export const aircraftInfoCollection: Plugin = {
    name: 'AIRCRAFT INFO COLLECTION (CTRL+SHIFT+/)',
    urlPatterns: ['.*'],
    action: function () {
        window.addEventListener('keyup', async function (event) {
            // Ctrl + Shift + /
            if (event.key == '?' && !event.altKey && event.ctrlKey && event.shiftKey) {
                const aircraftInfo = await loadAircraftInfo();

                // Copy
                let output = '';
                for (const aircraft of aircraftInfo) {
                    output += JSON.stringify(aircraft, ['id', 'name', 'category', 'speed', 'range', 'price', 'seats', 'payload']) + ',\n';
                }
                output = `[\n${output}]`;
                // GM_setClipboard(output);
                console.log('Aircraft list copied to clipboard');

                // Verification
                assert(aircraftInfo.length == AIRCRAFT_TABLE.length);
                aircraftInfo.forEach((aircraft: AircraftInfo, index: number) => {
                    const currentAircraft = AIRCRAFT_TABLE[index];

                    assert(aircraft.id == currentAircraft.id);
                    assert(aircraft.name == currentAircraft.name);
                    assert(aircraft.category == currentAircraft.category);
                    assert(aircraft.speed == currentAircraft.speed);
                    assert(aircraft.range == currentAircraft.range);
                    assert(aircraft.price == currentAircraft.price);
                    assert(aircraft.seats == currentAircraft.seats);
                    assert(aircraft.payload == currentAircraft.payload);
                });
            }
        });
    }
};
