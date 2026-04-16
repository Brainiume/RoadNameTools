const PREFIX = "[RoadSignsTools:UI]";

export function logUiEvent(event: string, details?: unknown) {
    if (details === undefined) {
        console.log(PREFIX, event);
        return;
    }

    console.log(PREFIX, event, details);
}

export function logEngineCall(group: string, name: string, args: unknown[]) {
    console.log(PREFIX, "engine call sent", { group, name, args });
}

export function logBindingUpdate(event: string, details: unknown) {
    console.log(PREFIX, event, details);
}
