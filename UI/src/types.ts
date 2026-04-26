export type RouteToolMode =
    | "RenameSelectedSegments"
    | "AssignMajorRouteNumber"
    | "RemoveMajorRouteNumber";

export type RouteToolModeCommand = "rename" | "assign" | "remove";

export type SavedRouteStatus =
    | "Valid"
    | "PartiallyValid"
    | "MissingSegments"
    | "RebuildNeeded"
    | "Deleted";

export type RouteReviewMode = "None" | "RebuildPreview" | "Modify";

export type PanelTab = "create" | "saved";

export type PrefixType = "M" | "A" | "B" | "C" | "Custom";

export type SavedRouteFilter = "M" | "A" | "B" | "C" | "None";

export type RouteNumberPlacement = "BeforeBaseName" | "AfterBaseName";

export interface SavedRoute {
    id: number;
    title: string;
    savedTitle?: string;
    userTitle?: boolean;
    mode: RouteToolMode;
    input: string;
    routeCode?: string;
    routePrefixType?: SavedRouteFilter | "Custom";
    segments: number;
    waypoints: number;
    status: SavedRouteStatus;
    streets: string;
    startDistrictName?: string;
    endDistrictName?: string;
    startRoadName?: string;
    endRoadName?: string;
    derivedDisplayCorridor?: string;
    districtSummary?: string;
    subtitle?: string;
    updated: string;
}

export interface PanelState {
    isOpen: boolean;
    mode: RouteToolMode;
    input: string;
    selectedSegments: number;
    hoveredSegment: string;
    previewText: string;
    statusMessage: string;
    showLauncher: boolean;
    inGame: boolean;
    waypointCount: number;
    savedRoutes: SavedRoute[];
    routeReview: RouteReviewState | null;
    routeNumberPlacement: RouteNumberPlacement;
    roadNameEditRouteId: number | null;
    undergroundMode: boolean;
}

export interface RouteReviewState {
    routeId: number;
    mode: RouteReviewMode;
    dirty: boolean;
    candidateSegments: number;
    candidateWaypoints: number;
    message: string;
}

export interface RouteCodeDraft {
    prefixType: PrefixType;
    customPrefix: string;
    numberPart: string;
}
