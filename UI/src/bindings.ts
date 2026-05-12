import { bindLocalValue, bindValue } from "cs2/api";
import { Entity } from "cs2/bindings";
import { DEFAULT_PANEL_STATE, PANEL_GROUP } from "constants";
import { engine } from "engine";
import { RouteNumberPlacement, RouteToolModeCommand } from "types";

export const panelState$ = bindValue<string>(PANEL_GROUP, "state", DEFAULT_PANEL_STATE);
export const selectedEntity$ = bindValue<Entity>("selectedInfo", "selectedEntity", { index: 0, version: 0 });
export const advancedRoadNamingPanelOpen$ = bindLocalValue(false);
export const advancedRoadNamingPanelKind$ = bindLocalValue<"rename" | "routes">("rename");

export function openAdvancedRoadNamingPanel() {
    advancedRoadNamingPanelKind$.update("rename");
    advancedRoadNamingPanelOpen$.update(true);
    panelActions.activate();
    panelActions.setMode("rename");
}

export function openAdvancedRoadRoutesPanel() {
    advancedRoadNamingPanelKind$.update("routes");
    advancedRoadNamingPanelOpen$.update(true);
    panelActions.activate();
    panelActions.setMode("assign");
}

export function closeAdvancedRoadNamingPanel() {
    advancedRoadNamingPanelOpen$.update(false);
    panelActions.cancel();
}

export const panelActions = {
    activate() {
        engine.trigger(PANEL_GROUP, "activate");
    },
    cancel() {
        engine.trigger(PANEL_GROUP, "cancel");
    },
    apply() {
        engine.trigger(PANEL_GROUP, "apply");
    },
    clear() {
        engine.trigger(PANEL_GROUP, "clear");
    },
    removeLast() {
        engine.trigger(PANEL_GROUP, "removeLast");
    },
    setMode(mode: RouteToolModeCommand) {
        engine.trigger(PANEL_GROUP, "setMode", mode);
    },
    setInput(value: string) {
        engine.trigger(PANEL_GROUP, "setInput", value);
    },
    setRouteNumberPlacement(value: RouteNumberPlacement) {
        engine.trigger(PANEL_GROUP, "setRouteNumberPlacement", value);
    },
    setUndergroundMode(enabled: boolean) {
        engine.trigger(PANEL_GROUP, "setUndergroundMode", enabled);
    },
};
