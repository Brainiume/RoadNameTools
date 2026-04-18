import { ModRegistrar, ModuleRegistry } from "cs2/modding";
import { initialize } from "components/vanilla/Components";
import { Wrapper } from "components/wrapper/wrapper";
import { RoadSignsToolsApp } from "app";


const register: ModRegistrar = (moduleRegistry: ModuleRegistry) => {
    initialize(moduleRegistry);
    moduleRegistry.append("GameTopLeft", Wrapper);
    moduleRegistry.append("Game", RoadSignsToolsApp);
};

export default register;
