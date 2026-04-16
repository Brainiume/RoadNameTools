import { ChangeEvent, useEffect, useState } from "react";
import { panelActions } from "bindings";
import { useRoadSignsTools } from "context/RoadSignsToolsContext";
import { logUiEvent } from "diagnostics";
import { SavedRoute } from "types";
import styles from "styles/panel.module.scss";

interface SavedRouteDetailsProps {
    route: SavedRoute;
}

export function SavedRouteDetails({ route }: SavedRouteDetailsProps) {
    const { state } = useRoadSignsTools();
    const resolvedTitle = route.userTitle ? route.savedTitle || route.title : route.title;
    const [title, setTitle] = useState(resolvedTitle);
    const [input, setInput] = useState(route.input);
    const review = state.routeReview && state.routeReview.routeId === route.id ? state.routeReview : null;
    const inRebuildReview = review?.mode === "RebuildPreview";
    const inModifyReview = review?.mode === "Modify";

    useEffect(() => {
        const nextTitle = route.userTitle ? route.savedTitle || route.title : route.title;
        setTitle(nextTitle);
        setInput(route.input);
        logUiEvent("saved route details opened", { routeId: route.id, title: route.title });
    }, [route.id, route.input, route.savedTitle, route.title, route.userTitle]);

    const onTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
        logUiEvent("saved route title changed", { routeId: route.id, title: event.target.value });
        setTitle(event.target.value);
    };

    const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        logUiEvent("saved route input changed", { routeId: route.id, input: event.target.value });
        setInput(event.target.value);
    };

    return (
        <aside className={styles.routeDetails} aria-label="Selected route details">
            <article className={styles.routeDetailCard}>
                <header className={styles.routeDetailHead}>
                    <div>
                        <span>Route Details</span>
                        <h3>{route.title || "Saved Route"}</h3>
                    </div>
                    <span className={`${styles.statusPill} ${styles[`status${route.status}`]}`}>{statusLabel(route.status)}</span>
                </header>

                {review && (
                    <div className={`${styles.routeReviewBanner} ${inModifyReview ? styles.routeReviewBannerModify : styles.routeReviewBannerRebuild}`}>
                        <strong>{inModifyReview ? "Modify Route" : "Rebuild Review"}</strong>
                        <p>{review.message || "Review the proposed route path before committing changes."}</p>
                        <span>
                            {review.candidateWaypoints} waypoint(s) | {review.candidateSegments} segment(s)
                            {review.dirty ? " | unsaved edits" : ""}
                        </span>
                    </div>
                )}

                <dl className={styles.routeMeta}>
                    <div>
                        <dt>Input</dt>
                        <dd>{route.routeCode || route.input || "None"}</dd>
                    </div>
                    <div>
                        <dt>Mode</dt>
                        <dd>{modeLabel(route.mode)}</dd>
                    </div>
                    <div>
                        <dt>Geometry</dt>
                        <dd>
                            {route.segments} segments, {route.waypoints} waypoints
                        </dd>
                    </div>
                    <div>
                        <dt>Streets</dt>
                        <dd>{route.streets || streetsFallback(route)}</dd>
                    </div>
                    <div>
                        <dt>Districts</dt>
                        <dd>{route.districtSummary || districtFallback(route)}</dd>
                    </div>
                </dl>

                <div className={styles.routeEditStack}>
                    <label>
                        <span>Title</span>
                        <input type="text" value={title} onChange={onTitleChange} aria-label="Route title" />
                    </label>
                    <label>
                        <span>Route Configuration</span>
                        <input type="text" value={input} onChange={onInputChange} aria-label="Route configuration input" />
                    </label>
                </div>

                <div className={`${styles.routeActionGroup} ${styles.routeActionRow} ${styles.routeActionRowPrimary}`}>
                    <div className={`${styles.routeActionSlot} ${styles.routeActionSlotPrimary}`}>
                        <button
                            type="button"
                            title="Preview this saved route on the map without modifying it."
                            disabled={!!review}
                            onClick={() => {
                                logUiEvent("saved route action clicked", { action: "preview", routeId: route.id });
                                panelActions.previewRoute(route.id);
                            }}
                        >
                            Preview
                        </button>
                    </div>
                    <div className={`${styles.routeActionSlot} ${styles.routeActionSlotPrimary}`}>
                        <button
                            type="button"
                            title="Apply this saved route configuration to the current world state again."
                            disabled={!!review}
                            onClick={() => {
                                logUiEvent("saved route action clicked", { action: "reapply", routeId: route.id });
                                panelActions.reapplyRoute(route.id);
                            }}
                        >
                            Reapply
                        </button>
                    </div>
                    <div className={`${styles.routeActionSlot} ${styles.routeActionSlotPrimary} ${styles.routeActionSlotPrimaryWide}`}>
                        <button
                            type="button"
                            title="Load this saved route into road-name edit mode so you can correct its street naming without losing the saved route."
                            disabled={!!review}
                            onClick={() => {
                                logUiEvent("saved route action clicked", { action: "edit roads", routeId: route.id });
                                panelActions.editRouteRoadNames(route.id);
                            }}
                        >
                            Edit Roads
                        </button>
                    </div>
                </div>

                <div className={`${styles.routeActionGroup} ${styles.routeActionRow} ${styles.routeActionRowSecondary}`}>
                    <div className={`${styles.routeActionSlot} ${styles.routeActionSlotSecondary}`}>
                        <button
                            type="button"
                            title="Recompute the saved route geometry from its stored waypoints."
                            disabled={!!review}
                            onClick={() => {
                                logUiEvent("saved route action clicked", { action: "rebuild", routeId: route.id });
                                panelActions.rebuildRoute(route.id);
                            }}
                        >
                            Rebuild
                        </button>
                    </div>
                    <div className={`${styles.routeActionSlot} ${styles.routeActionSlotSecondary}`}>
                        <button
                            type="button"
                            title="Load this saved route into edit mode so you can correct the path before committing it."
                            disabled={!!review}
                            onClick={() => {
                                logUiEvent("saved route action clicked", { action: "modify", routeId: route.id });
                                panelActions.modifyRoute(route.id);
                            }}
                        >
                            Modify
                        </button>
                    </div>
                    <div className={`${styles.routeActionSlot} ${styles.routeActionSlotSecondary}`}>
                        <button
                            type="button"
                            title="Save the edited route title for this saved route."
                            onClick={() => {
                                logUiEvent("saved route action clicked", { action: "save title", routeId: route.id, title });
                                panelActions.renameRoute(route.id, title);
                            }}
                        >
                            Save Title
                        </button>
                    </div>
                    <div className={`${styles.routeActionSlot} ${styles.routeActionSlotSecondary}`}>
                        <button
                            type="button"
                            title="Save the edited route configuration input for this route."
                            onClick={() => {
                                logUiEvent("saved route action clicked", { action: "save input", routeId: route.id, input });
                                panelActions.updateRouteInput(route.id, input);
                            }}
                        >
                            Save Input
                        </button>
                    </div>
                </div>

                {review && (
                    <div className={`${styles.routeActionGroup} ${styles.routeActionRow} ${styles.routeReviewActions}`}>
                        <div className={`${styles.routeActionSlot} ${styles.routeReviewPrimarySlot}`}>
                            <button
                                type="button"
                                title={inModifyReview ? "Commit the edited route path using the safe revert-then-reapply pipeline." : "Accept the rebuild candidate and apply it using the safe revert-then-reapply pipeline."}
                                onClick={() => {
                                    logUiEvent("saved route review action clicked", { action: "accept", routeId: route.id, mode: review.mode });
                                    panelActions.acceptRouteReview(route.id);
                                }}
                            >
                                {inModifyReview ? "Commit Changes" : "Accept Rebuild"}
                            </button>
                        </div>
                        {inRebuildReview && (
                            <div className={`${styles.routeActionSlot} ${styles.routeReviewSecondarySlot}`}>
                                <button
                                    type="button"
                                    title="Load the rebuild candidate into the route editor so you can adjust the path before committing it."
                                    onClick={() => {
                                        logUiEvent("saved route review action clicked", { action: "modify from rebuild", routeId: route.id });
                                        panelActions.modifyRoute(route.id);
                                    }}
                                >
                                    Modify Path
                                </button>
                            </div>
                        )}
                        <div className={`${styles.routeActionSlot} ${styles.routeReviewSecondarySlot}`}>
                            <button
                                type="button"
                                title="Cancel this rebuild or modify review without changing the saved route."
                                onClick={() => {
                                    logUiEvent("saved route review action clicked", { action: "cancel", routeId: route.id, mode: review.mode });
                                    panelActions.cancelRouteReview(route.id);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                <div className={`${styles.routeActionGroup} ${styles.dangerActionGroup}`}>
                    <button
                        type="button"
                        title="Delete this saved route and revert its applied road changes."
                        disabled={!!review}
                        onClick={() => {
                            logUiEvent("saved route action clicked", { action: "delete", routeId: route.id });
                            panelActions.deleteRoute(route.id);
                        }}
                    >
                        Delete Saved Route
                    </button>
                </div>
            </article>
        </aside>
    );
}

function modeLabel(mode: string): string {
    if (mode === "RenameSelectedSegments") {
        return "Rename";
    }
    if (mode === "RemoveMajorRouteNumber") {
        return "Remove route number";
    }
    return "Route number";
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

function streetsFallback(route: SavedRoute): string {
    if (route.startRoadName && route.endRoadName && route.startRoadName !== route.endRoadName) {
        return `${route.startRoadName}, ${route.endRoadName}`;
    }

    return route.startRoadName || route.endRoadName || "No street snapshot";
}

function districtFallback(route: SavedRoute): string {
    if (route.startDistrictName && route.endDistrictName && route.startDistrictName !== route.endDistrictName) {
        return `${route.startDistrictName} - ${route.endDistrictName}`;
    }

    return route.startDistrictName || route.endDistrictName || "District data unavailable";
}
