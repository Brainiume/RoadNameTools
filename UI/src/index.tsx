import { ModRegistrar, ModuleRegistry } from "cs2/modding";
import { initialize } from "components/vanilla/Components";
import { Wrapper } from "components/wrapper/wrapper";
import { RoadSignsToolsApp } from "app";
import { extendRoadSelectionInfoSection } from "components/selectedInfo/RoadSelectionInfoSection";
import { AdvancedRoadNamingPanel } from "components/selectedInfo/AdvancedRoadNamingPanel";


const register: ModRegistrar = (moduleRegistry: ModuleRegistry) => {
    initialize(moduleRegistry);
    moduleRegistry.extend(
        "game-ui/game/components/selected-info-panel/selected-info-sections/selected-info-sections.tsx",
        "selectedInfoSectionComponents",
        extendRoadSelectionInfoSection as any,
    );
    moduleRegistry.append("GameTopLeft", Wrapper);
    moduleRegistry.append("Game", RoadSignsToolsApp);
    moduleRegistry.append("Game", AdvancedRoadNamingPanel);
};

export default register;
