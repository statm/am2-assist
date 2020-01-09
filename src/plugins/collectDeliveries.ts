import { Plugin } from '../plugin';
import { isAMPlus, sleep } from '../utils';

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

async function collect() {
  console.log('start collecting');
  const b = $('div.date a');
  for (let i = 0; i < b.length; i++) {
    if (!b[i].className.includes('hidden')) {
      const link = b[i].getAttribute('href')!;
      try {
        await $.get(link, function(data, status, xhr) {
          if (xhr.status === 200) {
            $('#rightInfoBoxContent li')[i].remove();
          } else {
            console.log('Collecting ' + link + ' failed. Status Code = ' + xhr.status);
          }
        });
        // sleep 5 seconds, otherwise request will fail.
        await sleep(5000);
      } catch (e) {
        console.log('error on getting ' + link);
      }
    }
  }
}

export const collectDeliveries: Plugin = {
  name: 'COLLECT DELIVERIES',
  urlPatterns: ['.*'],
  action: async function() {
    if (await isAMPlus()) {
      return;
    }
    addButton();
    $('#collectButton').on('click', function() {
      collect();
      return false;
    });
  },
};
