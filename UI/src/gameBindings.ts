import { NATIVE_GROUP } from "constants";
import { TwoWayBinding } from "utils/twoWayBinding";



export const GAME_BINDINGS = {
    PANEL_OPEN: new TwoWayBinding<boolean>("PANEL_OPEN", false, NATIVE_GROUP),
    IN_GAME: new TwoWayBinding<boolean>("IN_GAME", false, NATIVE_GROUP),
    SHOW_LAUNCHER: new TwoWayBinding<boolean>("SHOW_LAUNCHER", true, NATIVE_GROUP),
};
