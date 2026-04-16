import { RoadSignsToolsProvider } from "context/RoadSignsToolsContext";
import { usePanelState } from "hooks/usePanelState";
import { PanelShell } from "components/PanelShell";
import styles from "styles/panel.module.scss";

export function RoadSignsToolsApp() {
    const state = usePanelState();

    if (!state.inGame || !state.isOpen) {
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
