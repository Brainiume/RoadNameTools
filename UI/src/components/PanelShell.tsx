import { panelActions } from "bindings";
import { useRoadSignsTools } from "context/RoadSignsToolsContext";
import { CreateTab } from "components/CreateTab";
import { DelayedTooltip } from "components/DelayedTooltip";
import { SavedRouteDetails } from "components/SavedRouteDetails";
import { SavedRoutesCollapsedRail } from "components/SavedRoutesCollapsedRail";
import { SavedRoutesTab } from "components/SavedRoutesTab";
import { logUiEvent } from "diagnostics";
import styles from "styles/panel.module.scss";

export function PanelShell() {
    const { activeTab, selectedRouteId, setActiveTab, setSelectedRouteId, state } = useRoadSignsTools();
    const selectedRoute = activeTab === "saved" ? state.savedRoutes.find((route) => route.id === selectedRouteId) ?? null : null;
    const activeReview = state.routeReview && selectedRoute && state.routeReview.routeId === selectedRoute.id ? state.routeReview : null;
    const roadNameEditRoute = state.roadNameEditRouteId
        ? state.savedRoutes.find((route) => route.id === state.roadNameEditRouteId) ?? null
        : null;
    const roadNameEditIdentifier = roadNameEditRoute?.routeCode || roadNameEditRoute?.input || roadNameEditRoute?.title || "route";

    if (state.roadNameEditRouteId) {
        return (
            <div className={styles.compactReturnPanel}>
                <button
                    className={styles.compactReturnButton}
                    type="button"
                    onClick={() => {
                        logUiEvent("return to saved routes clicked", { routeId: state.roadNameEditRouteId });
                        panelActions.returnToSavedRoutes();
                        setActiveTab("saved");
                        if (state.roadNameEditRouteId) {
                            setSelectedRouteId(state.roadNameEditRouteId);
                        }
                    }}
                >
                    Return to Saved Routes
                </button>
                {roadNameEditRoute && <p className={styles.compactReturnLabel}>Editing road names for {roadNameEditIdentifier}</p>}
            </div>
        );
    }

    if (activeTab === "saved" && selectedRoute) {
        return (
            <div className={`${styles.panelWorkspace} ${styles.savedWorkspace} ${styles.savedWorkspaceSelected}`}>
                <SavedRoutesCollapsedRail
                    routes={state.savedRoutes}
                    selectedRouteId={selectedRoute.id}
                    onBack={() => {
                        if (activeReview) {
                            panelActions.cancelRouteReview(selectedRoute.id);
                        }

                        setSelectedRouteId(null);
                    }}
                    onSelectRoute={(routeId) => {
                        if (activeReview && routeId !== selectedRoute.id) {
                            panelActions.cancelRouteReview(selectedRoute.id);
                        }

                        setSelectedRouteId(routeId);
                    }}
                />
                <div className={styles.savedDetailWorkspace}>
                    <SavedRouteDetails key={selectedRoute.id} route={selectedRoute} />
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.panelWorkspace} ${activeTab === "saved" ? styles.savedWorkspace : ""}`}>
            <section className={styles.panel} aria-label="Road Signs Tools panel">
                <header className={styles.panelHeader}>
                    <div className={styles.panelHeading}>
                        <h2>{activeTab === "saved" ? "Road Signs Tools" : "Road Name Tools"}</h2>
                        <p>Route creation and saved route manager</p>
                    </div>
                    <DelayedTooltip tooltip="Close the Road Signs Tools panel." direction="left">
                        <button
                            className={styles.iconButton}
                            type="button"
                            aria-label="Close panel"
                            onClick={() => {
                                logUiEvent("close clicked");
                                panelActions.cancel();
                            }}
                        >
                            x
                        </button>
                    </DelayedTooltip>
                </header>

                <nav className={styles.tabSwitch} aria-label="Road Signs Tools tabs">
                    <DelayedTooltip tooltip="Route creation">
                        <button
                            className={`${styles.tabButton} ${activeTab === "create" ? styles.isActive : ""}`}
                            type="button"
                            onClick={() => {
                                logUiEvent("tab clicked", { tab: "create" });
                                panelActions.activate();
                                setActiveTab("create");
                            }}
                        >
                            Create
                        </button>
                    </DelayedTooltip>
                    <DelayedTooltip tooltip="Open saved routes and route-management actions.">
                        <button
                            className={`${styles.tabButton} ${activeTab === "saved" ? styles.isActive : ""}`}
                            type="button"
                            onClick={() => {
                                logUiEvent("tab clicked", { tab: "saved" });
                                panelActions.showSavedRoutes();
                                setActiveTab("saved");
                            }}
                        >
                            Saved Routes
                        </button>
                    </DelayedTooltip>
                </nav>

                <div key={activeTab} className={styles.tabPanel}>{activeTab === "create" ? <CreateTab /> : <SavedRoutesTab />}</div>

                {state.statusMessage && <p className={styles.statusLine}>{state.statusMessage}</p>}
            </section>
        </div>
    );
}
