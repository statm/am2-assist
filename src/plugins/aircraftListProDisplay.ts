import { Plugin } from '../plugin';
import { assert, isAMPlus } from '../utils';
import { PAGE_URL } from '../constants';

const isRentalPage = PAGE_URL.includes('aircraft/rental');

function isInProDisplay(): boolean {
    const tableCount = $('.aircraftListViewTable').length;
    assert(tableCount === 0 || tableCount === 1);
    return tableCount === 1;
}

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
                <td class="tableString">
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
                <td></td>
            </tr>
        ` : `
            <tr>
                <td class="tableString">
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

export const aircraftListProDisplay: Plugin = {
    name: 'AIRCRAFT LIST PRO DISPLAY',
    urlPatterns: ['aircraft[^/]*', 'aircraft/rental[^/]*'],
    action: async function () {
        if (isInProDisplay()) {
            return;
        }

        const aircraftListInfo = extractInfo();
        console.log(aircraftListInfo);
        const proDisplayTable = constructTable(aircraftListInfo);
        $('div.aircraftListView').empty().prepend(proDisplayTable);

        if (!await isAMPlus()) {
            $('a#displayMode').remove();
            $('div#popupAmPlusSubscribe').remove();
        }
    }
};
