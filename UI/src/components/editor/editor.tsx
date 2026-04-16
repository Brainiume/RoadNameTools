import React, { useState } from "react";
import { Button, Tooltip } from "cs2/ui";
import { RoadSignsToolsApp } from "app";
import { ICON_SRC } from "constants";
import styles from "./editor.module.scss";

export const Editor = () => {
    const [enabled, setIsEnabled] = useState(false);

    return (
        <>
            <div className={styles.buttonWrapper}>
                <Tooltip tooltip={`Road Signs Tools`} delayTime={0} direction="down">
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
