import React, { useState } from "react";
import { Button, Tooltip } from "cs2/ui";
import { RoadSignsToolsApp } from "app";
import { ICON_SRC } from "constants";
import { useRoadSignsLocalization } from "localization";
import styles from "./editor.module.scss";

export const Editor = () => {
    const [enabled, setIsEnabled] = useState(false);
    const { t } = useRoadSignsLocalization();

    return (
        <>
            <div className={styles.buttonWrapper}>
                <Tooltip tooltip={t("RoadSignsTools.UI[LauncherTooltip]")} delayTime={0} direction="down">
                    <Button
                        variant="floating"
                        onSelect={() => setIsEnabled(!enabled)}
                        src={ICON_SRC}
                    />
                </Tooltip>
            </div>
            <div className={styles.editorWrapper}>
                {enabled && <RoadSignsToolsApp />}
            </div>
        </>
    );
};
