import { ChangeEvent, useEffect, useState } from "react";
import { panelActions } from "bindings";
import { useRoadSignsTools } from "context/RoadSignsToolsContext";
import { logUiEvent } from "diagnostics";
import { useRoadSignsLocalization } from "localization";
import { SavedRoute } from "types";
import styles from "styles/panel.module.scss";

interface SavedRouteDetailsProps {
    route: SavedRoute;
}

export function SavedRouteDetails({ route }: SavedRouteDetailsProps) {
    const { state } = useRoadSignsTools();
    const { t } = useRoadSignsLocalization();
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
        <aside className={styles.routeDetails} aria-label={t("RoadSignsTools.UI[SelectedRouteDetailsAria]")}>
            <article className={styles.routeDetailCard}>
                <header className={styles.routeDetailHead}>
                    <div>
                        <span>{t("RoadSignsTools.UI[RouteDetails]")}</span>
                        <h3>{route.title || t("RoadSignsTools.UI[SavedRoute]")}</h3>
                    </div>
                    <span className={`${styles.statusPill} ${styles[`status${route.status}`]}`}>{statusLabel(route.status, t)}</span>
                </header>

                {review && (
                    <div className={`${styles.routeReviewBanner} ${inModifyReview ? styles.routeReviewBannerModify : styles.routeReviewBannerRebuild}`}>
                        <strong>{inModifyReview ? t("RoadSignsTools.UI[ModifyRoute]") : t("RoadSignsTools.UI[RebuildReview]")}</strong>
                        <p>{review.message || t("RoadSignsTools.UI[ReviewFallback]")}</p>
                        <span>
                            {t("RoadSignsTools.UI[ReviewWaypoints]")}: {review.candidateWaypoints} | {t("RoadSignsTools.UI[ReviewSegments]")}: {review.candidateSegments}
                            {review.dirty ? ` | ${t("RoadSignsTools.UI[ReviewUnsavedEdits]")}` : ""}
                        </span>
                    </div>
                )}

                <dl className={styles.routeMeta}>
                    <div>
                        <dt>{t("RoadSignsTools.UI[Input]")}</dt>
                        <dd>{route.routeCode || route.input || t("RoadSignsTools.UI[None]")}</dd>
                    </div>
                    <div>
                        <dt>{t("RoadSignsTools.UI[Mode]")}</dt>
                        <dd>{modeLabel(route.mode, t)}</dd>
                    </div>
                    <div>
                        <dt>{t("RoadSignsTools.UI[Geometry]")}</dt>
                        <dd>
                            {route.segments} {t("RoadSignsTools.UI[Segments]")}, {route.waypoints} {t("RoadSignsTools.UI[Waypoints]")}
                        </dd>
                    </div>
                    <div>
                        <dt>{t("RoadSignsTools.UI[Streets]")}</dt>
                        <dd>{route.streets || streetsFallback(route, t)}</dd>
                    </div>
                    <div>
                        <dt>{t("RoadSignsTools.UI[Districts]")}</dt>
                        <dd>{route.districtSummary || districtFallback(route, t)}</dd>
                    </div>
                </dl>

                <div className={styles.routeEditStack}>
                    <label>
                        <span>{t("RoadSignsTools.UI[Title]")}</span>
                        <input type="text" value={title} onChange={onTitleChange} aria-label={t("RoadSignsTools.UI[RouteTitleAria]")} />
                    </label>
                    <label>
                        <span>{t("RoadSignsTools.UI[RouteConfiguration]")}</span>
                        <input type="text" value={input} onChange={onInputChange} aria-label={t("RoadSignsTools.UI[RouteConfigurationAria]")} />
                    </label>
                </div>

                <div className={`${styles.routeActionGroup} ${styles.routeActionRow} ${styles.routeActionRowPrimary}`}>
                    <div className={`${styles.routeActionSlot} ${styles.routeActionSlotPrimary}`}>
                        <button
                            type="button"
                            title={t("RoadSignsTools.UI[PreviewSavedRouteTooltip]")}
                            disabled={!!review}
                            onClick={() => {
                                logUiEvent("saved route action clicked", { action: "preview", routeId: route.id });
                                panelActions.previewRoute(route.id);
                            }}
                        >
                            {t("RoadSignsTools.UI[Preview]")}
                        </button>
                    </div>
                    <div className={`${styles.routeActionSlot} ${styles.routeActionSlotPrimary}`}>
                        <button
                            type="button"
                            title={t("RoadSignsTools.UI[ReapplySavedRouteTooltip]")}
                            disabled={!!review}
                            onClick={() => {
                                logUiEvent("saved route action clicked", { action: "reapply", routeId: route.id });
                                panelActions.reapplyRoute(route.id);
                            }}
                        >
                            {t("RoadSignsTools.UI[Reapply]")}
                        </button>
                    </div>
                    <div className={`${styles.routeActionSlot} ${styles.routeActionSlotPrimary} ${styles.routeActionSlotPrimaryWide}`}>
                        <button
                            type="button"
                            title={t("RoadSignsTools.UI[EditRoadsTooltip]")}
                            disabled={!!review}
                            onClick={() => {
                                logUiEvent("saved route action clicked", { action: "edit roads", routeId: route.id });
                                panelActions.editRouteRoadNames(route.id);
                            }}
                        >
                            {t("RoadSignsTools.UI[EditRoads]")}
                        </button>
                    </div>
                </div>

                <div className={`${styles.routeActionGroup} ${styles.routeActionRow} ${styles.routeActionRowSecondary}`}>
                    <div className={`${styles.routeActionSlot} ${styles.routeActionSlotSecondary}`}>
                        <button
                            type="button"
                            title={t("RoadSignsTools.UI[RebuildTooltip]")}
                            disabled={!!review}
                            onClick={() => {
                                logUiEvent("saved route action clicked", { action: "rebuild", routeId: route.id });
                                panelActions.rebuildRoute(route.id);
                            }}
                        >
                            {t("RoadSignsTools.UI[Rebuild]")}
                        </button>
                    </div>
                    <div className={`${styles.routeActionSlot} ${styles.routeActionSlotSecondary}`}>
                        <button
                            type="button"
                            title={t("RoadSignsTools.UI[ModifyTooltip]")}
                            disabled={!!review}
                            onClick={() => {
                                logUiEvent("saved route action clicked", { action: "modify", routeId: route.id });
                                panelActions.modifyRoute(route.id);
                            }}
                        >
                            {t("RoadSignsTools.UI[Modify]")}
                        </button>
                    </div>
                    <div className={`${styles.routeActionSlot} ${styles.routeActionSlotSecondary}`}>
                        <button
                            type="button"
                            title={t("RoadSignsTools.UI[SaveTitleTooltip]")}
                            onClick={() => {
                                logUiEvent("saved route action clicked", { action: "save title", routeId: route.id, title });
                                panelActions.renameRoute(route.id, title);
                            }}
                        >
                            {t("RoadSignsTools.UI[SaveTitle]")}
                        </button>
                    </div>
                    <div className={`${styles.routeActionSlot} ${styles.routeActionSlotSecondary}`}>
                        <button
                            type="button"
                            title={t("RoadSignsTools.UI[SaveInputTooltip]")}
                            onClick={() => {
                                logUiEvent("saved route action clicked", { action: "save input", routeId: route.id, input });
                                panelActions.updateRouteInput(route.id, input);
                            }}
                        >
                            {t("RoadSignsTools.UI[SaveInput]")}
                        </button>
                    </div>
                </div>

                {review && (
                    <div className={`${styles.routeActionGroup} ${styles.routeActionRow} ${styles.routeReviewActions}`}>
                        <div className={`${styles.routeActionSlot} ${styles.routeReviewPrimarySlot}`}>
                            <button
                                type="button"
                                title={inModifyReview ? t("RoadSignsTools.UI[CommitChangesTooltip]") : t("RoadSignsTools.UI[AcceptRebuildTooltip]")}
                                onClick={() => {
                                    logUiEvent("saved route review action clicked", { action: "accept", routeId: route.id, mode: review.mode });
                                    panelActions.acceptRouteReview(route.id);
                                }}
                            >
                                {inModifyReview ? t("RoadSignsTools.UI[CommitChanges]") : t("RoadSignsTools.UI[AcceptRebuild]")}
                            </button>
                        </div>
                        {inRebuildReview && (
                            <div className={`${styles.routeActionSlot} ${styles.routeReviewSecondarySlot}`}>
                                <button
                                    type="button"
                                    title={t("RoadSignsTools.UI[ModifyPathTooltip]")}
                                    onClick={() => {
                                        logUiEvent("saved route review action clicked", { action: "modify from rebuild", routeId: route.id });
                                        panelActions.modifyRoute(route.id);
                                    }}
                                >
                                    {t("RoadSignsTools.UI[ModifyPath]")}
                                </button>
                            </div>
                        )}
                        <div className={`${styles.routeActionSlot} ${styles.routeReviewSecondarySlot}`}>
                            <button
                                type="button"
                                title={t("RoadSignsTools.UI[CancelReviewTooltip]")}
                                onClick={() => {
                                    logUiEvent("saved route review action clicked", { action: "cancel", routeId: route.id, mode: review.mode });
                                    panelActions.cancelRouteReview(route.id);
                                }}
                            >
                                {t("RoadSignsTools.UI[Cancel]")}
                            </button>
                        </div>
                    </div>
                )}

                <div className={`${styles.routeActionGroup} ${styles.dangerActionGroup}`}>
                    <button
                        type="button"
                        title={t("RoadSignsTools.UI[DeleteSavedRouteTooltip]")}
                        disabled={!!review}
                        onClick={() => {
                            logUiEvent("saved route action clicked", { action: "delete", routeId: route.id });
                            panelActions.deleteRoute(route.id);
                        }}
                    >
                        {t("RoadSignsTools.UI[DeleteSavedRoute]")}
                    </button>
                </div>
            </article>
        </aside>
    );
}

function modeLabel(mode: string, t: (key: string) => string): string {
    if (mode === "RenameSelectedSegments") {
        return t("RoadSignsTools.UI[ModeLabelRename]");
    }
    if (mode === "RemoveMajorRouteNumber") {
        return t("RoadSignsTools.UI[ModeLabelRemoveRouteNumber]");
    }
    return t("RoadSignsTools.UI[ModeLabelRouteNumber]");
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

function streetsFallback(route: SavedRoute, t: (key: string) => string): string {
    if (route.startRoadName && route.endRoadName && route.startRoadName !== route.endRoadName) {
        return `${route.startRoadName}, ${route.endRoadName}`;
    }

    return route.startRoadName || route.endRoadName || t("RoadSignsTools.UI[NoStreetSnapshot]");
}

function districtFallback(route: SavedRoute, t: (key: string) => string): string {
    if (route.startDistrictName && route.endDistrictName && route.startDistrictName !== route.endDistrictName) {
        return `${route.startDistrictName} - ${route.endDistrictName}`;
    }

    return route.startDistrictName || route.endDistrictName || t("RoadSignsTools.UI[DistrictDataUnavailable]");
}
