import { memo, useCallback, useMemo } from "react";
import { panelActions } from "bindings";
import { useRoadSignsTools } from "context/RoadSignsToolsContext";
import { logUiEvent } from "diagnostics";
import { SavedRoute, SavedRouteFilter } from "types";
import styles from "styles/panel.module.scss";

const ROUTE_FILTERS: SavedRouteFilter[] = ["M", "A", "B", "C", "None"];

export function SavedRoutesTab() {
    const { savedRouteFilter, setSavedRouteFilter, setSelectedRouteId, state } = useRoadSignsTools();
    const visibleRoutes = useMemo(
        () => savedRouteFilter
            ? state.savedRoutes.filter((route) => routePrefixFilter(route) === savedRouteFilter)
            : state.savedRoutes,
        [savedRouteFilter, state.savedRoutes],
    );

    const handleFilterClick = useCallback((filter: SavedRouteFilter) => {
        const isNoneFilter = filter === "None";
        const nextFilter = isNoneFilter ? null : savedRouteFilter === filter ? null : filter;
        logUiEvent("saved route filter clicked", { filter, nextFilter, noFilter: isNoneFilter });
        setSavedRouteFilter(nextFilter);
    }, [savedRouteFilter, setSavedRouteFilter]);

    const handleRouteSelect = useCallback((routeId: number) => {
        setSelectedRouteId(routeId);
    }, [setSelectedRouteId]);

    return (
        <section className={styles.savedTab} aria-label="Saved routes manager">
            <header className={styles.savedHeaderBlock}>
                <div>
                    <span className={styles.savedEyebrow}>Saved Routes</span>
                    <p>Choose a route to view details and actions.</p>
                </div>
                <strong>{state.savedRoutes.length}</strong>
            </header>

            <div className={styles.savedDivider} />

            <div className={styles.filterBlock} aria-label="Saved route filters">
                <span className={styles.filterLabel}>Filters</span>
                <div className={styles.filterChipRow}>
                    {ROUTE_FILTERS.map((filter) => {
                        const isNoneFilter = filter === "None";
                        const isActive = isNoneFilter ? savedRouteFilter === null : savedRouteFilter === filter;
                        return (
                            <button
                                key={filter}
                                className={`${styles.filterChip} ${filter === "None" ? styles.filterChipWide : ""} ${isActive ? styles.isActive : ""}`}
                                type="button"
                                aria-pressed={isActive}
                                title={filterTooltip(filter)}
                                onClick={() => handleFilterClick(filter)}
                            >
                                {filter}
                            </button>
                        );
                    })}
                </div>
            </div>

            {state.savedRoutes.length === 0 ? (
                <div className={styles.emptyState}>No saved routes yet. Apply a route to save it automatically.</div>
            ) : visibleRoutes.length === 0 ? (
                <div className={styles.emptyState}>No saved routes match this filter.</div>
            ) : (
                <div className={styles.savedRouteListFrame}>
                    <div className={styles.savedRouteList} aria-label="Saved route list">
                        {visibleRoutes.map((route) => (
                            <SavedRouteCard
                                key={route.id}
                                route={route}
                                onSelect={handleRouteSelect}
                            />
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}

const SavedRouteCard = memo(function SavedRouteCard({ route, onSelect }: { route: SavedRoute; onSelect: (routeId: number) => void }) {
    return (
        <button
            className={styles.savedRouteCard}
            type="button"
            title="Open this saved route. Double-click to preview it on the map."
            onClick={() => {
                logUiEvent("saved route card clicked", { routeId: route.id });
                onSelect(route.id);
            }}
            onDoubleClick={() => {
                logUiEvent("saved route preview double clicked", { routeId: route.id });
                panelActions.previewRoute(route.id);
            }}
        >
            <span className={styles.savedRouteCardMain}>
                <strong>{route.title || route.input || "Saved Route"}</strong>
                <span>{route.subtitle || routeSummary(route)}</span>
            </span>
            <span className={`${styles.statusPill} ${styles[`status${route.status}`]}`}>{statusLabel(route.status)}</span>
        </button>
    );
});

function filterTooltip(filter: SavedRouteFilter): string {
    if (filter === "None") {
        return "Show all saved routes without applying a prefix filter.";
    }

    return `Show only saved routes that use the ${filter} prefix.`;
}

function routePrefixFilter(route: SavedRoute): SavedRouteFilter | "Custom" {
    const prefix = route.routePrefixType || routePrefixFromInput(route.input);
    return prefix === "M" || prefix === "A" || prefix === "B" || prefix === "C" || prefix === "None" ? prefix : "Custom";
}

function routePrefixFromInput(input: string): SavedRouteFilter | "Custom" {
    const value = (input || "").trim().toUpperCase();
    if (!value) {
        return "None";
    }

    const prefix = value[0] as SavedRouteFilter;
    return prefix === "M" || prefix === "A" || prefix === "B" || prefix === "C" ? prefix : "Custom";
}

function routeSummary(route: SavedRoute): string {
    const corridor = route.derivedDisplayCorridor || route.streets || route.input || "Saved route";
    return `${corridor} | ${route.segments} segments`;
}

function statusLabel(status: string): string {
    if (status === "PartiallyValid") {
        return "Partial";
    }
    if (status === "RebuildNeeded") {
        return "Rebuild";
    }
    if (status === "MissingSegments") {
        return "Missing";
    }
    return status;
}
