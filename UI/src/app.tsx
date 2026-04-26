import { useValue } from "cs2/api";
import { advancedRoadNamingPanelOpen$ } from "bindings";
import { RoadSignsToolsProvider } from "context/RoadSignsToolsContext";
import { usePanelState } from "hooks/usePanelState";
import { PanelShell } from "components/PanelShell";
import styles from "styles/panel.module.scss";

export function RoadSignsToolsApp() {
    const state = usePanelState();
    const advancedRoadNamingPanelOpen = useValue(advancedRoadNamingPanelOpen$);

    if (!state.inGame || !state.isOpen || advancedRoadNamingPanelOpen) {
        return null;
    }

    return (
        <RoadSignsToolsProvider state={state}>
            <div className={styles.appLayer}>
                <PanelShell />
            </div>
        </RoadSignsToolsProvider>
    );
}
