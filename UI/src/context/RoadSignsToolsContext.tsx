import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { logBindingUpdate, logUiEvent } from "diagnostics";
import { PanelState, PanelTab, SavedRouteFilter } from "types";

interface RoadSignsToolsContextValue {
    state: PanelState;
    activeTab: PanelTab;
    setActiveTab: (tab: PanelTab) => void;
    selectedRouteId: number | null;
    setSelectedRouteId: (routeId: number | null) => void;
    savedRouteFilter: SavedRouteFilter | null;
    setSavedRouteFilter: (filter: SavedRouteFilter | null) => void;
}

const RoadSignsToolsContext = createContext<RoadSignsToolsContextValue | null>(null);

export function RoadSignsToolsProvider({ state, children }: PropsWithChildren<{ state: PanelState }>) {
    const [activeTab, setActiveTab] = useState<PanelTab>("create");
    const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
    const [savedRouteFilter, setSavedRouteFilter] = useState<SavedRouteFilter | null>(null);

    const setLoggedActiveTab = (tab: PanelTab) => {
        logUiEvent("active tab updated", { tab });
        setActiveTab(tab);
    };

    const setLoggedSelectedRouteId = (routeId: number | null) => {
        if (routeId === null) {
            logUiEvent("saved route selection cleared");
        } else {
            logUiEvent("saved route selected", { routeId });
        }

        setSelectedRouteId(routeId);
    };

    const setLoggedSavedRouteFilter = (filter: SavedRouteFilter | null) => {
        logUiEvent("saved route filter updated", { filter });
        setSavedRouteFilter(filter);
    };

    useEffect(() => {
        if (state.savedRoutes.length === 0) {
            logBindingUpdate("saved route selection cleared", { reason: "no routes" });
            setSelectedRouteId(null);
            return;
        }

        if (selectedRouteId !== null && !state.savedRoutes.some((route) => route.id === selectedRouteId)) {
            logBindingUpdate("saved route selection cleared", { reason: "missing route", routeId: selectedRouteId });
            setSelectedRouteId(null);
        }
    }, [selectedRouteId, state.savedRoutes]);

    return (
        <RoadSignsToolsContext.Provider value={{ state, activeTab, setActiveTab: setLoggedActiveTab, selectedRouteId, setSelectedRouteId: setLoggedSelectedRouteId, savedRouteFilter, setSavedRouteFilter: setLoggedSavedRouteFilter }}>
            {children}
        </RoadSignsToolsContext.Provider>
    );
}

export function useRoadSignsTools() {
    const context = useContext(RoadSignsToolsContext);
    if (!context) {
        throw new Error("Road Signs Tools context is not available.");
    }

    return context;
}
