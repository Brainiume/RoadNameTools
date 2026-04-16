import { ModRegistrar, ModuleRegistry } from "cs2/modding";
import { initialize } from "components/vanilla/Components";
import { Wrapper } from "components/wrapper/wrapper";


const register: ModRegistrar = (moduleRegistry: ModuleRegistry) => {
    initialize(moduleRegistry);
    moduleRegistry.append("GameTopLeft", Wrapper);
};

export default register;
