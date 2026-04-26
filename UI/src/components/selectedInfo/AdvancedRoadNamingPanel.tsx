import { ReactNode } from "react";
import { useValue } from "cs2/api";
import { Portal } from "cs2/ui";
import { DelayedTooltip } from "components/DelayedTooltip";
import {
    advancedRoadNamingPanelKind$,
    advancedRoadNamingPanelOpen$,
    closeAdvancedRoadNamingPanel,
} from "bindings";
import { usePanelState } from "hooks/usePanelState";
import { useRoadSignsLocalization } from "localization";
import {
    closeButtonClass,
    closeButtonImageClass,
    panelModule,
    selectedInfoThemeModule,
    selectedInfoWrapperClass,
} from "./selectedInfoPanelStyles";
import { AdvancedRoadNamingContent } from "./AdvancedRoadNamingContent";
import { AdvancedRoadRoutesContent } from "./AdvancedRoadRoutesContent";
import styles from "./advancedRoadPanelShell.module.scss";

interface SelectedInfoAdjacentPanelProps {
    header: string;
    icon: string;
    visible: boolean;
    children: ReactNode;
}

export function AdvancedRoadNamingPanel() {
    const visible = useValue(advancedRoadNamingPanelOpen$);
    const panelKind = useValue(advancedRoadNamingPanelKind$);
    const state = usePanelState();

    if (!visible || !state.inGame || !state.isOpen) {
        return null;
    }

    const isRoutePanel = panelKind === "routes";

    return (
        <SelectedInfoAdjacentPanel
            header={isRoutePanel ? "Advanced Road Routes" : "Advanced Road Naming"}
            icon={isRoutePanel ? "coui://rst/Route.svg" : "coui://rst/PencilEdit.svg"}
            visible={visible}
        >
            {isRoutePanel ? (
                <AdvancedRoadRoutesContent
                    input={state.input}
                    mode={state.mode}
                    routeNumberPlacement={state.routeNumberPlacement}
                    savedRouteInputs={state.savedRoutes.map((route) => route.input)}
                    canUndo={state.waypointCount > 0}
                    canClear={state.waypointCount > 0 || state.selectedSegments > 0 || !!state.input}
                    canApply={state.selectedSegments > 0}
                />
            ) : (
                <AdvancedRoadNamingContent
                    input={state.input}
                    undergroundMode={state.undergroundMode}
                    canUndo={state.waypointCount > 0}
                    canClear={state.waypointCount > 0 || state.selectedSegments > 0 || !!state.input}
                    canApply={state.selectedSegments > 0}
                />
            )}
        </SelectedInfoAdjacentPanel>
    );
}

function SelectedInfoAdjacentPanel(props: SelectedInfoAdjacentPanelProps) {
    const { t } = useRoadSignsLocalization();

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
                            <DelayedTooltip tooltip={t("RoadSignsTools.UI[ClosePanelTooltip]")} direction="left">
                                <button className={closeButtonClass} onClick={closeAdvancedRoadNamingPanel}>
                                    <div
                                        className={closeButtonImageClass}
                                        style={{ maskImage: "url(Media/Glyphs/Close.svg)" }}
                                    />
                                </button>
                            </DelayedTooltip>
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
