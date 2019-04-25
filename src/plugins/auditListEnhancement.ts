import { Plugin } from '../plugin';

export const auditListEnhancement: Plugin = {
    name: 'AUDIT LIST ENHANCEMENT',
    urlPatterns: ['marketing/internalaudit/linelist(\\?.*)?'],
    action: function() {
        $('td.reliability').next().each(function() {
            const pricingUrl = $(this).find('a').attr('href')!.replace('internalaudit', 'pricing');

            const pricingLink = $(`<a href="${pricingUrl}">
                                    <img class="auditIcon" src="/images/icons30/marketing_globalPricing.png?v1.6.11" width="20" height="20" title="Pricing details">
                                </a>`);
            pricingLink.tooltip({ position: { of: pricingLink, my: 'bottom', at: 'top-3px' } });
            $(this).css({ width: '55px' }).append(pricingLink);
        });
    }
};
