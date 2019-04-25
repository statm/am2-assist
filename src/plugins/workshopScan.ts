import { Plugin } from '../plugin';
import { loadWorkshopInfo } from '../ajax/loadWorkshopInfo';
import { getIntFromString } from '../utils';

export const workshopScan: Plugin = {
    name: 'WORKSHOP SCAN (CTRL+ALT+/)',
    urlPatterns: ['.*'],
    action: function() {
        window.addEventListener('keyup', async function(event) {
            // Ctrl + Alt + /
            if (event.key == '/' && event.altKey && event.ctrlKey && !event.shiftKey) {
                const HIGHLIGHT_THRESHOLD = 9999;

                const startStr = prompt('Begin ID');
                if (!startStr) {
                    return;
                }
                const endStr = prompt('End ID');
                if (!endStr) {
                    return;
                }
                const workshopInfo = await loadWorkshopInfo(getIntFromString(startStr), getIntFromString(endStr));

                // Print
                let printOutput = '';
                const formatArray = [];

                for (const item of workshopInfo) {
                    const itemLine = `${item.id}|${item.tcPrice}|${item.itemName}|${item.tcRate}  =>  https://www.airlines-manager.com/shop/enablebonus/${item.id}\n`;

                    if (item.tcRate > HIGHLIGHT_THRESHOLD) {
                        printOutput += `%c${itemLine}%c`;
                        formatArray.push('color:red', 'color:none');
                    } else {
                        printOutput += itemLine;
                    }
                }

                console.log.apply(this, [printOutput, ...formatArray]);
            }
        });
    }
};