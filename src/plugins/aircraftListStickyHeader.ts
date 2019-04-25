import { Plugin } from '../plugin';

export const aircraftListStickyHeader: Plugin = {
    name: "AIRCRAFT LIST STICKY HEADER",
    urlPatterns: ["aircraft/buy/rental/[^/]+", "aircraft/buy/new/[0-9]+/[^/]+"],
    action: function() {
        const filterAndWitnessBox = $(
            `<div id='filterAndWitnessBox' style='position: sticky; top: 0; z-index: 1; background: url(/images/interface/purchaseContainerMiddle_bg.png) -20px 0 repeat-y;'></div>`
        );
        $(".filterBox").before(filterAndWitnessBox);
        $(".filterBox, .witnessLine").appendTo(filterAndWitnessBox);
    }
}
