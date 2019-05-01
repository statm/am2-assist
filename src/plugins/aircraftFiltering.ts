import { Plugin } from '../plugin';

export const aircraftFiltering: Plugin = {
    name: 'AIRCRAFT FILTERING',
    urlPatterns: ['aircraft/buy/rental/[^/]+', 'aircraft/buy/new/[0-9]+/[^/]+'],
    action: function() {
        const filterUnavailableCheckBox = $(`
            <div style="margin-top:3px"><label><input type="checkbox" id="toggleAircraftsDisplay" style="margin-right:9px;vertical-align:middle">Filter unavailable aircrafts</label></div>
        `);
        $('form#aircraftFilterForm, .rentalFilterBox form').append(filterUnavailableCheckBox);

        $('select#lineListSelect').change(toggleAircraftAvailability);
        $('input#toggleAircraftsDisplay').click(toggleAircraftAvailability);

        function isAircraftAvailable(aircraftPurchaseBox: JQuery<HTMLElement>) {
            return !aircraftPurchaseBox.hasClass('disabled-research') && !aircraftPurchaseBox.hasClass('disabled');
        }

        function toggleAircraftAvailability() {
            $('.aircraftPurchaseBox').each(function() {
                if (isAircraftAvailable($(this))) {
                    $(this).show();
                    return;
                }

                if ($('input#toggleAircraftsDisplay').prop('checked')) {
                    $(this).hide();
                } else {
                    $(this).show();
                }
            });
        }
    }
};
