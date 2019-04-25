import { Plugin } from '../plugin';
import { getIntFromElement, sleep } from '../utils';
import { loadSimulationResult } from '../ajax/loadSimulationResult';

function duperSimMain() {
    const SPINNER = `<img src="//goo.gl/aFrC17" width="20">`;

    const simulationCostBox = $('.demandSimulation > p:first-of-type');
    if (simulationCostBox.length !== 1) {
        return;
    }
    const simulationCost = getIntFromElement(simulationCostBox);

    $(`<style type='text/css'>
        #duperSimErrorBox { width: 598px; height: 40px; margin-bottom: 20px; padding: 0 12px; float: right; background-color: #fff2f2; color: #da4e28; display: flex; align-items: center }
        #duperSimErrorMessage { margin-left: 5px }
        #duperSimTable { margin-top: 13px; margin-left: auto; width: 622px; table-layout: fixed }
        #duperSimTable tr { height: 35px }
        #duperSimTable tbody tr:nth-child(even) { background-color: #f3fafe }
        #duperSimTable td:first-child { width: 130px; text-align: right; padding-right: 5px }
        #duperSimTable tbody td:not(:first-child), #duperSimTable thead { font-weight: bold }
        #duperSimTable td { vertical-align: middle; border-left: 2px solid #fff; border-right: 2px solid #fff }
        #duperSimTable td:not(:first-child) { text-align: center }
        #duperSimTable .new-segment { border-top: 1px dashed #aaa }
        .num-pos { color: #8ecb47 }
        .num-neg { color: #da4e28 }
       </style>
    `).appendTo('head');

    $(`
        <hr class="myGreyhr">
        <div id="duperSimBox" class="secretaryBox" style="margin-top:13px;width:715px;min-height:128px">
            <div class="avatar" style="float:left"><img src="//goo.gl/i627mQ" style="margin-left:15px"></div>
            <div class="explanation">
                <p>The DUPER Simulation enables you to determine the best price to get a remaining demand close to zero. This feature is only to be used if flights are scheduled for this route.</p>
                <input type="button" id="duperSimButton" class="validBtn validBtnBlue"
                    value="Perform a DUPER simulation with ${(simulationCost * 5).toLocaleString()} $"
                    style="position:absolute;top:47px;right:10px">
            </div>
            <div id="duperSimErrorBox"><strong>Error: </strong><span id="duperSimErrorMessage"></span></div>
        </div>
    `).appendTo('.secretaryBox');

    const resetUI = function () {
        $('#duperSimTable').remove();
        $(`
            <table id="duperSimTable">
                <thead>
                    <tr>
                    <td></td><td colspan="2">Economy class</td><td colspan="2">Business class</td><td colspan="2">First class</td>
                    </tr>
                </thead>
                <tbody>
                    <tr id="row-starting-price" class="new-segment"><td>Starting Price</td></tr>
                    <tr id="row-arrow-1"><td></td><td colspan="2">↓</td><td colspan="2">↓</td><td colspan="2">↓</td></tr>
                    <tr id="row-pax-1"><td>Demand</td></tr>
                    <tr id="row-supply"><td>Supply</td></tr>
                    <tr id="row-price-step"><td>Price step</td></tr>
                    <tr id="row-near-samples" class="new-segment"><td>Samples (Near)</td></tr>
                    <tr id="row-arrow-2"><td></td><td>↓</td><td>↓</td><td>↓</td><td>↓</td><td>↓</td><td>↓</td></tr>
                    <tr id="row-pax-2"><td>Demand</td></tr>
                    <tr id="row-far-samples" class="new-segment"><td>Samples (Far)</td></tr>
                    <tr id="row-arrow-3"><td></td><td>↓</td><td>↓</td><td>↓</td><td>↓</td><td>↓</td><td>↓</td></tr>
                    <tr id="row-pax-3"><td>Demand</td></tr>
                    <tr id="row-under-equation" class="new-segment"><td>Underprice Equation</td></tr>
                    <tr id="row-over-equation"><td>Overprice Equation</td></tr>
                    <tr id="row-ideal-price" class="new-segment"><td>Ideal price</td></tr>
                    <tr id="row-arrow-4"><td></td><td colspan="2">↓</td><td colspan="2">↓</td><td colspan="2">↓</td></tr>
                    <tr id="row-pax-4"><td>Demand</td></tr>
                    <tr id="row-ideal-turnover"><td>Ideal Turnover</td></tr>
                    <tr id="row-best-price" class="new-segment"><td>Best price</td></tr>
                    <tr id="row-arrow-5"><td></td><td colspan="2">↓</td><td colspan="2">↓</td><td colspan="2">↓</td></tr>
                    <tr id="row-pax-5"><td>Demand</td></tr>
                    <tr id="row-best-turnover"><td>Best Turnover</td></tr>
                </tbody>
            </table>
        `).appendTo('#duperSimBox');

        $('#duperSimTable thead, #duperSimTable tbody tr, #duperSimErrorBox').hide();
    };
    resetUI();

    const showError = function (message: string) {
        $('#duperSimErrorMessage').text(message);
        $('#duperSimErrorBox').show();
        $('#duperSimErrorBox')[0].scrollIntoView({ behavior: 'smooth' });
    };

    $('#duperSimButton').click(async function () {
        const STEP_RATIO = 0.12;
        const PAX_EPSILON = 3;
        const COOLDOWN = 5000;
        const ANIMATION_SPEED = 800;
        const [ECO, BUS, FIRST, CARGO] = [0, 1, 2, 3];
        const [L2, L1, R1, R2] = [0, 1, 2, 3];

        const lineId: number = $('input#lineId').val() as number;

        if ($(".box1 div.price:contains('Ideal')").length === 0) {
            showError('You must perform an audit before DUPER Sim.');
            return;
        }

        const prices = $(".box1 div.price:contains('Ideal')")
            .map((index, elem) => getIntFromElement($(elem)))
            .get();
        const demands: number[] = [];
        const supplies: number[] = [];

        const step = prices.map(price => Math.floor(STEP_RATIO * price));
        const simPrices = [
            prices.map((price, index) => price - 2 * step[index]),
            prices.map((price, index) => price - step[index]),
            prices.map((price, index) => price + step[index]),
            prices.map((price, index) => price + 2 * step[index])
        ];
        const sim = [];

        // ui reset
        resetUI();

        // iteration 0
        for (const seat of [ECO, BUS, FIRST]) {
            $('#row-starting-price').append(`<td colspan="2">${prices[seat].toLocaleString()} $</td>`);
            $('#row-pax-1').append(`<td id="cell-pax-1-${seat}" colspan="2">${SPINNER}</td>`);
        }
        $('#duperSimTable thead, #row-starting-price, #row-arrow-1, #row-pax-1').show(ANIMATION_SPEED);
        $('#row-pax-1')[0].scrollIntoView({ behavior: 'smooth' });
        await sleep(ANIMATION_SPEED);

        const initialSimResult = await loadSimulationResult(lineId, prices);
        for (const seat of [ECO, BUS, FIRST, CARGO]) {
            demands[seat] = initialSimResult[seat].pax;
            supplies[seat] = demands[seat] - initialSimResult[seat].paxLeft;
        }

        const getPaxTextClass = (pax: number, seat: number) => (pax - supplies[seat] >= 0 ? 'num-pos' : 'num-neg');

        for (const seat of [ECO, BUS, FIRST]) {
            $(`#cell-pax-1-${seat}`).html(
                `<span class="${getPaxTextClass(initialSimResult[seat].pax, seat)}">
                    ${initialSimResult[seat].pax} Pax
                </span>`
            );
            $('#row-supply').append(`<td colspan="2">${supplies[seat]} Pax</td>`);
            $('#row-price-step').append(`<td colspan="2">${step[seat].toLocaleString()} $</td>`);
        }
        $('#row-supply, #row-price-step, #row-near-samples, #row-arrow-2, #row-pax-2').show(ANIMATION_SPEED);
        $('#row-pax-2')[0].scrollIntoView({ behavior: 'smooth' });

        // iteration 1
        for (const seat of [ECO, BUS, FIRST]) {
            $('#row-near-samples').append(`
                <td>${simPrices[L1][seat].toLocaleString()} $</td>
                <td>${simPrices[R1][seat].toLocaleString()} $</td>
            `);
            $('#row-pax-2').append(`
                <td id="cell-pax-2-${seat}-l">${SPINNER}</td>
                <td id="cell-pax-2-${seat}-r">${SPINNER}</td>
            `);
        }

        await sleep(COOLDOWN);
        sim[L1] = await loadSimulationResult(lineId, simPrices[L1]);
        for (const seat of [ECO, BUS, FIRST]) {
            $(`#cell-pax-2-${seat}-l`).html(
                `<span class="${getPaxTextClass(sim[L1][seat].pax, seat)}">${sim[L1][seat].pax} Pax</span>`
            );
        }

        await sleep(COOLDOWN);
        sim[R1] = await loadSimulationResult(lineId, simPrices[R1]);
        for (const seat of [ECO, BUS, FIRST]) {
            $(`#cell-pax-2-${seat}-r`).html(
                `<span class="${getPaxTextClass(sim[R1][seat].pax, seat)}">${sim[R1][seat].pax} Pax</span>`
            );
        }

        for (const seat of [ECO, BUS, FIRST]) {
            if (Math.abs(sim[L1][seat].pax + sim[R1][seat].pax - 2 * demands[seat]) < PAX_EPSILON) {
                showError('Audit info is too outdated.');
                return;
            }

            if (sim[L1][seat].pax <= 0 || sim[R1][seat].pax <= 0) {
                showError('Zero pax encountered.');
                return;
            }
        }

        // iteration 2
        $('#row-far-samples, #row-arrow-3, #row-pax-3').show(ANIMATION_SPEED);
        $('#row-pax-3')[0].scrollIntoView({ behavior: 'smooth' });
        for (const seat of [ECO, BUS, FIRST]) {
            $('#row-far-samples').append(`
                <td>${simPrices[L2][seat].toLocaleString()} $</td>
                <td>${simPrices[R2][seat].toLocaleString()} $</td>
            `);
            $('#row-pax-3').append(`
                <td id="cell-pax-3-${seat}-l">${SPINNER}</td>
                <td id="cell-pax-3-${seat}-r">${SPINNER}</td>
            `);
        }

        await sleep(COOLDOWN);
        sim[L2] = await loadSimulationResult(lineId, simPrices[L2]);
        for (const seat of [ECO, BUS, FIRST]) {
            $(`#cell-pax-3-${seat}-l`).html(
                `<span class="${getPaxTextClass(sim[L2][seat].pax, seat)}">${sim[L2][seat].pax} Pax</span>`
            );
        }

        await sleep(COOLDOWN);
        sim[R2] = await loadSimulationResult(lineId, simPrices[R2]);
        for (const seat of [ECO, BUS, FIRST]) {
            $(`#cell-pax-3-${seat}-r`).html(
                `<span class="${getPaxTextClass(sim[R2][seat].pax, seat)}">${sim[R2][seat].pax} Pax</span>`
            );
        }

        for (const seat of [ECO, BUS, FIRST]) {
            if (sim[L2][seat].pax <= 0 || sim[R2][seat].pax <= 0) {
                showError('Zero pax encountered.');
                return;
            }
        }

        // data crunching
        const solution = [];
        for (const seat of [ECO, BUS, FIRST]) {
            const a1 = (sim[L1][seat].pax - sim[L2][seat].pax) / (simPrices[L1][seat] - simPrices[L2][seat]);
            const b1 = sim[L1][seat].pax - a1 * simPrices[L1][seat];
            const a2 = (sim[R1][seat].pax - sim[R2][seat].pax) / (simPrices[R1][seat] - simPrices[R2][seat]);
            const b2 = sim[R1][seat].pax - a2 * simPrices[R1][seat];

            const idealPrice = (b2 - b1) / (a1 - a2);
            const idealPax = a1 * idealPrice + b1;
            const idealTurnover = Math.round(idealPrice) * Math.round(idealPax);
            const bestPrice = supplies[seat] >= idealPax ? idealPrice : (supplies[seat] - b2) / a2;
            const bestPax = Math.min(
                supplies[seat],
                Math.round(bestPrice) >= idealPrice ? a2 * bestPrice + b2 : a1 * bestPrice + b1
            );
            const bestTurnover = Math.round(bestPrice) * Math.round(bestPax);

            solution[seat] = {
                idealPrice,
                idealPax,
                idealTurnover,
                bestPrice,
                bestPax,
                bestTurnover,
                a1,
                b1,
                a2,
                b2
            };
        }

        for (const seat of [ECO, BUS, FIRST]) {
            $('#row-under-equation').append(
                `<td colspan="2" style="font-style:italic">
                    y = ${solution[seat].a1.toFixed(4)}x + ${solution[seat].b1.toFixed(4)}
                </td>`
            );
            $('#row-over-equation').append(
                `<td colspan="2" style="font-style:italic">
                    y = ${solution[seat].a2.toFixed(4)}x + ${solution[seat].b2.toFixed(4)}
                </td>`
            );
            $('#row-ideal-price').append(
                `<td colspan="2">${Math.round(solution[seat].idealPrice).toLocaleString()} $</td>`
            );
            $('#row-pax-4').append(
                `<td colspan="2"><span class="${getPaxTextClass(
                    Math.round(solution[seat].idealPax),
                    seat
                )}">${Math.round(solution[seat].idealPax)} Pax</span></td>`
            );
            $('#row-ideal-turnover').append(
                `<td colspan="2">${solution[seat].idealTurnover.toLocaleString()} $</td>`
            );
            $('#row-best-price').append(
                `<td colspan="2">${Math.round(solution[seat].bestPrice).toLocaleString()} $</td>`
            );
            $('#row-pax-5').append(
                `<td colspan="2"><span class="${getPaxTextClass(
                    Math.round(solution[seat].bestPax),
                    seat
                )}">${Math.round(solution[seat].bestPax)} Pax</span></td>`
            );
            $('#row-best-turnover').append(
                `<td colspan="2">${solution[seat].bestTurnover.toLocaleString()} $</td>`
            );
        }

        $(
            '#row-under-equation, #row-over-equation, #row-ideal-price, #row-arrow-4, #row-pax-4, #row-ideal-turnover, #row-best-price, #row-arrow-5, #row-pax-5, #row-best-turnover'
        ).show(ANIMATION_SPEED);
        $('#row-best-turnover')[0].scrollIntoView({ behavior: 'smooth' });

        // debugger;
    });
}

export const duperSim: Plugin = {
    name: 'DUPERSIM',
    urlPatterns: ['marketing/pricing/[0-9]+'],
    action: duperSimMain
};
