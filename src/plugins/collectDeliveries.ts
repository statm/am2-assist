import { Plugin } from '../plugin';
import { isAMPlus, sleep, assert } from '../utils';

function addButton() {
  const button = $(`
        <li class="amCoinsPurchase">
            <div>
                <a href="#" id="collectButton" class="validBtnBlue">
                    <div>
                        <p>Deliver All</p>
                    </div>
                </a>
            </div>
        </li>
    `);
  button.insertAfter('li.amCoinsPurchase');
  $('li.deliverAll').remove();
}

let isCollecting = false;

async function collect() {
  if (isCollecting) {
    return;
  }
  isCollecting = true;

  const infoBoxElements = $('ul#rightInfoBoxContent li:not([class])').filter(function() {
    return !$(this)
      .find('div.date a')
      .is('.hidden');
  });

  // Add spinners to all items
  infoBoxElements
    .find('div.date')
    .append('<img class="statusIcon" src="//i.imgur.com/pDMku5j.gif" width="16" height="16"/>');

  // Start collecting
  for (let i = 0; i < infoBoxElements.length; i++) {
    const item = $(infoBoxElements[i]);
    if (item.find('div.date a').is('.hidden')) {
      continue;
    }
    const link = item.find('div.date a').attr('href')!;
    assert(link);

    // Update status icon
    const resp = await fetch(link);
    item
      .find('div.date img.statusIcon')
      .attr('src', resp.status === 200 ? '//i.imgur.com/5A3tGvf.png' : '//i.imgur.com/9jIoF80.jpg');

    // Wait for 5 seconds otherwise next request will fail
    await sleep(5000);
  }

  // Remove collected items from UI
  infoBoxElements.fadeOut(function() {
    isCollecting = false;
  });
}

export const collectDeliveries: Plugin = {
  name: 'COLLECT DELIVERIES',
  urlPatterns: ['.*'],
  action: async function() {
    if (await isAMPlus()) {
      return;
    }
    addButton();
    $('#collectButton').on('click', async function(e) {
      e.preventDefault();
      await collect();
    });
  },
};
