// ==UserScript==
// @name         AM2 Assist
// @namespace    http://tampermonkey.net/
// @version      0.5.2
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

    const VERSION = "0.5.2";
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
                        data.gain.gainLabel = "R$ " + data.gain.gainLabel.substr(0, data.gain.gainLabel.length - 3);
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
    define(["home"], function() {
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

        loadStructralProfit(companyName).then(function(spValue) {
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
        });
    }, "STAR PROGRESS BAR");

    /* ENHANCE AIRCRAFT PROFIBILITY DETAIL */
    define(["aircraft/show/[0-9]", "aircraft/buy/new/[0-9]+/[^/]+/.*"], function() {
        
    }, "ENHANCE AIRCRAFT PROFIBILITY DETAIL");

    /* RECONFIGURATION ASSIST */
    define(["aircraft/show/[0-9]+/reconfigure", "aircraft/buy/new/[0-9]+/[^/]+/.*"], function() {
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

        loadNetworkData().then(function(data) {
            let currentAircraftSpeed;
            let currentAircraftRange;
            let currentAircraftCategory;
            let ownAircraftMatch = pageUrl.match(/aircraft\/show\/([0-9]+)\/reconfigure/);

            if (ownAircraftMatch) {
                const currentAircraftId = ownAircraftMatch[1];
                currentAircraftSpeed = data.aircraftMap[currentAircraftId].speed;
                currentAircraftRange = data.aircraftMap[currentAircraftId].range;
                currentAircraftCategory = data.aircraftMap[currentAircraftId].category;
            } else {
                const aircraftPurchaseBox = $(".aircraftPurchaseBox");
                currentAircraftSpeed = parseInt(
                    aircraftPurchaseBox
                        .find("li:contains('Speed') b")
                        .text()
                        .replace(/[^0-9]/g, "")
                );
                currentAircraftRange = parseInt(
                    aircraftPurchaseBox
                        .find("li:contains('Range') b")
                        .text()
                        .replace(/[^0-9]/g, "")
                );
                currentAircraftCategory = parseInt(
                    aircraftPurchaseBox
                        .find(".title img")
                        .attr("alt")
                        .replace("cat", "")
                );
                reconfigBox.css({ height: "300px", "margin-top": "70px" });
            }

            const possibleRoutes = data.routeList
                .filter(route => route.distance <= currentAircraftRange && route.category >= currentAircraftCategory)
                .sort((r1, r2) => r2.distance - r1.distance);

            possibleRoutes.forEach(route => {
                const flightTime = calculateFlightTime(route.distance, currentAircraftSpeed, data.flightParameters);
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
        });
    }, "RECONFIGURATION ASSIST");

    /* MAXIMIZE LOAN AMOUNT */
    define(["finances/bank/[0-9]+/stockMarket/request"], function() {
        $("#request_amount").val($("#request_amount").attr("data-amount"));
    }, "MAXIMIZE LOAN AMOUNT");

    /* PRICE PER SEAT */
    define(["aircraft/buy/rental/[^/]+", "aircraft/buy/new/[0-9]+/[^/]+"], function() {
        $(".aircraftPurchaseBox").each(function() {
            const paxBox = $(this).find("li:contains('Seats') b");
            if (paxBox.length == 0) {
                // cargo, pass through
                return;
            }
            assert(paxBox.length == 1);

            const numPax = parseInt(paxBox.text().replace(/[^0-9]/g, ""));
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
                const price = parseInt(priceBox.text().replace(/[^0-9]/g, "")) / aircraftQuantity;
                const pricePerSeatText = (price / numPax).toLocaleString(undefined, { maximumFractionDigits: 0 });
                pricePerPaxBox.html(`• Price per seat : <strong>${pricePerSeatText} $</strong>`);
            };

            new MutationObserver(updatePricePerPax).observe(priceBox[0], { childList: true });
            updatePricePerPax();
        });
    }, "PRICE PER SEAT");

    /* AIRCRAFT FILTERING */
    define(["aircraft/buy/rental/[^/]+", "aircraft/buy/new/[0-9]+/[^/]+"], function() {
        const filterUnavailableCheckBox = $(
            `<div>
                <h4>Filter unavailable aircrafts</h4>
                <input type="checkbox" id="toggleAircraftsDisplay">
            </div>
            `
        );
        $("form#aircraftFilterForm").append(filterUnavailableCheckBox);

        $("select#lineListSelect").change(function() {
            toggleAircraftAvailability($("input#toggleAircraftsDisplay").prop('checked'));
        });

        $("input#toggleAircraftsDisplay").click(function() {
            toggleAircraftAvailability($(this).prop('checked'));
        });

        function isFlightAvailable(aircraftPurchaseBox) {
            if (aircraftPurchaseBox.hasClass("disabled-research")) {
                // research is not unlocked
                return false;
            } else if (aircraftPurchaseBox.hasClass("disabled")) {
                // incapable to perform the flight due to milage
                return false;
            }
            return true;
        }

        function toggleAircraftAvailability(hideUnavailable) {
            $(".aircraftList").find(".aircraftPurchaseBox").each(function(){
                if (!isFlightAvailable($(this))) {
                    if (hideUnavailable) {
                        $(this).hide();
                    } else {
                        $(this).show();
                    }
                } else {
                    $(this).show();
                }
            });
        }
    }, "AIRCRAFT FILTERING");

    /* HYPERSIM */
    define(["marketing/pricing/[0-9]+"], function() {}, "HYPERSIM");
    // ========================================================

    // ================ DATA EXTRACTORS =======================
    function loadStructralProfit(companyName) {
        return $.get(`/company/ranking/?searchTerm=${companyName}`).then(function(data) {
            const rankingBox = $($.parseHTML(data))
                .find(`div.box1:contains("${companyName}") .underBox4`)
                .html();
            if (!rankingBox) {
                return;
            }
            return parseInt(rankingBox.replace(/[^0-9]/g, ""));
        });
    }

    function loadNetworkData() {
        return new Promise(function(resolve, reject) {
            const networkIFrame = $(
                "<iframe src='http://www.airlines-manager.com/network/planning' width='0' height='0'/>"
            );
            networkIFrame.load(function() {
                wait(() => networkIFrame[0].contentWindow.hasAlreadyRegroupedData, 100, 50).then(function() {
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
                }, reject);
            });
            $("html").append(networkIFrame);
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
