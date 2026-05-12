import { trigger } from "cs2/api";

export const engine = {
    trigger(group: string, name: string, ...args: unknown[]) {
        trigger(group, name, ...args);
    },
};
