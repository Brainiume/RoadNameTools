import { trigger } from "cs2/api";
import { FocusDisabled } from "cs2/input";
import { PanelSection, PanelSectionRow } from "cs2/ui";
import { openAdvancedRoadNamingPanel } from "bindings";
import { ICON_SRC, NATIVE_GROUP } from "constants";
import { VC, VF } from "components/vanilla/Components";
import styles from "./roadSelectionInfoSection.module.scss";

interface RoadSelectionInfoSectionProps {
    segmentIndex: number;
    roadName: string;
    routeNumbers: string;
    hasRoadSignsData: boolean;
}

export const extendRoadSelectionInfoSection = (componentList: Record<string, any>) => {
    componentList["RoadSignsTools.Systems.RoadSelectionInfoSectionSystem"] = RoadSelectionInfoSection;
    return componentList;
};

function RoadSelectionInfoSection(props: RoadSelectionInfoSectionProps) {
    const click = (action: "roadName" | "routeNumber") => {
        trigger(NATIVE_GROUP, "SelectedRoadInfoButtonClicked", action);
    };

    return (
        <>
            <PanelSection>
                <PanelSectionRow
                    uppercase={true}
                    disableFocus={true}
                    left="Road Naming Tools"
                    right={
                        <FocusDisabled>
                            <div className={styles.headerActions}>
                                <VC.ToolButton
                                    id="rst-selected-road-name"
                                    focusKey={VF.FOCUS_AUTO}
                                    src="coui://rst/PencilEdit.svg"
                                    tooltip="Advanced Road Naming"
                                    onSelect={openAdvancedRoadNamingPanel}
                                />
                                <VC.ToolButton
                                    id="rst-selected-route-number"
                                    focusKey={VF.FOCUS_AUTO}
                                    src="coui://rst/Route.svg"
                                    tooltip="Major Route Creation"
                                    onSelect={() => click("routeNumber")}
                                />
                            </div>
                        </FocusDisabled>
                    }
                />
            </PanelSection>
            <PanelSection>
                <PanelSectionRow
                    disableFocus={true}
                    left={
                        <span className={styles.roadSummary}>
                           {/* <img className={styles.logo} src={ICON_SRC} /> */}
                            <span>{props.roadName || `Road segment ${props.segmentIndex}`}</span>
                        </span>
                    }
                    right={props.routeNumbers || "No route"}
                    tooltip={props.hasRoadSignsData ? `This road is apart of the ${props.routeNumbers} route` : "This road is not apart of any routes"}
                />
            </PanelSection>
        </>
    );
}
