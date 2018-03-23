// ==UserScript==
// @name         AM2 Assist
// @namespace    http://tampermonkey.net/
// @version      0.6.0
// @description  Airlines Manager 2 Assist
// @author       statm
// @contributor  henryzhou
// @license      MIT
// @match        http://www.airlines-manager.com/*
// @grant        none
// @updateURL    https://github.com/statm/am2-assist/raw/master/AM2_Assist.user.js
// ==/UserScript==

(function() {
    "use strict";

    const VERSION = "0.6.0";
    const ROOT_URL = "http://www.airlines-manager.com/";
    const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const pageUrl = window.location.href.replace(ROOT_URL, "");
    const modules = {};
    function define(urlPatterns, func, name) {
        for (const pattern of urlPatterns) {
            if (!modules[pattern]) {
                modules[pattern] = [];
            }

            modules[pattern].push([func, name]);
        }
    }

    // ================ PAGE MODULES ==========================
    /* SLOT MACHINE AUTOMATION */
    define(["company/cockpitASous"], function() {
        let playing = false;
        let gameCount = 0;
        let logText = "";
        const harvest = {};
        const harvestNames = [["d", "$"], ["rd", "R$"], ["t", "Tickets"], ["tr", "TC"]];

        $("#gameAlsoOnMobile").remove();

        const logArea = $("<textarea style='width:710px;height:100px;margin:25px 15px 0px 15px' readonly />");
        $(".cockpitASousContent").append(logArea);

        $("button#playForOneTicket")
            .unbind("click")
            .click(function() {
                if (!playing) {
                    play();
                }
            });

        function log(text) {
            logText += text;
            logArea.val(logText).scrollTop(logArea[0].scrollHeight);
        }

        function play() {
            playing = true;
            ++gameCount;
            log(`Game ${gameCount}...`);
            $.get("cockpitASous/play", function(resp) {
                const data = $.parseJSON(resp);

                if (data.errorMsg) {
                    playing = false;
                    log(`${data.errorMsg} (Error ${data.errorCode})\n`);
                    log(`================== Ended ==================\n`);
                    return;
                }

                if (data.gain) {
                    if (data.gain.gainLabel.endsWith(" R$")) {
                        data.gain.gainLabel = "+R$ " + data.gain.gainLabel.substr(1, data.gain.gainLabel.length - 3);
                    } else if (data.gain.gainLabel.endsWith(" $")) {
                        data.gain.gainLabel = "+$ " + data.gain.gainLabel.substr(1, data.gain.gainLabel.length - 2);
                    }
                    log(`${data.gain.gainLabel}\n`);

                    if (!(data.gain.gainType in harvest)) {
                        harvest[data.gain.gainType] = 0;
                    }
                    harvest[data.gain.gainType] += data.gain.gainAmount;
                } else {
                    log("nothing\n");
                }

                if (!data.isAllowToPlay || data.nbOfTickets == 0) {
                    playing = false;
                    log(`================== Ended ==================\n`);
                    for (const harvestNamePair of harvestNames) {
                        const harvestName = harvestNamePair[0];
                        const harvestDisplayName = harvestNamePair[1];
                        if (harvest[harvestName]) {
                            log(`${harvestDisplayName}: ${harvest[harvestName].toLocaleString()}\n`);
                        }
                    }
                } else {
                    setTimeout(play, 500);
                }
            });
        }
    }, "SLOT MACHINE AUTOMATION");

    /* SKIP LOADING SCREEN */
    define(["home/loading"], function() {
        window.location = "/home";
    }, "SKIP LOADING SCREEN");

    /* STAR PROGRESS BAR */
    define(["home"], async function() {
        const STAR_TABLE = [
            0,
            4000000,
            6000000,
            9000000,
            12000000,

            17000000,
            24000000,
            32000000,
            39000000,
            47000000,

            60000000,
            90000000,
            140000000,
            200000000,
            300000000
        ];

        const companyName = $(".companyNameBox").html();

        const spValue = await loadStructralProfit(companyName);
        if (!spValue || spValue >= STAR_TABLE[STAR_TABLE.length - 1]) {
            return;
        }

        let spProgress;
        let stars;
        for (let i = 0; i < STAR_TABLE.length - 1; ++i) {
            if (spValue >= STAR_TABLE[i] && spValue < STAR_TABLE[i + 1]) {
                stars = i + 1;
                spProgress = (spValue - STAR_TABLE[i]) / (STAR_TABLE[i + 1] - STAR_TABLE[i]) * 100;
                break;
            }
        }

        $(".companyStars").append(
            "<div id='spProgress' style='display:flex;margin-top:4px;align-items:center;'><div id='spProgressBar' style='width:75px;'/><div id='spProgressText' style='margin-left:5px'/></div>"
        );
        $("#spProgressBar").progressbar({
            value: spProgress
        });
        $("#spProgressText").html(`${spProgress.toFixed(1)}%`);

        const spTooltipText = [
            `Current SP: $${spValue.toLocaleString()}`,
            `Next star: $${STAR_TABLE[stars].toLocaleString()}`
        ];
        if (stars > 0) {
            spTooltipText.unshift(`Last star: $${STAR_TABLE[stars - 1].toLocaleString()}`);
        }
        $("#spProgress")
            .attr("title", spTooltipText.join("\n"))
            .tooltip({ content: spTooltipText.join("<br/>") });

        $("#spProgressBar").attr("class", "progressbar");
        $("#spProgressBar > div").attr("class", "progressbarValue");
    }, "STAR PROGRESS BAR");

    /* ENHANCE AIRCRAFT PROFIBILITY DETAIL */
    define(["aircraft/show/[0-9]", "aircraft/buy/new/[0-9]+/[^/]+/.*"], function() {
        //
    }, "ENHANCE AIRCRAFT PROFIBILITY DETAIL");

    /* RECONFIGURATION ASSIST */
    define(["aircraft/show/[0-9]+/reconfigure", "aircraft/buy/new/[0-9]+/[^/]+/.*"], async function() {
        $(`<style type='text/css'>
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
           </style>`).appendTo("head");
        const reconfigBox = $("<div id='reconfigBox'></div>");

        const networkData = await loadNetworkData();

        let currentAircraftSpeed;
        let currentAircraftRange;
        let currentAircraftCategory;
        let ownAircraftMatch = pageUrl.match(/aircraft\/show\/([0-9]+)\/reconfigure/);

        if (ownAircraftMatch) {
            const currentAircraftId = ownAircraftMatch[1];
            currentAircraftSpeed = networkData.aircraftMap[currentAircraftId].speed;
            currentAircraftRange = networkData.aircraftMap[currentAircraftId].range;
            currentAircraftCategory = networkData.aircraftMap[currentAircraftId].category;
        } else {
            const aircraftPurchaseBox = $(".aircraftPurchaseBox");
            currentAircraftSpeed = getIntFromElement(aircraftPurchaseBox.find("li:contains('Speed') b"));
            currentAircraftRange = getIntFromElement(aircraftPurchaseBox.find("li:contains('Range') b"));
            currentAircraftCategory = parseInt(
                aircraftPurchaseBox
                    .find(".title img")
                    .attr("alt")
                    .replace("cat", "")
            );
            reconfigBox.css({ height: "300px", "margin-top": "70px" });
        }

        const possibleRoutes = networkData.routeList
            .filter(route => route.distance <= currentAircraftRange && route.category >= currentAircraftCategory)
            .sort((r1, r2) => r2.distance - r1.distance);

        possibleRoutes.forEach(route => {
            const flightTime = calculateFlightTime(route.distance, currentAircraftSpeed, networkData.flightParameters);
            const flightTimeH = (flightTime / 60) | 0;
            const flightTimeM = flightTime % 60;

            const titleBox = $(
                `<div class='route-title'>
                    <span class='route-name'>${route.name}</span>
                    <span class='route-dist'>${route.distance}km (${flightTimeH}h${flightTimeM})</span>
                    </div>`
            );
            reconfigBox.append(titleBox);

            const paxGroup = [];
            for (let i = 0; i < route.remaining.length; ++i) {
                const currentPax = route.remaining[i];
                if (paxGroup.length == 0) {
                    paxGroup.push({ days: [i], pax: currentPax });
                    continue;
                }

                const lastPax = paxGroup[paxGroup.length - 1];
                if (
                    currentPax.eco == lastPax.pax.eco &&
                    currentPax.bus == lastPax.pax.bus &&
                    currentPax.first == lastPax.pax.first &&
                    currentPax.cargo == lastPax.pax.cargo
                ) {
                    lastPax.days.push(i);
                } else {
                    paxGroup.push({ days: [i], pax: currentPax });
                }
            }

            const getPaxTextClass = pax => (pax >= 0 ? "num-pos" : "num-neg");

            paxGroup.forEach(paxSeg => {
                const dayText =
                    paxSeg.days.length == 1
                        ? `${DAYS_SHORT[paxSeg.days[0]]}`
                        : `${DAYS_SHORT[paxSeg.days[0]]}-${DAYS_SHORT[paxSeg.days[paxSeg.days.length - 1]]}`;
                const paxData = paxSeg.pax;
                const paxBox = $(
                    `<div class='pax-line'>
                        <span class='day-box'>${dayText}</span>
                        <span class='pax-box ${getPaxTextClass(paxData.eco)}'>${paxData.eco}</span>
                        <span class='pax-box ${getPaxTextClass(paxData.bus)}'>${paxData.bus}</span>
                        <span class='pax-box ${getPaxTextClass(paxData.first)}'>${paxData.first}</span>
                        <span class='pax-box ${getPaxTextClass(paxData.cargo)}'>${paxData.cargo}T</span>
                        </div>`
                );
                reconfigBox.append(paxBox);
            });
        });

        $("#box2").after(reconfigBox);
    }, "RECONFIGURATION ASSIST");

    /* MAXIMIZE LOAN AMOUNT */
    define(["finances/bank/[0-9]+/stockMarket/request"], function() {
        $("#request_amount").val($("#request_amount").attr("data-amount"));
    }, "MAXIMIZE LOAN AMOUNT");

    /* PRICE PER SEAT */
    define(["aircraft/buy/rental/[^/]+", "aircraft/buy/new/[0-9]+/[^/]+"], function(pattern) {
        const isRental = pattern.startsWith("aircraft/buy/rental");
        $(".aircraftPurchaseBox").each(function() {
            const paxBox = $(this).find("li:contains('Seats') b");
            if (paxBox.length == 0) {
                // cargo, pass through
                return;
            }
            assert(paxBox.length == 1);

            const numPax = getIntFromElement(paxBox);
            if (numPax == 0) {
                // cargo, pass through
                return;
            }

            $(this).css({ height: "195px" });
            $(this)
                .find(".content")
                .css({ height: "115px" });
            $(this)
                .find(".aircraftPrice")
                .css({ "max-width": "180px" });

            const priceBox = $(this).find("strong.discountTotalPrice, span:contains(' / Week') b");
            assert(priceBox.length == 1);

            const aircraftQuantitySelect = $(this).find("select.quantitySelect");

            const pricePerPaxBox = $("<span/>");
            priceBox.parent().append(pricePerPaxBox);

            const updatePricePerPax = function() {
                const aircraftQuantity = aircraftQuantitySelect.length == 1 ? aircraftQuantitySelect.val() : 1;
                const price = getIntFromElement(priceBox) / aircraftQuantity;
                const pricePerSeatText = (price / numPax).toLocaleString(undefined, { maximumFractionDigits: 0 });
                pricePerPaxBox.html(
                    `• Price per seat : <strong>${pricePerSeatText} $</strong>${isRental ? " / Week" : ""}`
                );
            };

            new MutationObserver(updatePricePerPax).observe(priceBox[0], { childList: true });
            updatePricePerPax();
        });
    }, "PRICE PER SEAT");

    /* AIRCRAFT FILTERING */
    define(["aircraft/buy/rental/[^/]+", "aircraft/buy/new/[0-9]+/[^/]+"], function() {
        const filterUnavailableCheckBox = $(
            `<div style="margin-top:3px"><label><input type="checkbox" id="toggleAircraftsDisplay" style="margin-right:9px;vertical-align:middle">Filter unavailable aircrafts</label></div>`
        );
        $("form#aircraftFilterForm, .rentalFilterBox form").append(filterUnavailableCheckBox);

        $("select#lineListSelect").change(toggleAircraftAvailability);
        $("input#toggleAircraftsDisplay").click(toggleAircraftAvailability);

        function isAircraftAvailable(aircraftPurchaseBox) {
            return !aircraftPurchaseBox.hasClass("disabled-research") && !aircraftPurchaseBox.hasClass("disabled");
        }

        function toggleAircraftAvailability() {
            $(".aircraftPurchaseBox").each(function() {
                if (isAircraftAvailable($(this))) {
                    $(this).show();
                    return;
                }

                if ($("input#toggleAircraftsDisplay").prop("checked")) {
                    $(this).hide();
                } else {
                    $(this).show();
                }
            });
        }
    }, "AIRCRAFT FILTERING");

    /* DUPERSIM */
    define(["marketing/pricing/[0-9]+"], function() {
        const SPINNER = `<img src="https://goo.gl/aFrC17" width="20">`;

        $(`<style type='text/css'>
            #duperSimTable { margin-top: 13px; margin-left: auto; width: 622px; table-layout: fixed }
            #duperSimTable tr { height: 35px }
            #duperSimTable tbody tr:nth-child(even) { background-color: #f3fafe }
            #duperSimTable td:first-child { width: 130px; text-align: right; padding-right: 5px }
            #duperSimTable tbody td:not(:first-child), #duperSimTable thead { font-weight: bold }
            #duperSimTable td { vertical-align: middle; border-left: 2px solid #FFF; border-right: 2px solid #FFF }
            #duperSimTable td:not(:first-child) { text-align: center }
            #duperSimTable .new-segment { border-top: 1px dashed #AAA }
            .num-pos { color: #8ecb47 }
            .num-neg { color: #da4e28 }
           </style>
        `).appendTo("head");

        const simulationCost = getIntFromElement($(".demandSimulation > p:first-of-type"));

        const duperSimHtml = $(`
            <hr class="myGreyhr">
            <div id="duperSimBox" class="secretaryBox" style="margin-top:13px;width:715px;min-height:128px">
                <div class="avatar" style="float:left"><img src="https://goo.gl/i627mQ" style="margin-left:15px"></div>
                <div class="explanation">
                    <p>The DUPER Simulation enables you to determine the best price to get a remaining demand close to zero. This feature is only to be used if flights are scheduled for this route.</p>
                    <input type="button" id="duperSimButton" class="validBtn validBtnBlue" value="Perform a DUPER simulation with ${(
                        simulationCost * 5
                    ).toLocaleString()} $" style="position:absolute;top:47px;right:10px">
                    </div>
                    </div>
        `);
        $(".secretaryBox").after(duperSimHtml);

        const duperSimTable = $(`
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
        `);
        $("#duperSimBox").append(duperSimTable);
        $("#duperSimTable thead, #duperSimTable tbody tr").hide();

        $("#duperSimButton").click(async function() {
            const STEP_RATIO = 0.12;
            const PAX_EPSILON = 3;
            const COOLDOWN = 5000;
            const ANIMATION_SPEED = 800;
            const [ECO, BUS, FIRST, CARGO] = [0, 1, 2, 3];
            const [L2, L1, R1, R2] = [0, 1, 2, 3];

            const error = console.error;

            const lineId = $("input#lineId").val();
            const prices = $(".box1 div.price:contains('Ideal')")
                .map((index, elem) => getIntFromElement($(elem)))
                .get();
            const demands = [];
            const supplies = [];

            const step = prices.map(price => (STEP_RATIO * price) | 0);
            const simPrices = [
                prices.map((price, index) => price - 2 * step[index]),
                prices.map((price, index) => price - step[index]),
                prices.map((price, index) => price + step[index]),
                prices.map((price, index) => price + 2 * step[index])
            ];
            const sim = [];

            // iteration 0
            for (const seat of [ECO, BUS, FIRST]) {
                $("#row-starting-price").append(`<td colspan="2">${prices[seat].toLocaleString()} $</td>`);
                $("#row-pax-1").append(`<td id="cell-pax-1-${seat}" colspan="2">${SPINNER}</td>`);
            }
            $("#duperSimTable thead, #row-starting-price, #row-arrow-1, #row-pax-1").show(ANIMATION_SPEED);
            $("#row-pax-1")[0].scrollIntoView({ behavior: "smooth" });
            await sleep(ANIMATION_SPEED);

            const initialSimResult = await loadSimulationResult(lineId, ...prices);
            for (const seat of [ECO, BUS, FIRST, CARGO]) {
                demands[seat] = initialSimResult[seat].pax;
                supplies[seat] = demands[seat] - initialSimResult[seat].paxLeft;
            }

            const getPaxTextClass = (pax, seat) => (pax - supplies[seat] >= 0 ? "num-pos" : "num-neg");

            for (const seat of [ECO, BUS, FIRST]) {
                $(`#cell-pax-1-${seat}`).html(
                    `<span class="${getPaxTextClass(initialSimResult[seat].pax, seat)}">
                        ${initialSimResult[seat].pax} Pax
                    </span>`
                );
                $("#row-supply").append(`<td colspan="2">${supplies[seat]} Pax</td>`);
                $("#row-price-step").append(`<td colspan="2">${step[seat].toLocaleString()} $</td>`);
            }
            $("#row-supply, #row-price-step, #row-near-samples, #row-arrow-2, #row-pax-2").show(ANIMATION_SPEED);
            $("#row-pax-2")[0].scrollIntoView({ behavior: "smooth" });

            // iteration 1
            for (const seat of [ECO, BUS, FIRST]) {
                $("#row-near-samples").append(`
                    <td>${simPrices[L1][seat].toLocaleString()} $</td>
                    <td>${simPrices[R1][seat].toLocaleString()} $</td>
                `);
                $("#row-pax-2").append(`
                    <td id="cell-pax-2-${seat}-l">${SPINNER}</td>
                    <td id="cell-pax-2-${seat}-r">${SPINNER}</td>
                `);
            }

            await sleep(COOLDOWN);
            sim[L1] = await loadSimulationResult(lineId, ...simPrices[L1]);
            for (const seat of [ECO, BUS, FIRST]) {
                $(`#cell-pax-2-${seat}-l`).html(
                    `<span class="${getPaxTextClass(sim[L1][seat].pax, seat)}">${sim[L1][seat].pax} Pax</span>`
                );
            }

            await sleep(COOLDOWN);
            sim[R1] = await loadSimulationResult(lineId, ...simPrices[R1]);
            for (const seat of [ECO, BUS, FIRST]) {
                $(`#cell-pax-2-${seat}-r`).html(
                    `<span class="${getPaxTextClass(sim[R1][seat].pax, seat)}">${sim[R1][seat].pax} Pax</span>`
                );
            }

            for (const seat of [ECO, BUS, FIRST]) {
                if (Math.abs(sim[L1][seat].pax + sim[R1][seat].pax - 2 * demands[seat]) < PAX_EPSILON) {
                    error("delta not significant");
                    debugger;
                    return;
                }
            }

            // iteration 2
            $("#row-far-samples, #row-arrow-3, #row-pax-3").show(ANIMATION_SPEED);
            $("#row-pax-3")[0].scrollIntoView({ behavior: "smooth" });
            for (const seat of [ECO, BUS, FIRST]) {
                $("#row-far-samples").append(`
                    <td>${simPrices[L2][seat].toLocaleString()} $</td>
                    <td>${simPrices[R2][seat].toLocaleString()} $</td>
                `);
                $("#row-pax-3").append(`
                    <td id="cell-pax-3-${seat}-l">${SPINNER}</td>
                    <td id="cell-pax-3-${seat}-r">${SPINNER}</td>
                `);
            }

            await sleep(COOLDOWN);
            sim[L2] = await loadSimulationResult(lineId, ...simPrices[L2]);
            for (const seat of [ECO, BUS, FIRST]) {
                $(`#cell-pax-3-${seat}-l`).html(
                    `<span class="${getPaxTextClass(sim[L2][seat].pax, seat)}">${sim[L2][seat].pax} Pax</span>`
                );
            }

            await sleep(COOLDOWN);
            sim[R2] = await loadSimulationResult(lineId, ...simPrices[R2]);
            for (const seat of [ECO, BUS, FIRST]) {
                $(`#cell-pax-3-${seat}-r`).html(
                    `<span class="${getPaxTextClass(sim[R2][seat].pax, seat)}">${sim[R2][seat].pax} Pax</span>`
                );
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
                $("#row-under-equation").append(
                    `<td colspan="2" style="font-style:italic">
                        y = ${solution[seat].a1.toFixed(4)}x + ${solution[seat].b1.toFixed(4)}
                    </td>`
                );
                $("#row-over-equation").append(
                    `<td colspan="2" style="font-style:italic">
                        y = ${solution[seat].a2.toFixed(4)}x + ${solution[seat].b2.toFixed(4)}
                    </td>`
                );
                $("#row-ideal-price").append(
                    `<td colspan="2">${Math.round(solution[seat].idealPrice).toLocaleString()} $</td>`
                );
                $("#row-pax-4").append(
                    `<td colspan="2"><span class="${getPaxTextClass(
                        Math.round(solution[seat].idealPax),
                        seat
                    )}">${Math.round(solution[seat].idealPax)} Pax</span></td>`
                );
                $("#row-ideal-turnover").append(
                    `<td colspan="2">${solution[seat].idealTurnover.toLocaleString()} $</td>`
                );
                $("#row-best-price").append(
                    `<td colspan="2">${Math.round(solution[seat].bestPrice).toLocaleString()} $</td>`
                );
                $("#row-pax-5").append(
                    `<td colspan="2"><span class="${getPaxTextClass(
                        Math.round(solution[seat].bestPax),
                        seat
                    )}">${Math.round(solution[seat].bestPax)} Pax</span></td>`
                );
                $("#row-best-turnover").append(
                    `<td colspan="2">${solution[seat].bestTurnover.toLocaleString()} $</td>`
                );
            }

            $(
                "#row-under-equation, #row-over-equation, #row-ideal-price, #row-arrow-4, #row-pax-4, #row-ideal-turnover, #row-best-price, #row-arrow-5, #row-pax-5, #row-best-turnover"
            ).show(ANIMATION_SPEED);
            $("#row-best-turnover")[0].scrollIntoView({ behavior: "smooth" });

            // debugger;
        });
    }, "DUPERSIM");
    // ========================================================

    // ======================== AJAX ==========================
    async function loadStructralProfit(companyName) {
        return $.get(`/company/ranking/?searchTerm=${companyName}`).then(function(data) {
            const rankingBox = $($.parseHTML(data)).find(`div.box1:contains("${companyName}") .underBox4`);
            if (rankingBox.length == 0) {
                return;
            }
            return getIntFromElement(rankingBox);
        });
    }

    async function loadNetworkData() {
        return new Promise(function(resolve, reject) {
            const networkIFrame = $(
                "<iframe src='http://www.airlines-manager.com/network/planning' width='0' height='0'/>"
            );
            networkIFrame.load(async function() {
                await wait(() => networkIFrame[0].contentWindow.hasAlreadyRegroupedData, 100, 50);

                const aircraftList = networkIFrame[0].contentWindow.aircraftListLoaded;
                const routeList = networkIFrame[0].contentWindow.lineListLoaded;
                const aircraftMap = {};
                const routeMap = {};

                for (const route of routeList) {
                    route.remaining = [];
                    for (let i = 0; i < 7; ++i) {
                        route.remaining.push({
                            eco: route.paxAttEco,
                            bus: route.paxAttBus,
                            first: route.paxAttFirst,
                            cargo: route.paxAttCargo
                        });
                    }

                    routeMap[route.id] = route;
                }

                for (const aircraft of aircraftList) {
                    for (let i = 0; i < aircraft.planningList.length; ++i) {
                        const trip = aircraft.planningList[i];
                        const remaining = routeMap[trip.lineId].remaining[(trip.takeOffTime / 86400) | 0];
                        remaining.eco -= aircraft.seatsEco * 2;
                        remaining.bus -= aircraft.seatsBus * 2;
                        remaining.first -= aircraft.seatsFirst * 2;
                        remaining.cargo -= aircraft.payloadUsed * 2;
                    }

                    aircraftMap[aircraft.id] = aircraft;
                }

                const flightParameters = JSON.parse(
                    networkIFrame
                        .contents()
                        .find("#jsonAirlineFlightParameters")
                        .text()
                );

                resolve({
                    aircraftList,
                    routeList,
                    aircraftMap,
                    routeMap,
                    flightParameters
                });
            });
            $("html").append(networkIFrame);
        });
    }

    async function loadSimulationResult(lineId, priceEco, priceBus, priceFirst, priceCargo) {
        const [ECO, BUS, FIRST, CARGO] = [0, 1, 2, 3];
        return $.post(`/marketing/pricing/priceSimulation/${lineId}`, {
            priceEco,
            priceBus,
            priceFirst,
            priceCargo
        }).then(function(result) {
            const data = JSON.parse(result);
            if (data.errorCode != 0) {
                throw new Error(data.notifyMessage);
            }

            data[ECO] = {
                pax: data.paxEcoValue,
                paxLeft: data.paxLeftEcoValue,
                turnover: getIntFromString(data.caEcoValue)
            };
            data[BUS] = {
                pax: data.paxBusValue,
                paxLeft: data.paxLeftBusValue,
                turnover: getIntFromString(data.caBusValue)
            };
            data[FIRST] = {
                pax: data.paxFirstValue,
                paxLeft: data.paxLeftFirstValue,
                turnover: getIntFromString(data.caFirstValue)
            };
            data[CARGO] = {
                pax: data.paxCargoValue,
                paxLeft: data.paxLeftCargoValue,
                turnover: getIntFromString(data.caCargoValue)
            };

            return data;
        });
    }
    // ========================================================

    // ===================== UTILS ============================
    function assert(predicate) {
        if (!predicate) {
            console.error(`Assert failed`);
            throw new Error();
        }
    }

    async function wait(predicate, interval, maxRetries) {
        return new Promise(function(resolve, reject) {
            let tries = 0;
            const pollHandle = setInterval(function() {
                if (++tries > maxRetries) {
                    clearInterval(pollHandle);
                    reject();
                    return;
                }

                if (predicate()) {
                    clearInterval(pollHandle);
                    resolve();
                }
            }, interval);
        });
    }

    function calculateFlightTime(distance, speed, flightParameters) {
        const airTime = Math.ceil(distance * 2 / speed * 4) * 15;
        const logisticTime =
            (flightParameters.boardingTime * 2 + flightParameters.landingTime * 2 + flightParameters.transitionTime) /
            60;
        return airTime + logisticTime;
    }

    async function sleep(msec) {
        return new Promise(function(resolve) {
            setTimeout(resolve, msec);
        });
    }

    function getIntFromString(str) {
        return parseInt(str.replace(/[^0-9]/g, ""));
    }

    function getIntFromElement(element) {
        return getIntFromString(element.text());
    }
    // ========================================================

    console.log(`===== AM2 Assist ${VERSION} =====`);
    for (const k in modules) {
        if (pageUrl.match(new RegExp(k))) {
            for (const funcPair of modules[k]) {
                console.log(`Running module: ${funcPair[1]} (Pattern: ${k})`);
                funcPair[0](k);
            }
        }
    }
})();
