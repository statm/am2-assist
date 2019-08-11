import { Plugin } from '../plugin';
import { isAMPlus } from '../utils';

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
    const elements: Array<HTMLElement> = [];
    for (let i = 0; i < b.length; i++) {
        if (!b[i].className.includes('hidden')) {
            const link = b[i].getAttribute('href')!;
            try {
                await $.get(link);
                elements.push($('#rightInfoBoxContent li')[i]);
            } catch (e) {
                console.log('error on getting ' + link);
            }
        }
    }
    elements.forEach(element => {
        element.remove();
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
        $('#collectButton').on('click', function() {
            collect();
            return false;
        });
    }
};
