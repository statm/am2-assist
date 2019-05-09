import { PAGE_URL } from './constants';

export type Plugin = {
    name: string,
    urlPatterns: ReadonlyArray<string>,
    action: (pattern: string) => void
};

const pluginRegistry: { [pattern: string]: Plugin[] } = {};

export function registerPlugin(plugin: Plugin) {
    for (const pattern of plugin.urlPatterns) {
        if (pluginRegistry[pattern] === undefined) {
            pluginRegistry[pattern] = [];
        }
        pluginRegistry[pattern].push(plugin);
    }
}

export function runPlugins() {
    for (const pattern in pluginRegistry) {
        if (PAGE_URL.match(new RegExp(`^${pattern}$`))) {
            for (const plugin of pluginRegistry[pattern]) {
                console.log(`Running plugin: ${plugin.name}`);
                plugin.action(pattern);
            }
        }
    }
}
