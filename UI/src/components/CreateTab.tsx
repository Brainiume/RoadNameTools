import { ChangeEvent } from "react";
import { panelActions } from "bindings";
import { DelayedTooltip } from "components/DelayedTooltip";
import { useRoadSignsTools } from "context/RoadSignsToolsContext";
import { MODE_OPTIONS } from "constants";
import { RouteToolModeCommand } from "types";
import { RouteCodeControls } from "components/RouteCodeControls";
import { logUiEvent } from "diagnostics";
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
    const isRenameMode = state.mode === "RenameSelectedSegments";
    const canClear = state.selectedSegments > 0 || state.waypointCount > 0 || !!state.input;
    const canApply = state.selectedSegments > 0;

    const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        logUiEvent("road name changed", { value });
        panelActions.setInput(value);
    };

    return (
        <section className={styles.createTab} aria-label="Create route controls">
            <div className={styles.modeStack}>
                {MODE_OPTIONS.map((option) => (
                    <DelayedTooltip key={option.id} tooltip={modeTooltip(option.backendMode)}>
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
                            <strong>{option.label}</strong>
                        </button>
                    </DelayedTooltip>
                ))}
            </div>

            {isRenameMode ? (
                <label className={styles.field}>
                    <span className={styles.fieldLabel}>Road name</span>
                    <input
                        className={styles.textInput}
                        type="text"
                        value={state.input}
                        onChange={onInputChange}
                        aria-label="Road name"
                    />
                </label>
            ) : (
                <RouteCodeControls input={state.input} mode={state.mode} />
            )}

            <div className={styles.panelDivider} />

            <div className={styles.summaryRow} aria-label="Current route summary">
                <article className={styles.summaryCard}>
                    <span>Waypoints</span>
                    <strong>{state.waypointCount}</strong>
                </article>
                <article className={styles.summaryCard}>
                    <span>Segments</span>
                    <strong>{state.selectedSegments}</strong>
                </article>
            </div>

            <article className={styles.previewCard}>
                <span>Preview</span>
                <p>{state.previewText || "Base names preserved | Route code to apply: A12 |"}</p>
            </article>

            <footer className={styles.panelActions}>
                <DelayedTooltip tooltip="Remove the last committed waypoint from the current route.">
                    <button
                        className={styles.secondaryButton}
                        type="button"
                        disabled={state.waypointCount === 0}
                        onClick={() => {
                            logUiEvent("undo waypoint clicked", { waypointCount: state.waypointCount });
                            panelActions.removeLast();
                        }}
                    >
                        Undo Waypoint
                    </button>
                </DelayedTooltip>
                <DelayedTooltip tooltip="Clear the current route draft, including waypoints and input.">
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
                        Clear
                    </button>
                </DelayedTooltip>
                <DelayedTooltip tooltip="Apply the current route configuration to the selected route.">
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
                        Apply
                    </button>
                </DelayedTooltip>
            </footer>
        </section>
    );
}

function modeTooltip(mode: string): string {
    if (mode === "RenameSelectedSegments") {
        return "Rename the currently selected road segments.";
    }
    if (mode === "RemoveMajorRouteNumber") {
        return "Remove the configured route designation from the selected segments.";
    }
    return "Assign a major route number to the current route selection.";
}
