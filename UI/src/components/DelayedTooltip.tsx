import React, { ReactElement } from "react";
import { Tooltip } from "cs2/ui";

interface DelayedTooltipProps {
    tooltip: string;
    children: ReactElement;
    direction?: "up" | "down" | "left" | "right";
}

const TOOLTIP_DELAY_MS = 1500;

export function DelayedTooltip({ tooltip, children, direction = "down" }: DelayedTooltipProps) {
    return (
        <Tooltip tooltip={tooltip} delayTime={TOOLTIP_DELAY_MS} direction={direction}>
            {children}
        </Tooltip>
    );
}
