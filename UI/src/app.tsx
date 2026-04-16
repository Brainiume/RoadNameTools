import { useEffect } from "react";
import { panelActions } from "bindings";
import { RoadSignsToolsProvider } from "context/RoadSignsToolsContext";
import { logUiEvent } from "diagnostics";
import { usePanelState } from "hooks/usePanelState";
import { PanelShell } from "components/PanelShell";
import styles from "styles/panel.module.scss";

export function RoadSignsToolsApp() {
    const state = usePanelState();

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key.toLowerCase() === "q") {
                event.preventDefault();
                logUiEvent("ctrl+q pressed");
                panelActions.togglePanel();
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, []);

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
