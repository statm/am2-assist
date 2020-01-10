import { Plugin } from '../plugin';
import { getIntFromString, assert, sleep } from '../utils';
import { loadWorkshopInfo, WorkshopItem } from '../ajax/loadWorkshopInfo';

let isScanning = false;
let isClaiming = false;
let freeItems: Array<WorkshopItem> = [];

function addScanPanel() {
  $(`
        <style type="text/css">
            #wsScan { text-align: center }
            #wsControls { padding: 10px 0 }
            #wsControls button { font-size: 13px; margin-right: 7px }
            #wsControls button:focus { outline: 0 }
            #wsControls input { width: 45px; margin-left: 2px; margin-right: 7px }
            #wsResult { width: 400px; background-color: #fff; color: #000; margin: 0 auto 20px auto }
            #wsProgressBar { height: 7px; background-color: #eee }
            #wsProgressBarFill { height: 7px; background-color: #3ae }
            #wsResultTable { width: 100% }
            #wsResultTable thead { display: block; border }
            #wsResultTable tbody { display: block; overflow-y: scroll; min-height: 26px; max-height: 1000px }
            #wsResultTable tbody::-webkit-scrollbar { width: 10px }
            #wsResultTable tbody::-webkit-scrollbar-track { background-color: #f1f1f1 }
            #wsResultTable tbody::-webkit-scrollbar-thumb { background-color: #c1c1c1 }

            #wsResultTable thead tr { height: 22px; border-bottom: 1px solid #aaa; background-color: #eee }
            #wsResultTable thead th { vertical-align: middle; white-space: nowrap; border-right: 1px solid transparent; padding: 0 6px }
            #wsResultTable tbody td { vertical-align: middle; white-space: nowrap; border-right: 1px solid #eee; padding: 0 6px }
            #wsResultTable tbody tr:nth-child(even) { background-color: #f3fafe }
            #wsResultTable tbody tr { height: 26px }
            #wsResultTable .colStatus { min-width: 50px; padding-right: 9px }
            #wsResultTable .colId { min-width: 45px; text-align: center }
            #wsResultTable .colName { min-width: 150px }
            #wsResultTable .colPrice { min-width: 50px }
            #wsResultTable .colOptions { width: 100%; text-align: left; padding-left: 8px }
            #wsResultTable .freeItem { color: red }
        </style>
    `).appendTo('head');

  const scanPanel = $(`
        <div id="wsScan">
            <div id="wsControls">
                <label for="wsFromBox">From</label>
                <input id="wsFromBox">
                <label for="wsToBox">To</label>
                <input id="wsToBox">
                <button id="wsScanButton" type="button" class="validBtnBlue">Scan</button>
                <button id="wsClaimButton" type="button" class="validBtnBlue">Claim free items</button>
            </div>
            <div id="wsResult">
                <div id="wsProgressBar" style="display:none">
                    <div id="wsProgressBarFill" style="width:0%"></div>
                </div>
                <table id="wsResultTable">
                    <thead>
                        <tr>
                            <th class="colStatus"></th>
                            <th class="colId">ID</th>
                            <th class="colName">Item</th>
                            <th class="colPrice">Price</th>
                            <th class="colOptions"></th>
                        </tr>
                    </thead>
                    <tbody/>
                </table>
            </div>
        </div>
    `);
  scanPanel.insertBefore('div.workshop div.header');
  $('div.workshop div.header').remove();
}

async function scan() {
  const fromId = getIntFromString($('#wsFromBox').val() as string);
  const toId = getIntFromString($('#wsToBox').val() as string);
  assert(!isNaN(fromId) && !isNaN(toId) && fromId <= toId);

  if (isScanning || isClaiming) {
    return;
  }
  isScanning = true;
  freeItems = [];

  const progressBar = $('#wsProgressBar');
  const progressBarFill = $('#wsProgressBarFill');
  progressBar.slideDown();
  progressBarFill.width(0);

  const resultTable = $('#wsResultTable tbody');
  resultTable.empty();

  for await (const progress of loadWorkshopInfo(fromId, toId)) {
    const percentage = ((progress.id - fromId + 1) / (toId - fromId + 1)) * 100;
    progressBarFill.animate({ width: `${percentage}%` }, { duration: 'fast' });

    if (progress.item !== undefined) {
      const resultRow = $(`
                <tr${progress.item.price === 0 ? ' class="freeItem"' : ''}>
                    <td id="wsStatus${progress.item.id}" class="colStatus"></td>
                    <td class="colId">${progress.item.id}</td>
                    <td class="colName">${progress.item.name}</td>
                    <td class="colPrice">${progress.item.price.toLocaleString()}</td>
                    <td class="colOptions">
                        <a href="/shop/enablebonus/${progress.item.id}" target="_blank">
                            <img src="/images/interface/loupe.png?v1.6.11" title="Buy">
                        </a>
                    </td>
                </tr>
            `);
      resultRow.appendTo(resultTable);

      if (progress.item.price === 0) {
        freeItems.push(progress.item);
      }
    }
  }

  progressBar.delay(500).slideUp();
  isScanning = false;
}

async function claimItem(id: number) {
  const statusBox = $(`#wsStatus${id}`);

  try {
    const pageStr = await $.get(`/shop/enablebonus/${id}`);
    const page = $($.parseHTML(pageStr));
    const form = page.find('form');
    assert(form.length === 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const postObj: any = {};
    form.serializeArray().forEach(entry => (postObj[entry.name] = entry.value));

    await $.post(`/shop/enablebonus/${id}`, postObj);

    statusBox.empty().prepend($(`<img src="//i.imgur.com/5A3tGvf.png" width="14" height="14"/>`));
  } catch (e) {
    statusBox.empty().prepend($(`<img src="//i.imgur.com/9jIoF80.jpg" width="14" height="14"/>`));
  }
}

async function claim() {
  if (isScanning || isClaiming || freeItems.length === 0) {
    return;
  }
  isClaiming = true;

  for (const item of freeItems) {
    const statusBox = $(`#wsStatus${item.id}`);
    statusBox.empty().prepend($(`<img src="//i.imgur.com/pDMku5j.gif" width="16" height="16"/>`));
  }

  for (const item of freeItems) {
    await claimItem(item.id);
    await sleep(5000);
  }

  freeItems = [];
  isClaiming = false;
}

export const workshopScan: Plugin = {
  name: 'WORKSHOP SCAN',
  urlPatterns: ['shop/workshop[^/]*'],
  action: function() {
    addScanPanel();
    $('#wsToBox').on('keypress', function(e) {
      if (e.keyCode === 13) {
        scan();
        return false;
      }
    });
    $('#wsScanButton').on('click', scan);
    $('#wsClaimButton').on('click', claim);
  },
};
