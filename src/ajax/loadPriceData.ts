import { isAMPlus, assert, sleep, getIntFromElement } from '../utils';
import { AJAX_COOLDOWN } from '../constants';

export async function loadPriceData() {
    const routePriceMap: any = {};

    const auditPage = $($.parseHTML(await $.get('/marketing/internalaudit/linelist')));
    const amPlus = await isAMPlus();

    for (const row of auditPage.find('table.internalAuditTable tbody tr[id]').toArray()) {
        const routeId = $(row).attr('id')!;
        let priceCells;

        if (amPlus) {
            priceCells = $(row)
                .next()
                .find("td:contains('$')");
        } else {
            console.log(`Loading line ${routeId}`);
            const pricePage = $($.parseHTML(await $.get(`/marketing/pricing/${routeId}`)));
            priceCells = pricePage.find(".box2 .priceBox .price:contains('Current') b");
            await sleep(AJAX_COOLDOWN);
        }

        assert(priceCells.length === 4);
        routePriceMap[routeId] = {
            eco: getIntFromElement(priceCells.eq(0)),
            bus: getIntFromElement(priceCells.eq(1)),
            first: getIntFromElement(priceCells.eq(2)),
            cargo: getIntFromElement(priceCells.eq(3))
        };
    }

    return routePriceMap;
}
