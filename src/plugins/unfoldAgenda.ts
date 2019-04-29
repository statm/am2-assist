import { Plugin } from '../plugin';

// TODO: Fix styling

export const unfoldAgenda: Plugin = {
    name: 'UNFOLD AGENDA',
    urlPatterns: ['home.*'],
    action: function() {
        $('.li_puce').css('display', 'none');
        $('.objectifDetails').css('display', 'block');
        $('.validBtn').css('display', 'none');
        $('.objectifDetails > .li_puce').css('display', 'block');
    }
};
