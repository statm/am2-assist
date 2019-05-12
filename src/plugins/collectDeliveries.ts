import { Plugin } from '../plugin';
import { isAMPlus } from '../utils';

function addButton() {
    if (isAMPlus()) {
        return;
    }
    const button = $(`
        <li class="collectButton amCoinsPurchase">
            <div>
                <a id="collectButton" class="validBtnBlue">
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
    const b = $('div.date a');
    for (let i = 0; i < b.length; i++) {
        if (!b[i].className.includes('hidden')) {
            const link = b[i].getAttribute('href');
            // console.log(b[i].getAttribute('href'));
            try {
                await $.get(`${link}`);
                $('#rightInfoBoxContent li')[i].remove();
            } catch (e) {
                console.log('error on getting ' + link);
            }
        }
    }
}

export const collectDeliveries: Plugin = {
    name: 'Collect Deliveries',
    urlPatterns: ['.*'],
    action: function() {
        addButton();
        $('li.collectButton').click(collect);
    }
};
