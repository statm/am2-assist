// ==UserScript==
// @name         AM2 Assist
// @namespace    http://tampermonkey.net/
// @version      0.6.8
// @description  Airlines Manager 2 Assist
// @author       statm
// @contributor  henryzhou
// @contributor  jiak94
// @license      MIT
// @match        http://www.airlines-manager.com/*
// @match        https://www.airlines-manager.com/*
// @grant        none
// @updateURL    https://github.com/statm/am2-assist/raw/master/AM2_Assist.user.js
// ==/UserScript==

(function() {
    "use strict";

    const VERSION = "0.6.7";
    const ROOT_URL = /http(s)?:\/\/www.airlines-manager.com\//;
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
    define(["company/cockpitasous"], function() {
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
            $.get("cockpitasous/play", function(resp) {
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
	
	/* UNFOLD AGENDA */
    define(["home.*"], function() {
        $('.li_puce').css('display', 'none');
        $('.objectifDetails').css('display', 'block');
        $('.validBtn').css('display', 'none');
        $('.objectifDetails > .li_puce').css('display', 'block');
    }, "UNFOLD AGENDA");

    /* SKIP LOADING SCREEN */
    define(["home/loading"], function() {
        window.location = "/home";
    }, "SKIP LOADING SCREEN");

    /* STAR PROGRESS BAR */
    define(["home.*"], async function() {
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

        const reconfigBox = $(`<div id="reconfigBox"><div style="line-height:290px;text-align:center"><img src="//goo.gl/aFrC17" width="20"><span style="vertical-align:middle;margin-left:3px;color:#585d69">Loading...</span></div></div>`);
        const ownAircraftMatch = pageUrl.match(/aircraft\/show\/([0-9]+)\/reconfigure/);
        if (!ownAircraftMatch) {
            reconfigBox.css({ height: "300px", "margin-top": "70px" });
        }
        $("#box2").after(reconfigBox);

        const networkData = await loadNetworkData();

        const displayRelevantRoutes = function() {
            let currentAircraftSpeed;
            let currentAircraftRange;
            let currentAircraftCategory;
            let currentAircraftLocation;

            if (ownAircraftMatch) {
                const currentAircraftId = ownAircraftMatch[1];
                currentAircraftSpeed = networkData.aircraftMap[currentAircraftId].speed;
                currentAircraftRange = networkData.aircraftMap[currentAircraftId].range;
                currentAircraftCategory = networkData.aircraftMap[currentAircraftId].category;
                currentAircraftLocation = $(".aircraftMainInfo span:eq(2)").text().replace(" /", "");
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
                currentAircraftLocation = $("#aircraft_hub option:selected").text().split(" - ")[0];
            }

            const possibleRoutes = networkData.routeList
                .filter(route => route.distance <= currentAircraftRange && route.category >= currentAircraftCategory && route.name.startsWith(currentAircraftLocation))
                .sort((r1, r2) => r2.distance - r1.distance);

            reconfigBox.empty();
            if (possibleRoutes.length == 0) {
                reconfigBox.html(`<div style="line-height:290px;text-align:center"><span style="vertical-align:middle;margin-left:3px;color:#585d69">No routes available</span></div>`);
            }
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
            reconfigBox.scrollTop(0);
        };

        displayRelevantRoutes();
        $("#aircraft_hub").change(displayRelevantRoutes);

    }, "RECONFIGURATION ASSIST");

    /* MAXIMIZE LOAN AMOUNT (FM) */
    define(["finances/bank/[0-9]+/stockMarket/request"], function() {
        $("#request_amount").val($("#request_amount").attr("data-amount"));
    }, "MAXIMIZE LOAN AMOUNT (FM)");

    /* MAXIMIZE LOAN AMOUNT (EXPRESS) */
    define(["finances/bank/loan/[0-9]+/express"], function() {
        $("#form_amount").val(getIntFromElement($("#loanExplanation div:nth-child(1) span")));
    }, "MAXIMIZE LOAN AMOUNT (EXPRESS)");

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

    /* AIRCRAFT LIST STICKY HEADER */
    define(["aircraft/buy/rental/[^/]+", "aircraft/buy/new/[0-9]+/[^/]+"], function() {
        const filterAndWitnessBox = $(
            `<div id='filterAndWitnessBox' style='position: sticky; top: 0; z-index: 1; background: url(/images/interface/purchaseContainerMiddle_bg.png) -20px 0 repeat-y;'></div>`
        );
        $(".filterBox").before(filterAndWitnessBox);
        $(".filterBox, .witnessLine").appendTo(filterAndWitnessBox);
    }, "AIRCRAFT LIST STICKY HEADER");

    /* DUPERSIM */
    define(["marketing/pricing/[0-9]+"], function() {
        const SPINNER = `<img src="//goo.gl/aFrC17" width="20">`;

        const simulationCostBox = $(".demandSimulation > p:first-of-type");
        if (simulationCostBox.length != 1) {
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
        `).appendTo("head");

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
        `).appendTo(".secretaryBox");

        const resetUI = function() {
            $("#duperSimTable").remove();
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
            `).appendTo("#duperSimBox");

            $("#duperSimTable thead, #duperSimTable tbody tr, #duperSimErrorBox").hide();
        };
        resetUI();

        const showError = function(message) {
            $("#duperSimErrorMessage").text(message);
            $("#duperSimErrorBox").show();
            $("#duperSimErrorBox")[0].scrollIntoView({ behavior: "smooth" });
        };

        $("#duperSimButton").click(async function() {
            const STEP_RATIO = 0.12;
            const PAX_EPSILON = 3;
            const COOLDOWN = 5000;
            const ANIMATION_SPEED = 800;
            const [ECO, BUS, FIRST, CARGO] = [0, 1, 2, 3];
            const [L2, L1, R1, R2] = [0, 1, 2, 3];

            const lineId = $("input#lineId").val();

            if ($(".box1 div.price:contains('Ideal')").length == 0) {
                showError("You must perform an audit before DUPER Sim.");
                return;
            }

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

            // ui reset
            resetUI();

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
                    showError("Audit info is too outdated.");
                    return;
                }

                if (sim[L1][seat].pax <= 0 || sim[R1][seat].pax <= 0) {
                    showError("Zero pax encountered.");
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

            for (const seat of [ECO, BUS, FIRST]) {
                if (sim[L2][seat].pax <= 0 || sim[R2][seat].pax <= 0) {
                    showError("Zero pax encountered.");
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

    /* TC RATE DISPLAY */
    define(["shop/workshop"], function() {
        $(`<style type='text/css'>
            .tcRate { font-weight: normal }
           </style>
        `).appendTo("head");
        const rackLabels = $(".rackLabel");
        rackLabels.each(function() {
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
    }, "TC RATE DISPLAY");

    /* ROUTE FILTERING */
    define(["network/newLine/[0-9]+/[a-z]+"], function() {
        $(`<label><input type="checkbox" id="toggleRouteFiltering" style="margin-right:4px;vertical-align:middle">Filter unavailable routes</label>`).appendTo(".filterBox1");
        $(".otherTools").removeAttr("data-title");
        $("#toggleRouteFiltering, #aircraftListSelect").change(function() {
            $(".hubListBox").each(function() {
                if ($(this).hasClass("disabled") && $("#toggleRouteFiltering").prop("checked")) {
                    $(this).hide();
                } else {
                    $(this).show();
                }
            })
        });
    }, "ROUTE FILTERING");

    /* ROUTE LIST STICKY HEADER */
    define(["network/newLine/[0-9]+/[a-z]+"], function() {
        $(".mainFilterBox").css({ position: "sticky", top: 0, "z-index": 1, "background-color": "#565a66", "padding-top": "10px", "padding-bottom": "10px" });
    }, "ROUTE LIST STICKY HEADER");

    /* AUDIT PRICE APPLYING */
    define(["marketing/pricing/[0-9]+(\\?.*)?"], function() {
        if ($(".box1").length == 0) {
            // No audit result
            return;
        }

        assert($("a.marketing_PriceLink").length == 1);
        $(`<a id="applyIdealPricesButton" class="gradientButton gradientButtonYellow" style="float:right;cursor:pointer;user-select:none">
            <img src="//goo.gl/Tpw577" width="28" height="28">
            <span>Apply ideal prices</span>
        </a>`).insertBefore("a.marketing_PriceLink");
        $("#applyIdealPricesButton, a.marketing_PriceLink").wrapAll(`<div/>`);

        $("#applyIdealPricesButton").click(function() {
            if (!$(".reliability0").text().startsWith("Recent")) {
                if (!confirm("Audit result is not up to date, continue?")) {
                    return;
                }
            }

            assert($(".box1 .price b").length == 4);
            $("#line_priceEco").val(getIntFromString($(".box1 .price b")[0].innerText));
            $("#line_priceBus").val(getIntFromString($(".box1 .price b")[1].innerText));
            $("#line_priceFirst").val(getIntFromString($(".box1 .price b")[2].innerText));
            $("#line_priceCargo").val(getIntFromString($(".box1 .price b")[3].innerText));

            $("form.submitButton input[type=submit]").click();
        });
    }, "AUDIT PRICE APPLYING");

    /* AUDIT LIST ENHANCEMENT */
    define(["marketing/internalAudit/lineList(\\?.*)?"], function() {
        $("td.reliability").next().each(function() {
            const pricingUrl = $(this).find("a").attr("href").replace("internalAudit", "pricing");
            
            const pricingLink = $(`<a href="${pricingUrl}">
                                    <img class="auditIcon" src="/images/icons30/marketing_globalPricing.png?v1.6.11" width="20" height="20" title="Pricing details">
                                </a>`);
            pricingLink.tooltip({ position: { of: pricingLink, my: "bottom", at: "top-3px" } });
            $(this).css({ width: "55px" }).append(pricingLink);
        });
    }, "AUDIT LIST ENHANCEMENT");
    // ========================================================

    // ======================== AJAX ==========================
    function loadStructralProfit(companyName) {
        return $.get(`/company/ranking/?searchTerm=${companyName}`).then(function(data) {
            const rankingBox = $($.parseHTML(data)).find(`div.box1:contains("${companyName}") .underBox4`);
            if (rankingBox.length == 0) {
                return;
            }
            return getIntFromElement(rankingBox);
        });
    }

    function loadNetworkData() {
        return new Promise(function(resolve) {
            const networkIFrame = $(
                "<iframe src='/network/planning' width='0' height='0'/>"
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

    function loadSimulationResult(lineId, priceEco, priceBus, priceFirst, priceCargo) {
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

    function wait(predicate, interval, maxRetries) {
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

    function sleep(msec) {
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

    function getAircraftInfo(name) {
        for (const aircraft of AIRCRAFT_INFO) {
            if (aircraft.name == name) {
                return aircraft;
            }
        }
    }
    // ========================================================

    // ====================== DATA ============================
    const AIRCRAFT_INFO = [
        { id: 1, name: "A310-300", category: 6, speed: 850, range: 9630, price: 157300000, seats: 275, payload: 27.5 },
        { id: 2, name: "A330-300", category: 7, speed: 871, range: 10804, price: 239400000, seats: 440, payload: 45.9 },
        { id: 3, name: "757-200", category: 5, speed: 850, range: 7593, price: 111600000, seats: 239, payload: 26.7 },
        { id: 4, name: "787-8", category: 8, speed: 911, range: 15196, price: 206800000, seats: 381, payload: 43.3 },
        { id: 5, name: "777-200", category: 6, speed: 892, range: 9710, price: 238600000, seats: 440, payload: 57.4 },
        { id: 6, name: "A319-100LR", category: 4, speed: 828, range: 9250, price: 85800000, seats: 160, payload: 16 },
        { id: 7, name: "737-700ER", category: 5, speed: 834, range: 9080, price: 81300000, seats: 149, payload: 17 },
        { id: 8, name: "A330-200", category: 7, speed: 871, range: 13435, price: 216100000, seats: 406, payload: 40.6 },
        { id: 9, name: "767-200ER", category: 6, speed: 850, range: 11832, price: 160200000, seats: 290, payload: 35.6 },
        { id: 10, name: "767-300ER", category: 7, speed: 850, range: 11100, price: 182800000, seats: 351, payload: 43.8 },
        { id: 11, name: "767-400ER", category: 9, speed: 850, range: 10424, price: 200800000, seats: 375, payload: 46.5 },
        { id: 12, name: "A340-300", category: 8, speed: 871, range: 13704, price: 254600000, seats: 440, payload: 44 },
        { id: 13, name: "A340-500", category: 9, speed: 881, range: 16678, price: 280100000, seats: 475, payload: 47.5 },
        { id: 14, name: "777-200ER", category: 8, speed: 892, range: 14315, price: 258800000, seats: 440, payload: 59.4 },
        { id: 15, name: "777-200LR", category: 8, speed: 892, range: 17512, price: 291200000, seats: 440, payload: 64 },
        { id: 16, name: "A340-600", category: 9, speed: 881, range: 14640, price: 294600000, seats: 530, payload: 55.6 },
        { id: 17, name: "777-300", category: 9, speed: 892, range: 11119, price: 284700000, seats: 550, payload: 66.9 },
        { id: 18, name: "777-300ER", category: 8, speed: 892, range: 14695, price: 315000000, seats: 550, payload: 69.9 },
        { id: 19, name: "A380-800", category: 8, speed: 903, range: 15556, price: 403000000, seats: 853, payload: 89.2 },
        { id: 20, name: "747-400", category: 8, speed: 903, range: 13454, price: 296300000, seats: 660, payload: 67.5 },
        { id: 21, name: "747-8I", category: 9, speed: 911, range: 14825, price: 352800000, seats: 730, payload: 76 },
        { id: 22, name: "SSJ-100-95", category: 4, speed: 828, range: 4578, price: 42500000, seats: 98, payload: 12.2 },
        { id: 23, name: "ERJ-175", category: 3, speed: 828, range: 3706, price: 37000000, seats: 88, payload: 10.4 },
        { id: 24, name: "A320-200", category: 5, speed: 828, range: 6111, price: 91500000, seats: 180, payload: 18.3 },
        { id: 25, name: "MD-83", category: 6, speed: 807, range: 4637, price: 85500000, seats: 167, payload: 19.2 },
        { id: 26, name: "737-500", category: 6, speed: 786, range: 4725, price: 64200000, seats: 132, payload: 15.2 },
        { id: 27, name: "737-600", category: 4, speed: 834, range: 5976, price: 64000000, seats: 132, payload: 15.6 },
        { id: 28, name: "ERJ-145XR", category: 5, speed: 850, range: 3706, price: 25500000, seats: 50, payload: 6 },
        { id: 29, name: "A318-100", category: 3, speed: 828, range: 6019, price: 70100000, seats: 136, payload: 13.6 },
        { id: 30, name: "737-300", category: 5, speed: 786, range: 4540, price: 73300000, seats: 149, payload: 16.1 },
        { id: 31, name: "737-700", category: 3, speed: 834, range: 6374, price: 74800000, seats: 149, payload: 17.5 },
        { id: 32, name: "ERJ-170", category: 3, speed: 828, range: 3891, price: 33500000, seats: 80, payload: 9.8 },
        { id: 33, name: "MD-90-30", category: 5, speed: 807, range: 3861, price: 84400000, seats: 167, payload: 19 },
        { id: 34, name: "ERJ-190", category: 5, speed: 828, range: 4447, price: 46500000, seats: 114, payload: 13.1 },
        { id: 35, name: "A319-100", category: 4, speed: 828, range: 7130, price: 83600000, seats: 160, payload: 16 },
        { id: 36, name: "737-400", category: 6, speed: 786, range: 3891, price: 81000000, seats: 189, payload: 19.9 },
        { id: 37, name: "737-800", category: 6, speed: 834, range: 5772, price: 89100000, seats: 189, payload: 21.3 },
        { id: 38, name: "ERJ-195", category: 5, speed: 828, range: 4077, price: 49000000, seats: 124, payload: 13.6 },
        { id: 39, name: "A321-200", category: 5, speed: 828, range: 5950, price: 107300000, seats: 220, payload: 22 },
        { id: 40, name: "737-900ER", category: 6, speed: 834, range: 6050, price: 94600000, seats: 220, payload: 23 },
        { id: 41, name: "A300-600R", category: 4, speed: 850, range: 7540, price: 197900000, seats: 360, payload: 36 },
        { id: 42, name: "EMB-120", category: 2, speed: 552, range: 2555, price: 10700000, seats: 30, payload: 3.3 },
        { id: 43, name: "S-340B", category: 1, speed: 467, range: 1735, price: 12800000, seats: 37, payload: 3.7 },
        { id: 44, name: "42-500", category: 1, speed: 540, range: 1555, price: 16000000, seats: 50, payload: 5.4 },
        { id: 45, name: "Q-400", category: 2, speed: 667, range: 2400, price: 26500000, seats: 80, payload: 8.5 },
        { id: 46, name: "Q-200", category: 1, speed: 537, range: 1796, price: 13000000, seats: 40, payload: 4.6 },
        { id: 47, name: "Jetstream-41", category: 1, speed: 547, range: 1433, price: 10500000, seats: 30, payload: 3.5 },
        { id: 48, name: "ERJ-135", category: 4, speed: 828, range: 3243, price: 18500000, seats: 37, payload: 4.5 },
        { id: 49, name: "Q-300", category: 1, speed: 537, range: 2274, price: 17000000, seats: 56, payload: 6.1 },
        { id: 50, name: "CRJ-200", category: 4, speed: 828, range: 3650, price: 23000000, seats: 50, payload: 6.1 },
        { id: 51, name: "ERJ-140", category: 4, speed: 828, range: 3057, price: 21500000, seats: 44, payload: 5.3 },
        { id: 52, name: "CRJ-700", category: 3, speed: 834, range: 3699, price: 33200000, seats: 78, payload: 8.5 },
        { id: 53, name: "CRJ-900", category: 4, speed: 850, range: 3407, price: 38200000, seats: 90, payload: 10.6 },
        { id: 54, name: "42-600", category: 1, speed: 540, range: 1629, price: 16400000, seats: 50, payload: 5.9 },
        { id: 55, name: "ERJ-145", category: 6, speed: 828, range: 2872, price: 24000000, seats: 50, payload: 5.8 },
        { id: 56, name: "CRJ-1000", category: 5, speed: 850, range: 3129, price: 43200000, seats: 104, payload: 12 },
        { id: 57, name: "72-500", category: 2, speed: 500, range: 1648, price: 22600000, seats: 74, payload: 7.5 },
        { id: 58, name: "72-600", category: 2, speed: 500, range: 1731, price: 23000000, seats: 74, payload: 8 },
        { id: 59, name: "717-200", category: 3, speed: 828, range: 3815, price: 56300000, seats: 134, payload: 14.5 },
        { id: 60, name: "RJ-85", category: 2, speed: 765, range: 2461, price: 56700000, seats: 118, payload: 11.8 },
        { id: 61, name: "B727-100", category: 4, speed: 890, range: 2659, price: 68000000, seats: 131, payload: 13.8 },
        { id: 62, name: "MD-11", category: 9, speed: 876, range: 12270, price: 232000000, seats: 410, payload: 52.6 },
        { id: 63, name: "Caravelle 12", category: 3, speed: 800, range: 1727, price: 64000000, seats: 130, payload: 13 },
        { id: 64, name: "Concorde", category: 10, speed: 2145, range: 6222, price: 250000000, seats: 128, payload: 12.8 },
        { id: 71, name: "A310-300F", category: 6, speed: 850, range: 7551, price: 141500000, seats: 0, payload: 37.3 },
        { id: 72, name: "42-500F", category: 1, speed: 540, range: 1555, price: 15500000, seats: 0, payload: 5.8 },
        { id: 73, name: "B737-700C", category: 7, speed: 834, range: 5333, price: 73500000, seats: 0, payload: 18.8 },
        { id: 74, name: "B747-400ERF", category: 10, speed: 903, range: 9204, price: 281200000, seats: 0, payload: 113.1 },
        { id: 77, name: "DC-3", category: 1, speed: 312, range: 2420, price: 7500000, seats: 32, payload: 3.2 },
        { id: 78, name: "EMB-120FC", category: 2, speed: 552, range: 2555, price: 11000000, seats: 0, payload: 3.7 },
        { id: 79, name: "S-340BF", category: 1, speed: 467, range: 1731, price: 12800000, seats: 0, payload: 3.4 },
        { id: 80, name: "T-214-220", category: 7, speed: 834, range: 5650, price: 85000000, seats: 0, payload: 25.2 },
        { id: 83, name: "757-200PF", category: 5, speed: 850, range: 5435, price: 109000000, seats: 0, payload: 32.8 },
        { id: 87, name: "72-500F", category: 2, speed: 500, range: 1648, price: 23000000, seats: 0, payload: 8.6 },
        { id: 89, name: "CRJ-200PF", category: 4, speed: 828, range: 3213, price: 22000000, seats: 0, payload: 6.1 },
        { id: 92, name: "A330-200F", category: 7, speed: 871, range: 7408, price: 203600000, seats: 0, payload: 65 },
        { id: 95, name: "MD-11CF", category: 9, speed: 876, range: 8415, price: 270000000, seats: 0, payload: 89.6 },
        { id: 96, name: "777-200F", category: 8, speed: 892, range: 9047, price: 295700000, seats: 0, payload: 102.9 },
        { id: 97, name: "Q400-PF", category: 2, speed: 667, range: 2075, price: 33000000, seats: 0, payload: 9.2 },
        { id: 98, name: "F-100", category: 3, speed: 755, range: 3167, price: 43000000, seats: 122, payload: 12.2 },
        { id: 99, name: "737-300SF", category: 6, speed: 786, range: 3028, price: 68500000, seats: 0, payload: 19.7 },
        { id: 100, name: "RJ-100QT", category: 3, speed: 765, range: 2130, price: 57000000, seats: 0, payload: 11.7 },
        { id: 101, name: "747-8F", category: 10, speed: 911, range: 8130, price: 352000000, seats: 0, payload: 134 },
        { id: 102, name: "767-300F", category: 8, speed: 850, range: 6028, price: 185000000, seats: 0, payload: 53.7 },
        { id: 105, name: "767-200F", category: 6, speed: 850, range: 6389, price: 163000000, seats: 0, payload: 43.1 },
        { id: 106, name: "A300-600RF", category: 6, speed: 828, range: 4852, price: 174500000, seats: 0, payload: 48.1 },
        { id: 109, name: "707-320C", category: 10, speed: 890, range: 9917, price: 125000000, seats: 219, payload: 34 },
        { id: 110, name: "787-9", category: 8, speed: 911, range: 15556, price: 249500000, seats: 420, payload: 42 },
        { id: 112, name: "A350-900XWB", category: 7, speed: 911, range: 15186, price: 295200000, seats: 475, payload: 47.5 },
        { id: 113, name: "747-100B", category: 6, speed: 907, range: 9815, price: 228500000, seats: 520, payload: 52 },
        { id: 114, name: "747-200B", category: 7, speed: 907, range: 13010, price: 265000000, seats: 595, payload: 68 },
        { id: 115, name: "747-200F", category: 9, speed: 907, range: 6695, price: 265000000, seats: 0, payload: 109 },
        { id: 116, name: "747-300", category: 6, speed: 916, range: 12400, price: 272500000, seats: 608, payload: 66 },
        { id: 117, name: "A320neo", category: 4, speed: 839, range: 6482, price: 107300000, seats: 195, payload: 19.65 },
        { id: 120, name: "DC8-73", category: 7, speed: 940, range: 10700, price: 105200000, seats: 259, payload: 26.373 },
        { id: 121, name: "DC8-73AF", category: 8, speed: 940, range: 4928, price: 105000000, seats: 0, payload: 50.71 },
        { id: 122, name: "DC8-55CF", category: 8, speed: 876, range: 4928, price: 77500000, seats: 0, payload: 43.79 },
        { id: 123, name: "DC8-55", category: 7, speed: 876, range: 10100, price: 77500000, seats: 189, payload: 20.467 },
        { id: 124, name: "757-300", category: 6, speed: 850, range: 6840, price: 135400000, seats: 295, payload: 31 },
        { id: 125, name: "TU-214-210", category: 5, speed: 850, range: 7300, price: 95500000, seats: 210, payload: 25.2 },
        { id: 129, name: "CS-100", category: 2, speed: 850, range: 5700, price: 71800000, seats: 133, payload: 15.1 },
        { id: 130, name: "CS-100-R", category: 1, speed: 850, range: 4075, price: 62000000, seats: 133, payload: 13.3 },
        { id: 131, name: "CS300", category: 4, speed: 850, range: 6100, price: 80380000, seats: 160, payload: 18.711 },
        { id: 132, name: "737-MAX8", category: 5, speed: 839, range: 5846, price: 110000000, seats: 189, payload: 18.9 },
        { id: 133, name: "A321neo", category: 5, speed: 839, range: 6644, price: 127000000, seats: 236, payload: 23.6 },
        { id: 134, name: "A350-1000", category: 8, speed: 911, range: 14750, price: 335000000, seats: 522, payload: 56.1 },
        { id: 135, name: "737-MAX9", category: 6, speed: 839, range: 5846, price: 116000000, seats: 210, payload: 22 },
        { id: 136, name: "787-10", category: 7, speed: 911, range: 10467, price: 257000000, seats: 440, payload: 44 }
    ];
    // ========================================================

    console.log(`===== AM2 Assist ${VERSION} =====`);
    for (const k in modules) {
        if (pageUrl.match(new RegExp(`^${k}$`))) {
            for (const funcPair of modules[k]) {
                console.log(`Running module: ${funcPair[1]} (Pattern: ${k})`);
                funcPair[0](k);
            }
        }
    }
})();
