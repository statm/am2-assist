import { Plugin } from '../plugin';
import { assert, isAMPlus } from '../utils';
import { PAGE_URL } from '../constants';
import { AIRCRAFT_TABLE } from '../data/aircraftTable';
import { AircraftInfo } from '../typings';

const isRentalPage = PAGE_URL.includes('aircraft/rental');

class AirCraftInfo {
    public isCargo: boolean;
    public isLease: boolean;
    public type: string;
    public name: JQuery<HTMLElement>;
    public categoryIcon: string;
    public hubName: string;
    public hubFlag: string;
    public range: string;
    public use: string;
    public cargo: string;
    public seats: string;
    public flightResults: string;
    public wear: string;
    public age: string;
    public detailsUrl: string;
    public avatarUrl: string;
    public aircraftId: string;

    // Lease-only
    public securityDeposit: string;
    public leaseCost: string;
    public debitDate: string;
    public dueDate: JQuery<HTMLElement>;
    public endLeaseButton: JQuery<HTMLElement>;
}

function extractInfo(): Array<AirCraftInfo> {
    const result: Array<AirCraftInfo> = [];
    const aircraftBoxes = $('div.aircraftListBox');
    aircraftBoxes.each(function () {
        const box = $(this);
        const info = new AirCraftInfo();

        info.isCargo = box.find('div.title span.greenBtn:contains("Cargo"), div.title span.cargoBtn:contains("Cargo")').length === 1;
        info.isLease = box.find('div.title span.greenBtn:contains("Lease")').length === 1;
        info.type = box.find('div.title span.editAircraftName').get(0).previousSibling!.nodeValue!.trim();
        info.name = box.find('div.title span.editAircraftName');
        info.categoryIcon = box.find('div.title img').get(0).outerHTML;
        info.detailsUrl = box.find('div.title a:not(.useAjax)').attr('href')!;
        info.aircraftId = info.detailsUrl.split('/')[3];

        if (!isRentalPage) {
            info.range = box.find('span.listBoxInfo:eq(0) b').text();
            info.use = box.find('span.listBoxInfo:eq(1) b').text();
            info.cargo = box.find('span.listBoxInfo:eq(2) b').text();
            info.seats = box.find('span.listBoxInfo:eq(3) b').text().split(' ')[0];
            info.hubName = box.find('span.listBoxInfo:eq(4) b').text();
            info.hubFlag = box.find('span.listBoxInfo:eq(4) img').get(0).outerHTML;
            info.flightResults = box.find('span.listBoxInfo:eq(5) b').text().trim();
            info.wear = box.find('span.listBoxInfo:eq(6) span').text().trim();
            info.age = box.find('span.listBoxInfo:eq(7) b').text();
            info.avatarUrl = box.find('img.mini-aircraft').attr('data-big')!;
        } else {
            info.securityDeposit = box.find('span.listBoxInfo:eq(0) b').text();
            info.leaseCost = box.find('span.listBoxInfo:eq(1) b').text();
            info.flightResults = box.find('span.listBoxInfo:eq(2) b').text().trim();
            info.hubName = box.find('span.listBoxInfo:eq(3) b').text();
            info.hubFlag = box.find('span.listBoxInfo:eq(3) img').get(0).outerHTML;
            info.wear = box.find('span.listBoxInfo:eq(4) b').text().trim();
            info.age = box.find('span.listBoxInfo:eq(5) b').text();
            info.debitDate = box.find('span.listBoxInfo:eq(6) b').text().trim();
            info.dueDate = box.find('span.listBoxInfo:eq(7) select');
            info.endLeaseButton = box.find('div.title a.useAjax');
        }

        result.push(info);
    });
    return result;
}

function addCssClass() {
    const style = $(`
        <style type="text/css">
            .BtnDetailAvionProSell {
                position: relative;
                display: inline-block;
                width: 20px;
                height: 20px;
                top: 7px;
                background: url(/images/icons30/aircraft_sell.png) 0 0 no-repeat;
                background-size: cover;
                z-index: 1;
                text-decoration: none;
                float: right;
            }
        </style>
    `);
    style.appendTo('head');
}

async function extractToken(aircraftId: string) {
    const sellResp = await fetch(`/aircraft/show/${aircraftId}/sell`);
    if (sellResp.status !== 200) {
        return undefined;
    }
    const sellPageHtml = await sellResp.text();
    const pricePage = $($.parseHTML(sellPageHtml));
    const token = pricePage.find('#form__token');
    if (token.length === 0) {
        return undefined;
    } else {
        assert(token.length === 1);
        assert(token.attr('value'));
        return token.attr('value');
    }
}

async function sellAircraft(aircraftId: string) {
    const token = await extractToken(aircraftId);
    if (!token) {
        return;
    }

    const sellAircraftFormData = new FormData();
    sellAircraftFormData.append('form[_token]', token);

    const priceUpdateResp = await fetch(`/aircraft/show/${aircraftId}/sell`, { method: 'POST', body: sellAircraftFormData });
    if (priceUpdateResp.status !== 200) {
        updateStatus(aircraftId, false);
    } else {
        updateStatus(aircraftId, true);
    }
}

function updateStatus(aircraftId: string, successful: boolean) {
    let line;
    if (successful) {
        line = $(`<td><b style="color: red">Sold</b><td>`);
    } else {
        line = $(`<td><b style="color: red">Failed</b><td>`);
    }
    const position = $(`#${aircraftId}`).parent();
    line.insertAfter(position);
}

async function retiredStaff() {
    const url = '/staff/automatic-retire/aircraft';
    await fetch(url, { method: 'GET'});
}

function constructTable(list: Array<AirCraftInfo>): JQuery<HTMLElement> {
    const result = $(`
        <table class="aircraftListViewTable">
            <tbody>
                <tr>
                    <th class="tableString"><span class="greenBtn">Aircraft</span></th>
                    <th><span class="blueBtn">Hub</span></th>
                    ${isRentalPage ? `
                        <th><span class="blueBtn">Security deposit</span></th>
                        <th><span class="blueBtn">Lease cost</span></th>
                        <th><span class="blueBtn">Wear</span></th>
                        <th><span class="blueBtn">Age</span></th>
                        <th><span class="blueBtn">Flight results</span></th>
                        <th><span class="blueBtn" title="Debit">Debit</span></th>
                        <th><span class="blueBtn">Due date</span></th>
                        <th>&nbsp;</th>
                        <th>&nbsp;</th>
                    ` : `
                        <th><span class="blueBtn">Range</span></th>
                        <th><span class="blueBtn">Use</span></th>
                        <th><span class="blueBtn">Wear</span></th>
                        <th><span class="blueBtn">Age</span></th>
                        <th><span class="blueBtn">Seats</span></th>
                        <th colspan="2"><span class="blueBtn" title="Over 7 days">Flight results</span></th>
                    `}
                </tr>
            </tbody>
        </table>
    `);
    const tableBody = result.find('tbody');
    list.forEach((info: AirCraftInfo) => {
        const row = $(isRentalPage ? `
            <tr>
                <td class="tableString" id="aircraft${info.aircraftId}">
                    <b>${info.type} </b>
                </td>
                <td><b>${info.hubName} / ${info.hubFlag}</b></td>
                <td><b>${info.securityDeposit}</b></td>
                <td><b>${info.leaseCost}</b></td>
                <td><b><span>${info.wear}</span></b></td>
                <td><b>${info.age}</b></td>
                <td><b>${info.flightResults}</b></td>
                <td><b>${info.debitDate}</b></td>
                <td></td>
                <td><a class="BtnDetailAvionPro" href="${info.detailsUrl}" title="Aircraft details">&nbsp;</a></td>
                <td><a class="BtnDetailAvionProSell" id="${info.aircraftId}" href="#" title="Sell Aircraft">&nbsp;</a></td>
                <td></td>
            </tr>
        ` : `
            <tr>
                <td class="tableString" id="aircraft${info.aircraftId}">
                    <b>
                        <img class="zoomAircraft" data-aircraftimg="${info.avatarUrl}" src="/images/icons/picto_zoom.png?v1.6.11">
                        ${info.categoryIcon}
                        ${info.type}
                    </b>
                </td>
                <td><b>${info.hubName} / ${info.hubFlag}</b></td>
                <td><b>${info.range}</b></td>
                <td><b>${info.use}</b></td>
                <td><b><span>${info.wear}</span></b></td>
                <td><b>${info.age}</b></td>
                <td><b>${info.seats} Pax / ${info.cargo} </b></td>
                <td>${info.flightResults}</td>
                <td><a class="BtnDetailAvionPro" href="${info.detailsUrl}" title="Aircraft details">&nbsp;</a></td>
                <td><a class="BtnDetailAvionProSell" id="${info.aircraftId}" href="#" title="Sell aircraft">&nbsp;</a></td>
            </tr>
        `);

        const nameCell = row.find('td.tableString b');
        nameCell.append(info.name);
        if (info.isCargo && !isRentalPage) {
            nameCell.append(document.createTextNode(' '));
            nameCell.append('<span class="greenBtn">c</span>');
        }
        if (info.isLease) {
            nameCell.append(document.createTextNode(' '));
            nameCell.append('<span class="greenBtn">L</span>');
        }

        if (isRentalPage) {
            row.find('td:eq(8)').append(info.dueDate);
            row.find('td:eq(10)').append(info.endLeaseButton);
        }

        tableBody.append(row);
    });

    // Re-apply tooltip and avatar display
    result.find('[title]').tooltip({
        position: {
            my: 'center center',
            at: 'center top-10'
        }
    });
    result.find('img.zoomAircraft').hover(function (event) {
        const src = $(this).data('aircraftimg');
        if (!$(this).parents('table').find('.zoom-aircraft').length) {
            $(this).parents('table').prepend(`<img class="zoom-aircraft" src="${src}" style="position:absolute;top:${event.pageY - 65}px;left:${event.pageX + 150}px;" />`);
        }
    }, function () {
        $('.zoom-aircraft').remove();
    });

    return result;
}

function addCapacityInfo() {
    $('table.aircraftListViewTable th:eq(6) span').text('Seats (Cap)');
    $('table.aircraftListViewTable tbody tr:not(:first-child)').each(function() {
        const row = $(this);
        const seatBox = row.find('td:eq(6) b');
        const aircraftTypeName = row.find('td.tableString b span.editAircraftName').get(0).previousSibling!.nodeValue!.replace('/', '').trim();

        // Update seat number box
        let updatedText = seatBox.text();
        const aircraftData = AIRCRAFT_TABLE.find((data: AircraftInfo) => data.name === aircraftTypeName );
        if (aircraftData !== undefined) {
            updatedText += ` (${aircraftData.seats})`;
        }
        seatBox.text(updatedText);
    });
}

export const aircraftListProDisplay: Plugin = {
    name: 'AIRCRAFT LIST PRO DISPLAY',
    urlPatterns: ['aircraft[^/]*', 'aircraft/rental[^/]*'],
    action: async function () {
        const tableCount = $('.aircraftListViewTable').length;
        assert(tableCount === 0 || tableCount === 1);
        const isInProDisplay = tableCount === 1;

        // Construct and display pro table
        if (!isInProDisplay) {
            const aircraftListInfo = extractInfo();
            const proDisplayTable = constructTable(aircraftListInfo);
            $('div.aircraftListView').empty().prepend(proDisplayTable);
        }

        // Add capacity data
        if (!isRentalPage) {
            addCapacityInfo();
        }

        // Remove view switch button
        if (await isAMPlus()) {
            if (isInProDisplay) {
                $('img#displayMode').parent().remove();
            }
        } else {
            $('a#displayMode').remove();
            $('div#popupAmPlusSubscribe').remove();
        }

        // UI tweaks
        addCssClass();
        $('div.hubFilterBox').css('margin-bottom', 0);
        $('div.aircraftListView').css('margin-top', 0);
        $('div.cleaner').remove();

        $('.BtnDetailAvionProSell').click(function() {
            console.log('Sell Aircraft Button Clicked');
            const aircraftId = $(this).attr('id');
            if (aircraftId) {
                sellAircraft(aircraftId);
                retiredStaff();
            }
            return false;
        });
    }
};
