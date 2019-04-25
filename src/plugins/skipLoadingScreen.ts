import { Plugin } from '../plugin';

export const skipLoadingScreen: Plugin = {
    name: "SKIP LOADING SCREEN",
    urlPatterns: ["home/loading"],
    action: function () {
        window.location.href = "/home";
    }
}
