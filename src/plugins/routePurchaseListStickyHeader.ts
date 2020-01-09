import { Plugin } from '../plugin';

export const routePurchaseListStickyHeader: Plugin = {
  name: 'ROUTE PURCHASE LIST STICKY HEADER',
  urlPatterns: ['network/newline/[0-9]+/[a-z]+'],
  action: function() {
    $('.mainFilterBox').css({
      position: 'sticky',
      top: 0,
      'z-index': 1,
      'background-color': '#565a66',
      'padding-top': '10px',
      'padding-bottom': '10px',
    });
  },
};
