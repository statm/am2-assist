import { Plugin } from '../plugin';
import { assert, getIntFromElement, getPax } from '../utils';

function calculatePax() {
    $('.airportList .hubListBox .demand:not(:empty)').each(function() {
        const demand = $(this);

        const paxFields = demand.find('p span.bold');
        assert(paxFields.length === 4);
        const eco = getIntFromElement(paxFields.eq(0));
        const bus = getIntFromElement(paxFields.eq(1));
        const first = getIntFromElement(paxFields.eq(2));
        const pax = getPax(eco, bus, first);

        demand.find('h4').text(`Passenger demand/day    (${pax} Pax)`);
    });
}

export const paxDisplay: Plugin = {
    name: 'PAX DISPLAY',
    urlPatterns: ['network/newline/[0-9]+/[a-z]+'],
    action: function() {
        const airportList = $('.airportList');
        assert(airportList.length === 1);

        airportList.each(function() {
            new MutationObserver(function() {
                calculatePax();
            }).observe(this, { childList: true });
        });

        calculatePax();
    }
};