import { bindLocalValue, bindValue } from "cs2/api";
import { Entity } from "cs2/bindings";
import { DEFAULT_PANEL_STATE, NATIVE_GROUP, PANEL_GROUP } from "constants";
import { engine } from "engine";
import { GAME_BINDINGS } from "gameBindings";
import { RouteNumberPlacement, RouteToolModeCommand } from "types";

export const panelState$ = bindValue<string>(PANEL_GROUP, "state", DEFAULT_PANEL_STATE);
export const selectedEntity$ = bindValue<Entity>("selectedInfo", "selectedEntity", { index: 0, version: 0 });
export const nativePanelOpen$ = GAME_BINDINGS.PANEL_OPEN.binding;
export const nativeInGame$ = GAME_BINDINGS.IN_GAME.binding;
export const nativeShowLauncher$ = GAME_BINDINGS.SHOW_LAUNCHER.binding;
export const advancedRoadNamingPanelOpen$ = bindLocalValue(false);

export function openAdvancedRoadNamingPanel() {
    advancedRoadNamingPanelOpen$.update(true);
    panelActions.activate();
    panelActions.setMode("rename");
}

export function closeAdvancedRoadNamingPanel() {
    advancedRoadNamingPanelOpen$.update(false);
    panelActions.cancel();
}

export const panelActions = {
    setNativePanelOpen(open: boolean) {
        GAME_BINDINGS.PANEL_OPEN.set(open);
    },
    togglePanel() {
        engine.trigger(PANEL_GROUP, "togglePanel");
    },
    activate() {
        engine.trigger(PANEL_GROUP, "activate");
    },
    showSavedRoutes() {
        engine.trigger(PANEL_GROUP, "showSavedRoutes");
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
    previewRoute(routeId: number) {
        engine.trigger(PANEL_GROUP, "previewRoute", routeId.toString());
    },
    reapplyRoute(routeId: number) {
        engine.trigger(PANEL_GROUP, "reapplyRoute", routeId.toString());
    },
    rebuildRoute(routeId: number) {
        engine.trigger(PANEL_GROUP, "rebuildRoute", routeId.toString());
    },
    modifyRoute(routeId: number) {
        engine.trigger(PANEL_GROUP, "modifyRoute", routeId.toString());
    },
    editRouteRoadNames(routeId: number) {
        engine.trigger(PANEL_GROUP, "editRouteRoadNames", routeId.toString());
    },
    returnToSavedRoutes() {
        engine.trigger(PANEL_GROUP, "returnToSavedRoutes");
    },
    acceptRouteReview(routeId: number) {
        engine.trigger(PANEL_GROUP, "acceptRouteReview", routeId.toString());
    },
    cancelRouteReview(routeId: number) {
        engine.trigger(PANEL_GROUP, "cancelRouteReview", routeId.toString());
    },
    deleteRoute(routeId: number) {
        engine.trigger(PANEL_GROUP, "deleteRoute", routeId.toString());
    },
    renameRoute(routeId: number, title: string) {
        engine.trigger(PANEL_GROUP, "renameRoute", `${routeId}|${title}`);
    },
    updateRouteInput(routeId: number, input: string) {
        engine.trigger(PANEL_GROUP, "updateRouteInput", `${routeId}|${input}`);
    },
};
