// ==UserScript==
// @name         AM2 Assist
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Airlines Manager 2 Assist
// @author       statm
// @match        http://www.airlines-manager.com/*
// @grant        none
// @updateURL    https://openuserjs.org/meta/statm/AM2_Assist.meta.js
// ==/UserScript==

(function() {
    "use strict";

    const ROOT_URL = "http://www.airlines-manager.com/";
    const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const pageUrl = window.location.href.replace(ROOT_URL, "");
    const modules = {};
    function define(urlPattern, func) {
        modules[urlPattern] = func;
    }

    // ================ PAGE MODULES ==========================
    /* SLOT MACHINE AUTOMATION */
    define("company/cockpitASous", function() {
        let playing = false;
        let gameCount = 0;
        let logText = "";
        const harvest = {};
        const harvestNames = {
            t: "Tickets",
            rd: "R$",
            d: "$",
            tr: "TC"
        };

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
            logArea.val(logText);
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
                    for (let t in harvest) {
                        log(`${harvestNames[t]}: ${harvest[t].toLocaleString()}\n`);
                    }
                } else {
                    setTimeout(play, 500);
                }
            });
        }
    });

    /* SKIP LOADING SCREEN */
    define("home/loading", function() {
        window.location = "/home";
    });

    /* STAR PROGRESS BAR */
    define("home", function() {
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
            $("#spProgress").attr("title", `$${spValue.toLocaleString()} / $${STAR_TABLE[stars].toLocaleString()}`);
            $("#spProgress").tooltip();

            $("#spProgressBar").attr("class", "progressbar");
            $("#spProgressBar > div").attr("class", "progressbarValue");
        });
    });

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

                    for (let i = 0; i < routeList.length; ++i) {
                        const route = routeList[i];

                        route.remaining = [];
                        for (let j = 0; j < 7; ++j) {
                            route.remaining.push({
                                eco: route.paxAttEco,
                                bus: route.paxAttBus,
                                first: route.paxAttFirst,
                                cargo: route.paxAttCargo
                            });
                        }

                        routeMap[route.id] = route;
                    }

                    for (let i = 0; i < aircraftList.length; ++i) {
                        const aircraft = aircraftList[i];

                        for (let j = 0; j < aircraft.planningList.length; ++j) {
                            const trip = aircraft.planningList[j];
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

    for (let k in modules) {
        if (pageUrl.match(new RegExp(k))) {
            console.log(`Module triggered: ${k}`);
            modules[k]();
            break;
        }
    }
})();
