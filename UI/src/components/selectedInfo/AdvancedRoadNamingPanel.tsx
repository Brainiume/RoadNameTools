import { ChangeEvent, ReactNode } from "react";
import { useValue } from "cs2/api";
import { FocusDisabled } from "cs2/input";
import { Button, Icon, Portal, Tooltip } from "cs2/ui";
import {
    advancedRoadNamingPanelOpen$,
    closeAdvancedRoadNamingPanel,
    panelActions,
} from "bindings";
import { usePanelState } from "hooks/usePanelState";
import {
    closeButtonClass,
    closeButtonImageClass,
    panelModule,
    selectedInfoThemeModule,
    selectedInfoWrapperClass,
} from "./selectedInfoPanelStyles";
import styles from "./advancedRoadNamingPanel.module.scss";

const undergroundIcon = "Media/Tools/Net Tool/Underground.svg";

interface SelectedInfoAdjacentPanelProps {
    header: string;
    icon: string;
    visible: boolean;
    children: ReactNode;
}

export function AdvancedRoadNamingPanel() {
    const visible = useValue(advancedRoadNamingPanelOpen$);
    const state = usePanelState();

    if (!visible || !state.inGame || !state.isOpen) {
        return null;
    }

    return (
        <SelectedInfoAdjacentPanel
            header="Advanced Road Naming"
            icon="coui://rst/PencilEdit.svg"
            visible={visible}
        >
            <AdvancedRoadNamingContent
                input={state.input}
                undergroundMode={state.undergroundMode}
                canUndo={state.waypointCount > 0}
                canClear={state.waypointCount > 0 || state.selectedSegments > 0 || !!state.input}
                canApply={state.selectedSegments > 0}
            />
        </SelectedInfoAdjacentPanel>
    );
}

function SelectedInfoAdjacentPanel(props: SelectedInfoAdjacentPanelProps) {
    if (!props.visible) {
        return null;
    }

    return (
        <Portal>
            <div className={styles.panelStack}>
                <div
                    id="rst-advanced-road-naming-panel"
                    className={`${selectedInfoWrapperClass} ${styles.panel}`}
                >
                    <div className={selectedInfoThemeModule.header}>
                        <div className={panelModule.titleBar}>
                            <img className={panelModule.icon} src={props.icon} />
                            <div className={selectedInfoThemeModule.title}>{props.header}</div>
                            <button className={closeButtonClass} onClick={closeAdvancedRoadNamingPanel}>
                                <div
                                    className={closeButtonImageClass}
                                    style={{ maskImage: "url(Media/Glyphs/Close.svg)" }}
                                />
                            </button>
                        </div>
                    </div>
                    <div className={selectedInfoThemeModule.content}>
                        <div className={styles.body}>{props.children}</div>
                    </div>
                </div>
            </div>
        </Portal>
    );
}

interface AdvancedRoadNamingContentProps {
    input: string;
    undergroundMode: boolean;
    canUndo: boolean;
    canClear: boolean;
    canApply: boolean;
}

function AdvancedRoadNamingContent(props: AdvancedRoadNamingContentProps) {
    const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        panelActions.setInput(event.currentTarget.value);
    };

    return (
        <div className={styles.content}>
            <label className={styles.field}>
                <span className={styles.fieldLabel}>Road Name</span>
                <div className={styles.inputLine}>
                    <input
                        className={styles.textInput}
                        type="text"
                        value={props.input}
                        onChange={onInputChange}
                    />
                    <FocusDisabled>
                        <Tooltip tooltip="Underground mode">
                            <Button
                                id="rst-road-depth-underground"
                                variant="flat"
                                className={`${styles.iconButton} ${props.undergroundMode ? styles.active : ""}`}
                                onSelect={() => panelActions.setUndergroundMode(!props.undergroundMode)}
                            >
                                <Icon src={undergroundIcon} />
                            </Button>
                        </Tooltip>
                    </FocusDisabled>
                </div>
            </label>
            <div className={styles.divider} />
            <FocusDisabled>
                <div className={styles.actions}>
                    <Button
                        variant="flat"
                        className={styles.actionButton}
                        disabled={!props.canUndo}
                        onSelect={panelActions.removeLast}
                    >
                        Undo Waypoint
                    </Button>
                    <Button
                        variant="flat"
                        className={styles.actionButton}
                        disabled={!props.canClear}
                        onSelect={panelActions.clear}
                    >
                        Clear
                    </Button>
                    <Button
                        variant="flat"
                        className={styles.actionButton}
                        disabled={!props.canApply}
                        onSelect={panelActions.apply}
                    >
                        Apply
                    </Button>
                </div>
            </FocusDisabled>
            <div className={styles.divider} />
            <section className={styles.instructionsSection}>
                <p>
                    Define your route by clicking to place waypoints, then choose your road name and apply it.
                </p>
            </section>
        </div>
    );
}
