import { Plugin } from '../plugin';
// import { loadPlayerData } from '../ajax/loadPlayerData';

export const playerDataCollection: Plugin = {
    name: 'PLAYER DATA COLLECTION (CTRL+/)',
    urlPatterns: ['.*'],
    action: function() {
        window.addEventListener('keyup', async function(event) {
            // Ctrl + /
            if (event.key == '/' && !event.altKey && event.ctrlKey && !event.shiftKey) {
                // const output = JSON.stringify(await loadPlayerData());
                // GM_setClipboard(output);
                console.log('Player data copied to clipboard');
            }
        });
    }
};
