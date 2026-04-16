import { trigger } from "cs2/api";
import { logEngineCall } from "diagnostics";

export const engine = {
    trigger(group: string, name: string, ...args: unknown[]) {
        logEngineCall(group, name, args);
        trigger(group, name, ...args);
    },
};
