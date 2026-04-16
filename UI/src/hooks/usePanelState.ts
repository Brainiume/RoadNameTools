import { panelState$ } from "bindings";
import { DEFAULT_PANEL_STATE } from "constants";
import { logBindingUpdate } from "diagnostics";
import { useBindingValue } from "hooks/useBindingValue";
import { useEffect } from "react";
import { PanelState, RouteReviewMode, RouteReviewState, RouteToolMode, SavedRoute } from "types";

const DEFAULT_STATE: PanelState = {
    isOpen: false,
    mode: "AssignMajorRouteNumber",
    input: "",
    selectedSegments: 0,
    hoveredSegment: "none",
    previewText: "",
    statusMessage: "",
    showLauncher: true,
    inGame: false,
    waypointCount: 0,
    savedRoutes: [],
    routeReview: null,
    routeNumberPlacement: "AfterBaseName",
    roadNameEditRouteId: null,
};

const MODES: Record<string, RouteToolMode> = {
    RenameSelectedSegments: "RenameSelectedSegments",
    AssignMajorRouteNumber: "AssignMajorRouteNumber",
    RemoveMajorRouteNumber: "RemoveMajorRouteNumber",
};

function splitState(raw: string): string[] {
    const parts: string[] = [];
    let current = "";

    for (let index = 0; index < raw.length; index++) {
        const char = raw[index];
        if (char === "\\") {
            const next = raw[index + 1];
            if (next === "p") {
                current += "|";
                index++;
                continue;
            }
            if (next === "n") {
                current += "\n";
                index++;
                continue;
            }
            if (next) {
                current += next;
                index++;
                continue;
            }
        }

        if (char === "|") {
            parts.push(current);
            current = "";
        } else {
            current += char;
        }
    }

    parts.push(current);
    return parts;
}

function toNumber(value: string): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function parseSavedRoutes(raw: string): SavedRoute[] {
    try {
        const parsed = JSON.parse(raw || "[]") as SavedRoute[];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn("[RoadSignsTools] Failed to parse saved routes", error, raw);
        return [];
    }
}

function parseRouteReview(parts: string[]): RouteReviewState | null {
    const routeId = toNumber(parts[11] ?? "0");
    const mode = (parts[12] ?? "None") as RouteReviewMode;
    if (!routeId || mode === "None") {
        return null;
    }

    return {
        routeId,
        mode,
        dirty: parts[13] === "1",
        candidateSegments: toNumber(parts[14] ?? "0"),
        candidateWaypoints: toNumber(parts[15] ?? "0"),
        message: parts[16] ?? "",
    };
}

export function parsePanelState(raw: string): PanelState {
    const parts = splitState(raw || "");
    return {
        isOpen: parts[0] === "1",
        mode: MODES[parts[1]] ?? DEFAULT_STATE.mode,
        input: parts[2] ?? "",
        selectedSegments: toNumber(parts[3] ?? "0"),
        hoveredSegment: parts[4] || "none",
        previewText: parts[5] ?? "",
        statusMessage: parts[6] ?? "",
        showLauncher: parts[7] !== "0",
        inGame: parts[8] === "1",
        waypointCount: toNumber(parts[9] ?? "0"),
        savedRoutes: parseSavedRoutes(parts[10] ?? "[]"),
        routeReview: parseRouteReview(parts),
        routeNumberPlacement: parts[17] === "BeforeBaseName" ? "BeforeBaseName" : "AfterBaseName",
        roadNameEditRouteId: toNumber(parts[18] ?? "0") || null,
    };
}

export function usePanelState(): PanelState {
    const rawState = useBindingValue(panelState$, DEFAULT_PANEL_STATE);
    const state = parsePanelState(rawState);

    useEffect(() => {
        logBindingUpdate("backend response received", {
            isOpen: state.isOpen,
            inGame: state.inGame,
            mode: state.mode,
            input: state.input,
            selectedSegments: state.selectedSegments,
            waypointCount: state.waypointCount,
            savedRoutes: state.savedRoutes.length,
            routeReview: state.routeReview?.mode ?? "None",
            routeNumberPlacement: state.routeNumberPlacement,
            roadNameEditRouteId: state.roadNameEditRouteId,
            statusMessage: state.statusMessage,
        });
    }, [
        rawState,
        state.inGame,
        state.input,
        state.isOpen,
        state.mode,
        state.roadNameEditRouteId,
        state.routeNumberPlacement,
        state.savedRoutes.length,
        state.selectedSegments,
        state.statusMessage,
        state.waypointCount,
    ]);

    return state;
}
