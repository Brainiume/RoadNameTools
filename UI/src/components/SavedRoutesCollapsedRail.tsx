import { useEffect, useMemo, useRef, useState } from "react";
import { panelActions } from "bindings";
import { logUiEvent } from "diagnostics";
import { useRoadSignsLocalization } from "localization";
import { SavedRoute } from "types";
import styles from "styles/panel.module.scss";

interface SavedRoutesCollapsedRailProps {
    routes: SavedRoute[];
    selectedRouteId: number;
    onBack: () => void;
    onSelectRoute: (routeId: number) => void;
}

const RAIL_PADDING_TOP = 22;
const RAIL_PADDING_BOTTOM = 18;
const RAIL_ACTION_HEIGHT = 44;
const RAIL_ACTION_GAP = 14;
const RAIL_ROUTE_LIST_MARGIN_TOP = 26;
const RAIL_ROUTE_CHIP_HEIGHT = 45;
const RAIL_ROUTE_CHIP_GAP = 16;
const MIN_VISIBLE_SHORTCUTS = 1;

export function SavedRoutesCollapsedRail({ routes, selectedRouteId, onBack, onSelectRoute }: SavedRoutesCollapsedRailProps) {
    const { t } = useRoadSignsLocalization();
    const railRef = useRef<HTMLElement | null>(null);
    const [visibleShortcutCount, setVisibleShortcutCount] = useState<number>(MIN_VISIBLE_SHORTCUTS);
    const shortcutRoutes = useMemo(() => buildShortcutRoutes(routes, selectedRouteId, visibleShortcutCount), [routes, selectedRouteId, visibleShortcutCount]);
    const hasOverflow = routes.length > shortcutRoutes.length;

    useEffect(() => {
        const railElement = railRef.current;
        if (!railElement) {
            return;
        }

        const updateVisibleShortcutCount = () => {
            const railHeight = railElement.clientHeight;
            const reservedHeight =
                RAIL_PADDING_TOP +
                RAIL_PADDING_BOTTOM +
                (RAIL_ACTION_HEIGHT * 2) +
                RAIL_ACTION_GAP +
                RAIL_ROUTE_LIST_MARGIN_TOP;
            const availableHeight = Math.max(0, railHeight - reservedHeight);
            const chipUnit = RAIL_ROUTE_CHIP_HEIGHT + RAIL_ROUTE_CHIP_GAP;
            const totalChipCapacity = Math.max(MIN_VISIBLE_SHORTCUTS, Math.floor((availableHeight + RAIL_ROUTE_CHIP_GAP) / chipUnit));
            const nextVisibleShortcutCount = routes.length > totalChipCapacity
                ? Math.max(MIN_VISIBLE_SHORTCUTS, totalChipCapacity - 1)
                : totalChipCapacity;

            setVisibleShortcutCount((currentCount) => currentCount === nextVisibleShortcutCount ? currentCount : nextVisibleShortcutCount);
        };

        updateVisibleShortcutCount();

        const resizeObserver = new ResizeObserver(() => updateVisibleShortcutCount());
        resizeObserver.observe(railElement);

        return () => {
            resizeObserver.disconnect();
        };
    }, [routes.length]);

    return (
        <aside ref={railRef} className={styles.savedRail} aria-label={t("RoadSignsTools.UI[SavedRoutesRailAria]")}>
            <button
                className={styles.savedRailAction}
                type="button"
                aria-label={t("RoadSignsTools.UI[ClosePanelAria]")}
                title={t("RoadSignsTools.UI[ClosePanelTooltip]")}
                onClick={() => {
                    logUiEvent("saved routes rail close clicked");
                    panelActions.cancel();
                }}
            >
                x
            </button>
            <button
                className={styles.savedRailAction}
                type="button"
                aria-label={t("RoadSignsTools.UI[BackToSavedRoutesAria]")}
                title={t("RoadSignsTools.UI[BackToSavedRoutesTooltip]")}
                onClick={() => {
                    logUiEvent("saved routes rail back clicked");
                    onBack();
                }}
            >
                &lt;
            </button>

            <div className={styles.savedRailRouteList}>
                {shortcutRoutes.map((route) => (
                    <button
                        key={route.id}
                        className={`${styles.savedRailRouteChip} ${route.id === selectedRouteId ? styles.isSelected : ""}`}
                        type="button"
                        aria-pressed={route.id === selectedRouteId}
                        title={`${t("RoadSignsTools.UI[SwitchToSavedRouteTooltip]")} ${route.title || shortLabel(route, t)}.`}
                        onClick={() => {
                            logUiEvent("saved routes rail shortcut clicked", { routeId: route.id });
                            onSelectRoute(route.id);
                        }}
                    >
                        {shortLabel(route, t)}
                    </button>
                ))}
            </div>

            {hasOverflow && (
                <button
                    className={`${styles.savedRailRouteChip} ${styles.savedRailOverflowChip}`}
                    type="button"
                    aria-label={t("RoadSignsTools.UI[ShowAllSavedRoutesAria]")}
                    title={t("RoadSignsTools.UI[ShowAllSavedRoutesTooltip]")}
                    onClick={() => {
                        logUiEvent("saved routes rail overflow clicked");
                        onBack();
                    }}
                >
                    ...
                </button>
            )}
        </aside>
    );
}

function buildShortcutRoutes(routes: SavedRoute[], selectedRouteId: number, visibleShortcutCount: number): SavedRoute[] {
    const ordered = routes.slice().sort((left, right) => {
        if (left.id === selectedRouteId) {
            return -1;
        }

        if (right.id === selectedRouteId) {
            return 1;
        }

        return 0;
    });

    return ordered.slice(0, Math.max(MIN_VISIBLE_SHORTCUTS, visibleShortcutCount));
}

function shortLabel(route: SavedRoute, t: (key: string) => string): string {
    const source = (route.routeCode || route.input || route.title || t("RoadSignsTools.UI[RouteShortLabelFallback]")).trim();
    if (!source) {
        return t("RoadSignsTools.UI[RouteShortLabelFallback]");
    }

    const compact = source.split(/\s+/)[0];
    return compact.length > 6 ? compact.slice(0, 6) : compact;
}
