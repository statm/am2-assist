import { Plugin } from '../plugin';

export const routeListStickyHeader: Plugin = {
    name: 'ROUTE LIST STICKY HEADER',
    urlPatterns: ['network/newline/[0-9]+/[a-z]+'],
    action: function() {
        $('.mainFilterBox').css({ position: 'sticky', top: 0, 'z-index': 1, 'background-color': '#565a66', 'padding-top': '10px', 'padding-bottom': '10px' });
    }
};
