import { Plugin } from '../plugin';
import { assert, getIntFromString } from '../utils';

export const auditPriceApplying: Plugin = {
    name: 'AUDIT PRICE APPLYING',
    urlPatterns: ['marketing/pricing/[0-9]+(\\?.*)?'],
    action: function() {
        if ($('.box1').length === 0) {
            // No audit result
            return;
        }

        assert($('a.marketing_PriceLink').length === 1);
        $(`<a id="applyIdealPricesButton" class="gradientButton gradientButtonYellow" style="float:right;cursor:pointer;user-select:none">
            <img src="//goo.gl/Tpw577" width="28" height="28">
            <span>Apply ideal prices</span>
        </a>`).insertBefore('a.marketing_PriceLink');
        $('#applyIdealPricesButton, a.marketing_PriceLink').wrapAll(`<div/>`);

        $('#applyIdealPricesButton').click(function() {
            if (!$('.reliability0').text().startsWith('Recent')) {
                if (!confirm('Audit result is not up to date, continue?')) {
                    return;
                }
            }

            assert($('.box1 .price b').length === 4);
            $('#line_priceEco').val(getIntFromString($('.box1 .price b')[0].innerText));
            $('#line_priceBus').val(getIntFromString($('.box1 .price b')[1].innerText));
            $('#line_priceFirst').val(getIntFromString($('.box1 .price b')[2].innerText));
            $('#line_priceCargo').val(getIntFromString($('.box1 .price b')[3].innerText));

            $('form.submitButton input[type=submit]').click();
        });
    }
};
