import { Plugin } from '../plugin';

export const enhanceAircraftProfibilityDetail: Plugin = {
    name: "ENHANCE AIRCRAFT PROFIBILITY DETAIL",
    urlPatterns: ["aircraft/show/[0-9]", "aircraft/buy/new/[0-9]+/[^/]+/.*"],
    action: function() {
        //
    }
}
