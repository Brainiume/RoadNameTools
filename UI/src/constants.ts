export const PANEL_GROUP = "roadSignsTools";
export const NATIVE_GROUP = "RoadSignsTools";
export const ICON_SRC = "coui://rst/Logo.svg";

export const DEFAULT_PANEL_STATE = "0|AssignMajorRouteNumber||0|none||||0|0|[]|0|None|0|0|0||AfterBaseName|0";

export const PRESET_PREFIXES = ["M", "A", "B", "C"] as const;

export const MODE_OPTIONS = [
    {
        id: "rename",
        label: "Rename Selected Segments",
        description: "Apply a custom road name to selected route segments.",
        backendMode: "RenameSelectedSegments",
    },
    {
        id: "assign",
        label: "Assign Major Route Number",
        description: "Preserve road names and append a route code.",
        backendMode: "AssignMajorRouteNumber",
    },
    {
        id: "remove",
        label: "Remove Route Number",
        description: "Remove a matching route code from selected segments.",
        backendMode: "RemoveMajorRouteNumber",
    },
] as const;
