// ==UserScript==
// @name        AM2 Assist (dev)
// @version     1.0.0
// @author      statm
// @description Airlines Manager 2 Assist (Dev Bootstrapper)
// @match       http://www.airlines-manager.com/*
// @match       https://www.airlines-manager.com/*
// @namespace   http://tampermonkey.net
// @contributor henryzhou
// @contributor jiak94
// @license     MIT
// ==/UserScript==

$.ajax({ url: 'http://localhost:8080/AM2_Assist.user.js', crossDomain: true });
