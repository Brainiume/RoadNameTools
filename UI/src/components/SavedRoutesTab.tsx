import { memo, useCallback, useMemo } from "react";
import { panelActions } from "bindings";
import { useRoadSignsTools } from "context/RoadSignsToolsContext";
import { logUiEvent } from "diagnostics";
import { useRoadSignsLocalization } from "localization";
import { SavedRoute, SavedRouteFilter } from "types";
import styles from "styles/panel.module.scss";

const ROUTE_FILTERS: SavedRouteFilter[] = ["M", "A", "B", "C", "None"];

export function SavedRoutesTab() {
    const { savedRouteFilter, setSavedRouteFilter, setSelectedRouteId, state } = useRoadSignsTools();
    const { t } = useRoadSignsLocalization();
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
        <section className={styles.savedTab} aria-label={t("RoadSignsTools.UI[SavedRoutesManagerAria]")}>
            <header className={styles.savedHeaderBlock}>
                <div>
                    <span className={styles.savedEyebrow}>{t("RoadSignsTools.UI[SavedRoutesHeading]")}</span>
                    <p>{t("RoadSignsTools.UI[SavedRoutesIntro]")}</p>
                </div>
                <strong>{state.savedRoutes.length}</strong>
            </header>

            <div className={styles.savedDivider} />

            <div className={styles.filterBlock} aria-label={t("RoadSignsTools.UI[SavedRouteFiltersAria]")}>
                <span className={styles.filterLabel}>{t("RoadSignsTools.UI[Filters]")}</span>
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
                                title={filterTooltip(filter, t)}
                                onClick={() => handleFilterClick(filter)}
                            >
                                {filter === "None" ? t("RoadSignsTools.UI[FilterAll]") : filter}
                            </button>
                        );
                    })}
                </div>
            </div>

            {state.savedRoutes.length === 0 ? (
                <div className={styles.emptyState}>{t("RoadSignsTools.UI[NoSavedRoutes]")}</div>
            ) : visibleRoutes.length === 0 ? (
                <div className={styles.emptyState}>{t("RoadSignsTools.UI[NoSavedRoutesForFilter]")}</div>
            ) : (
                <div className={styles.savedRouteListFrame}>
                    <div className={styles.savedRouteList} aria-label={t("RoadSignsTools.UI[SavedRouteListAria]")}>
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
    const { t } = useRoadSignsLocalization();

    return (
        <button
            className={styles.savedRouteCard}
            type="button"
            title={t("RoadSignsTools.UI[OpenSavedRouteTooltip]")}
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
                <strong>{route.title || route.input || t("RoadSignsTools.UI[SavedRoute]")}</strong>
                <span>{route.subtitle || routeSummary(route, t)}</span>
            </span>
            <span className={`${styles.statusPill} ${styles[`status${route.status}`]}`}>{statusLabel(route.status, t)}</span>
        </button>
    );
});

function filterTooltip(filter: SavedRouteFilter, t: (key: string) => string): string {
    if (filter === "None") {
        return t("RoadSignsTools.UI[FilterAllTooltip]");
    }

    if (filter === "M") {
        return t("RoadSignsTools.UI[FilterPrefixMTooltip]");
    }
    if (filter === "A") {
        return t("RoadSignsTools.UI[FilterPrefixATooltip]");
    }
    if (filter === "B") {
        return t("RoadSignsTools.UI[FilterPrefixBTooltip]");
    }

    return t("RoadSignsTools.UI[FilterPrefixCTooltip]");
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

function routeSummary(route: SavedRoute, t: (key: string) => string): string {
    const corridor = route.derivedDisplayCorridor || route.streets || route.input || t("RoadSignsTools.UI[SavedRouteSummaryFallback]");
    return `${corridor} | ${route.segments} ${t("RoadSignsTools.UI[Segments]")}`;
}

function statusLabel(status: string, t: (key: string) => string): string {
    if (status === "PartiallyValid") {
        return t("RoadSignsTools.UI[StatusPartial]");
    }
    if (status === "RebuildNeeded") {
        return t("RoadSignsTools.UI[StatusRebuild]");
    }
    if (status === "MissingSegments") {
        return t("RoadSignsTools.UI[StatusMissing]");
    }
    return status;
}
