import React from "react";
import styles from "./wrapper.module.scss";
import { Button, Tooltip } from "cs2/ui";
import { useValue } from "cs2/api";
import { RoadSignsToolsApp } from "app";
import { ICON_SRC } from "constants";
import { GAME_BINDINGS } from "gameBindings";
import { useRoadSignsLocalization } from "localization";

export const Wrapper = () => {
    const panelOpenBinding = useValue(GAME_BINDINGS.PANEL_OPEN.binding);
    const inGameBinding = useValue(GAME_BINDINGS.IN_GAME.binding);
    const showLauncherBinding = useValue(GAME_BINDINGS.SHOW_LAUNCHER.binding);
    const { t } = useRoadSignsLocalization();

    return (
        <>
            {inGameBinding && showLauncherBinding && (
                <Tooltip tooltip={t("RoadSignsTools.UI[LauncherTooltip]")} delayTime={0} direction="down">
                    <Button
                        variant="floating"
                        onSelect={() => GAME_BINDINGS.PANEL_OPEN.set(!panelOpenBinding)}
                        src={ICON_SRC}
                    />
                </Tooltip>
            )}
            <div className={styles.wrapper}>
                <RoadSignsToolsApp />
            </div>
        </>
    );
};
