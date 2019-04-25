import { Plugin } from '../plugin';
import { assert, getIntFromElement } from '../utils';

export const pricePerSeat: Plugin = {
    name: 'PRICE PER SEAT',
    urlPatterns: ['aircraft/buy/rental/[^/]+', 'aircraft/buy/new/[0-9]+/[^/]+'],
    action: function(pattern) {
        const isRental = pattern.startsWith('aircraft/buy/rental');
        $('.aircraftPurchaseBox').each(function() {
            const paxBox = $(this).find("li:contains('Seats') b");
            if (paxBox.length === 0) {
                // cargo, pass through
                return;
            }
            assert(paxBox.length === 1);

            const numPax = getIntFromElement(paxBox);
            if (numPax === 0) {
                // cargo, pass through
                return;
            }

            $(this).css({ height: '195px' });
            $(this)
                .find('.content')
                .css({ height: '115px' });
            $(this)
                .find('.aircraftPrice')
                .css({ 'max-width': '180px' });

            const priceBox = $(this).find("strong.discountTotalPrice, span:contains(' / Week') b");
            assert(priceBox.length === 1);

            const aircraftQuantitySelect = $(this).find('select.quantitySelect');

            const pricePerPaxBox = $('<span/>');
            priceBox.parent().append(pricePerPaxBox);

            const updatePricePerPax = function() {
                const aircraftQuantity: number = aircraftQuantitySelect.length === 1 ? (aircraftQuantitySelect.val() as number) : 1;
                const price = getIntFromElement(priceBox) / aircraftQuantity;
                const pricePerSeatText = (price / numPax).toLocaleString(undefined, { maximumFractionDigits: 0 });
                pricePerPaxBox.html(
                    `• Price per seat : <strong>${pricePerSeatText} $</strong>${isRental ? ' / Week' : ''}`
                );
            };

            new MutationObserver(updatePricePerPax).observe(priceBox[0], { childList: true });
            updatePricePerPax();
        });
    }
};
