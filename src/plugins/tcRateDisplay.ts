import { Plugin } from '../plugin';
import { getIntFromElement, getAircraftInfo } from '../utils';

export const tcRateDisplay: Plugin = {
    name: "TC RATE DISPLAY",
    urlPatterns: ["shop/workshop"],
    action: function () {
        $(`<style type='text/css'>
            .tcRate { font-weight: normal }
           </style>
        `).appendTo("head");
        const rackLabels = $(".rackLabel");
        rackLabels.each(function () {
            const labelText = $(this).text();
            const tcPrice = getIntFromElement($(this).next());

            if (labelText.startsWith("Tax")) {
                return;
            } else if (labelText.startsWith("Aircraft ")) {
                const aircraftName = $(this).text().replace("Aircraft ", "");
                const aircraftInfo = getAircraftInfo(aircraftName);
                if (!aircraftInfo) {
                    return;
                }
                const tcRate = aircraftInfo.price / tcPrice / 1000;
                $(this).html(`
                        ${aircraftName}
                        <span class="tcRate">(${tcRate.toFixed(2)}k$/TC)</span>
                `);
                // Show a tooltip of aircraft price
                $(this).parent().attr("title", `Aircraft price: $${aircraftInfo.price.toLocaleString()}`)
                    .tooltip({ position: { of: $(this), my: "bottom", at: "top+5px" } });
            } else if (labelText.endsWith(" $")) {
                const dollarAmount = getIntFromElement($(this));
                const tcRate = dollarAmount / tcPrice / 1000;
                $(this).html(`
                    +${dollarAmount / 1000000}M $
                    <span class="tcRate">(${tcRate.toFixed(2)}k$/TC)</span>
                `);
            } else if (labelText.endsWith(" R$")) {
                const researchDollarAmount = getIntFromElement($(this));
                const tcRate = researchDollarAmount / tcPrice / 1000;
                $(this).html(`
                    +${researchDollarAmount / 1000000}M R$
                    <span class="tcRate">(${tcRate.toFixed(2)}kR$/TC)</span>
                `);
            }
        });
    }
}
