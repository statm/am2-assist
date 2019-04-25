import { Plugin } from '../plugin';

export const routeFiltering: Plugin = {
    name: 'ROUTE FILTERING',
    urlPatterns: ['network/newline/[0-9]+/[a-z]+'],
    action: function() {
        $(`<label><input type="checkbox" id="toggleRouteFiltering" style="margin-right:4px;vertical-align:middle">Filter unavailable routes</label>`).appendTo('.filterBox1');
        $('.otherTools').removeAttr('data-title');
        $('#toggleRouteFiltering, #aircraftListSelect').change(function() {
            $('.hubListBox').each(function() {
                if ($(this).hasClass('disabled') && $('#toggleRouteFiltering').prop('checked')) {
                    $(this).hide();
                } else {
                    $(this).show();
                }
            });
        });
    }
};
