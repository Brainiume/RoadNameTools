import { ChangeEvent } from "react";
import { panelActions } from "bindings";
import { DelayedTooltip } from "components/DelayedTooltip";
import { useRoadSignsTools } from "context/RoadSignsToolsContext";
import { MODE_OPTIONS } from "constants";
import { RouteToolModeCommand } from "types";
import { RouteCodeControls } from "components/RouteCodeControls";
import { logUiEvent } from "diagnostics";
import { useRoadSignsLocalization } from "localization";
import styles from "styles/panel.module.scss";

function commandForBackendMode(backendMode: string): RouteToolModeCommand {
    if (backendMode === "RenameSelectedSegments") {
        return "rename";
    }
    if (backendMode === "RemoveMajorRouteNumber") {
        return "remove";
    }
    return "assign";
}

export function CreateTab() {
    const { state } = useRoadSignsTools();
    const { t } = useRoadSignsLocalization();
    const isRenameMode = state.mode === "RenameSelectedSegments";
    const canClear = state.selectedSegments > 0 || state.waypointCount > 0 || !!state.input;
    const canApply = state.selectedSegments > 0;

    const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        logUiEvent("road name changed", { value });
        panelActions.setInput(value);
    };

    return (
        <section className={styles.createTab} aria-label={t("RoadSignsTools.UI[CreateRouteControlsAria]")}>
            <div className={styles.modeStack}>
                {MODE_OPTIONS.map((option) => (
                    <DelayedTooltip key={option.id} tooltip={modeTooltip(option.backendMode, t)}>
                        <button
                            className={[
                                styles.modeCard,
                                option.id === "assign" ? styles.modeCardRight : "",
                                option.id === "remove" ? styles.modeCardWide : "",
                                state.mode === option.backendMode ? styles.isSelected : "",
                            ].join(" ")}
                            type="button"
                            onClick={() => {
                                const mode = commandForBackendMode(option.backendMode);
                                logUiEvent("mode selected", { mode, backendMode: option.backendMode });
                                panelActions.setMode(mode);
                            }}
                        >
                            <strong>{modeLabel(option.backendMode, t)}</strong>
                        </button>
                    </DelayedTooltip>
                ))}
            </div>

            {isRenameMode ? (
                <label className={styles.field}>
                    <span className={styles.fieldLabel}>{t("RoadSignsTools.UI[RoadName]")}</span>
                    <input
                        className={styles.textInput}
                        type="text"
                        value={state.input}
                        onChange={onInputChange}
                        aria-label={t("RoadSignsTools.UI[RoadName]")}
                    />
                </label>
            ) : (
                <RouteCodeControls input={state.input} mode={state.mode} />
            )}

            <div className={styles.panelDivider} />

            <div className={styles.summaryRow} aria-label={t("RoadSignsTools.UI[CurrentRouteSummaryAria]")}>
                <article className={styles.summaryCard}>
                    <span>{t("RoadSignsTools.UI[Waypoints]")}</span>
                    <strong>{state.waypointCount}</strong>
                </article>
                <article className={styles.summaryCard}>
                    <span>{t("RoadSignsTools.UI[Segments]")}</span>
                    <strong>{state.selectedSegments}</strong>
                </article>
            </div>

            <article className={styles.previewCard}>
                <span>{t("RoadSignsTools.UI[Preview]")}</span>
                <p>{state.previewText || t("RoadSignsTools.UI[PreviewFallback]")}</p>
            </article>

            <footer className={styles.panelActions}>
                <DelayedTooltip tooltip={t("RoadSignsTools.UI[UndoWaypointTooltip]")}>
                    <button
                        className={styles.secondaryButton}
                        type="button"
                        disabled={state.waypointCount === 0}
                        onClick={() => {
                            logUiEvent("undo waypoint clicked", { waypointCount: state.waypointCount });
                            panelActions.removeLast();
                        }}
                    >
                        {t("RoadSignsTools.UI[UndoWaypoint]")}
                    </button>
                </DelayedTooltip>
                <DelayedTooltip tooltip={t("RoadSignsTools.UI[ClearTooltip]")}>
                    <button
                        className={styles.secondaryButton}
                        type="button"
                        disabled={!canClear}
                        onClick={() => {
                            logUiEvent("clear clicked", {
                                input: state.input,
                                selectedSegments: state.selectedSegments,
                                waypointCount: state.waypointCount,
                            });
                            panelActions.clear();
                        }}
                    >
                        {t("RoadSignsTools.UI[Clear]")}
                    </button>
                </DelayedTooltip>
                <DelayedTooltip tooltip={t("RoadSignsTools.UI[ApplyTooltip]")}>
                    <button
                        className={styles.primaryButton}
                        type="button"
                        disabled={!canApply}
                        onClick={() => {
                            logUiEvent("apply clicked", {
                                input: state.input,
                                mode: state.mode,
                                selectedSegments: state.selectedSegments,
                                waypointCount: state.waypointCount,
                            });
                            panelActions.apply();
                        }}
                    >
                        {t("RoadSignsTools.UI[Apply]")}
                    </button>
                </DelayedTooltip>
            </footer>
        </section>
    );
}

function modeLabel(mode: string, t: (key: string) => string): string {
    if (mode === "RenameSelectedSegments") {
        return t("RoadSignsTools.UI[ModeRename]");
    }
    if (mode === "RemoveMajorRouteNumber") {
        return t("RoadSignsTools.UI[ModeRemove]");
    }

    return t("RoadSignsTools.UI[ModeAssign]");
}

function modeTooltip(mode: string, t: (key: string) => string): string {
    if (mode === "RenameSelectedSegments") {
        return t("RoadSignsTools.UI[ModeRenameTooltip]");
    }
    if (mode === "RemoveMajorRouteNumber") {
        return t("RoadSignsTools.UI[ModeRemoveTooltip]");
    }
    return t("RoadSignsTools.UI[ModeAssignTooltip]");
}
