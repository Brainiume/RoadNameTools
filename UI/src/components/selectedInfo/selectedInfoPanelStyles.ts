import { getModule } from "cs2/modding";

export const panelModule = getModule(
    "game-ui/common/panel/panel.module.scss",
    "classes",
);

export const selectedInfoThemeModule = getModule(
    "game-ui/game/themes/selected-info-panel.module.scss",
    "classes",
);

export const selectedInfoPanelModule = getModule(
    "game-ui/game/components/selected-info-panel/selected-info-panel.module.scss",
    "classes",
);

export const scrollableModule = getModule(
    "game-ui/common/scrolling/scrollable.module.scss",
    "classes",
);

export const iconButtonModule = getModule(
    "game-ui/common/input/button/icon-button.module.scss",
    "classes",
);

export const tintedIconModule = getModule(
    "game-ui/common/image/tinted-icon.module.scss",
    "classes",
);

export const roundHighlightButtonModule = getModule(
    "game-ui/common/input/button/themes/round-highlight-button.module.scss",
    "classes",
);

export const infoRowModule = getModule(
    "game-ui/game/components/selected-info-panel/shared-components/info-row/info-row.module.scss",
    "classes",
);

export const selectedInfoTextInputModule = getModule(
    "game-ui/game/components/selected-info-panel/shared-components/text-input/text-input.module.scss",
    "classes",
);

export const ellipsisTextInputModule = getModule(
    "game-ui/common/input/text/ellipsis-text-input/ellipsis-text-input.module.scss",
    "classes",
);

export const ellipsisTextInputThemeModule = getModule(
    "game-ui/common/input/text/ellipsis-text-input/themes/default.module.scss",
    "classes",
);

export const selectedInfoWrapperClass = `${panelModule.panel} ${selectedInfoPanelModule.selectedInfoPanel}`;
export const closeButtonClass = `${roundHighlightButtonModule.button} ${panelModule.closeButton}`;
export const closeButtonImageClass = `${tintedIconModule.tintedIcon} ${iconButtonModule.icon}`;
