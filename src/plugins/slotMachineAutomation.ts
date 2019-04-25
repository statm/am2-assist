import { Plugin } from '../plugin';
import { AJAX_COOLDOWN } from '../constants';

export const slotMachineAutomation: Plugin = {
    name: 'SLOT MACHINE AUTOMATION',
    urlPatterns: ['company/cockpitasous'],
    action: function () {
        let playing = false;
        let gameCount = 0;
        let logText = '';
        const harvest: any = {};
        const harvestNames = [['d', '$'], ['rd', 'R$'], ['t', 'Tickets'], ['tr', 'TC']];

        $('#gameAlsoOnMobile').remove();

        const logArea = $("<textarea style='width:710px;height:100px;margin:25px 15px 0px 15px' readonly />");
        $('.cockpitASousContent').append(logArea);

        $('button#playForOneTicket')
            .unbind('click')
            .click(function () {
                if (!playing) {
                    play();
                }
            });

        function log(text: string) {
            logText += text;
            logArea.val(logText).scrollTop(logArea[0].scrollHeight);
        }

        function play() {
            playing = true;
            ++gameCount;
            log(`Game ${gameCount}...`);
            $.get('cockpitasous/play', function (resp) {
                const data = $.parseJSON(resp);

                if (data.errorMsg) {
                    playing = false;
                    log(`${data.errorMsg} (Error ${data.errorCode})\n`);
                    log(`================== Ended ==================\n`);
                    return;
                }

                if (data.gain) {
                    if (data.gain.gainLabel.endsWith(' R$')) {
                        data.gain.gainLabel = '+R$ ' + data.gain.gainLabel.substr(1, data.gain.gainLabel.length - 3);
                    } else if (data.gain.gainLabel.endsWith(' $')) {
                        data.gain.gainLabel = '+$ ' + data.gain.gainLabel.substr(1, data.gain.gainLabel.length - 2);
                    }
                    log(`${data.gain.gainLabel}\n`);

                    if (!(data.gain.gainType in harvest)) {
                        harvest[data.gain.gainType] = 0;
                    }
                    harvest[data.gain.gainType] += data.gain.gainAmount;
                } else {
                    log('nothing\n');
                }

                if (!data.isAllowToPlay || data.nbOfTickets === 0) {
                    playing = false;
                    log(`================== Ended ==================\n`);
                    for (const harvestNamePair of harvestNames) {
                        const harvestName = harvestNamePair[0];
                        const harvestDisplayName = harvestNamePair[1];
                        if (harvest[harvestName]) {
                            log(`${harvestDisplayName}: ${harvest[harvestName].toLocaleString()}\n`);
                        }
                    }
                } else {
                    setTimeout(play, AJAX_COOLDOWN);
                }
            });
        }
    }
};
