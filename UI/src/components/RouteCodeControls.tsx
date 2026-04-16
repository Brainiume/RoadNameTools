import { ChangeEvent } from "react";
import { panelActions } from "bindings";
import { PRESET_PREFIXES } from "constants";
import { DelayedTooltip } from "components/DelayedTooltip";
import { useRoadSignsTools } from "context/RoadSignsToolsContext";
import { logUiEvent } from "diagnostics";
import { normalizeToken, parseRouteCode, useRouteCodeDraft } from "hooks/useRouteCodeDraft";
import { PrefixType, RouteToolMode } from "types";
import styles from "styles/panel.module.scss";

interface RouteCodeControlsProps {
    input: string;
    mode: RouteToolMode;
}

const ROUTE_PREFIX_DESCRIPTIONS: Record<string, string> = {
    M: "Motorway / Highway - Carries the most traffic in your city. High-speed, limited-access roads.",
    A: "A-Road - Major arterial road connecting districts and suburbs. High traffic volume.",
    B: "B-Road - Secondary road serving as an alternative to A-roads. Moderate traffic volume.",
    C: "C-Road - Minor road connecting smaller points of interest. Low to moderate traffic.",
};

export function RouteCodeControls({ input, mode }: RouteCodeControlsProps) {
    const { state } = useRoadSignsTools();
    const { draft, updateDraft, composed } = useRouteCodeDraft(input);
    const label = mode === "RemoveMajorRouteNumber" ? "Route code to remove" : "Route code to assign";
    const resultPreview = composed
        ? state.routeNumberPlacement === "BeforeBaseName"
            ? `${composed} - Base name`
            : `Base name - ${composed}`
        : "Enter a route number";

    const setPrefix = (prefixType: PrefixType) => {
        const nextDraft = { ...draft, prefixType };
        logUiEvent("prefix selected", { prefixType, composed: normalizeToken(`${prefixType}${draft.numberPart}`) });
        updateDraft(nextDraft);
    };

    const setCustomPrefix = (event: ChangeEvent<HTMLInputElement>) => {
        const customPrefix = normalizeToken(event.target.value);
        logUiEvent("custom prefix changed", { customPrefix });
        updateDraft({ ...draft, prefixType: "Custom", customPrefix });
    };

    const setNumber = (event: ChangeEvent<HTMLInputElement>) => {
        const numberPart = normalizeToken(event.target.value);
        logUiEvent("route number changed", { numberPart });
        updateDraft({ ...draft, numberPart });
    };

    const useAutoNumber = () => {
        const numberPart = nextRouteNumberForPrefix(draft.prefixType, draft.customPrefix, state.savedRoutes.map((route) => route.input));
        logUiEvent("auto route number clicked", { currentNumber: draft.numberPart, nextNumber: numberPart });
        updateDraft({ ...draft, numberPart });
    };

    return (
        <section className={styles.routeCodeGroup} aria-label={label}>
            <div className={styles.routeControlBlock}>
                <span className={styles.sectionLabel}>Route Prefix</span>
                <div className={styles.prefixChipRow} aria-label="Route prefix">
                    {PRESET_PREFIXES.map((prefix) => (
                        <DelayedTooltip key={prefix} tooltip={ROUTE_PREFIX_DESCRIPTIONS[prefix]}>
                            <button
                                className={`${styles.prefixChip} ${draft.prefixType === prefix ? styles.isActive : ""}`}
                                type="button"
                                onClick={() => setPrefix(prefix)}
                            >
                                {prefix}
                            </button>
                        </DelayedTooltip>
                    ))}
                    <DelayedTooltip tooltip="Use a custom route prefix that you type yourself.">
                        <button
                            className={[
                                styles.prefixChip,
                                styles.prefixChipWide,
                                draft.prefixType === "Custom" ? styles.isActive : "",
                            ].join(" ")}
                            type="button"
                            onClick={() => setPrefix("Custom")}
                        >
                            Custom
                        </button>
                    </DelayedTooltip>
                </div>
            </div>

            <div className={styles.routeControlBlock}>
                <span className={styles.sectionLabel}>Route Position</span>
                <div className={styles.routeNumberRow} aria-label="Route number placement">
                    <DelayedTooltip tooltip="Show the route number before the road name, for example M1 - Northern Hwy.">
                        <button
                            className={`${styles.numberModeButton} ${state.routeNumberPlacement === "BeforeBaseName" ? styles.isActive : ""}`}
                            type="button"
                            onClick={() => {
                                logUiEvent("route number placement changed", { placement: "BeforeBaseName" });
                                panelActions.setRouteNumberPlacement("BeforeBaseName");
                            }}
                        >
                            Before
                        </button>
                    </DelayedTooltip>
                    <DelayedTooltip tooltip="Show the route number after the road name, for example Northern Hwy - M1.">
                        <button
                            className={`${styles.numberModeButton} ${state.routeNumberPlacement === "AfterBaseName" ? styles.isActive : ""}`}
                            type="button"
                            onClick={() => {
                                logUiEvent("route number placement changed", { placement: "AfterBaseName" });
                                panelActions.setRouteNumberPlacement("AfterBaseName");
                            }}
                            style={{ marginLeft: "8rem" }}
                        >
                            After
                        </button>
                    </DelayedTooltip>
                </div>
            </div>

            <label
                className={`${styles.compactField} ${draft.prefixType === "Custom" ? styles.isVisible : ""}`}
                aria-hidden={draft.prefixType !== "Custom"}
            >
                <span className={styles.sectionLabel}>Custom Prefix</span>
                <input
                    className={styles.textInput}
                    type="text"
                    value={draft.customPrefix}
                    onChange={setCustomPrefix}
                    aria-label="Custom route prefix"
                    disabled={draft.prefixType !== "Custom"}
                    tabIndex={draft.prefixType === "Custom" ? 0 : -1}
                />
            </label>

            <div className={styles.routeControlBlock}>
                <span className={styles.sectionLabel}>Route Number</span>
                <div className={styles.routeNumberRow}>
                    <DelayedTooltip tooltip="Pick the next available route number for the selected prefix.">
                        <button className={`${styles.numberModeButton} ${styles.isActive}`} type="button" aria-pressed="true" onClick={useAutoNumber}>
                            Auto
                        </button>
                    </DelayedTooltip>
                    <input
                        className={styles.routeNumberInput}
                        type="text"
                        value={draft.numberPart}
                        onChange={setNumber}
                        aria-label="Custom route number"
                        placeholder="Custom"
                    />
                </div>
            </div>

            <div className={styles.routeControlBlock}>
                <span className={styles.sectionLabel}>Result</span>
                <div className={styles.resultField}>{resultPreview}</div>
            </div>
        </section>
    );
}

function nextRouteNumberForPrefix(prefixType: PrefixType, customPrefix: string, routeInputs: string[]): string {
    const targetPrefix = prefixType === "Custom" ? normalizeToken(customPrefix) : prefixType;
    if (!targetPrefix) {
        return "1";
    }

    let highestNumber = 0;
    routeInputs.forEach((routeInput) => {
        const parsed = parseRouteCode(routeInput);
        const parsedPrefix = parsed.prefixType === "Custom" ? normalizeToken(parsed.customPrefix) : parsed.prefixType;
        const parsedNumber = Number(normalizeToken(parsed.numberPart));
        if (parsedPrefix === targetPrefix && Number.isFinite(parsedNumber) && parsedNumber > highestNumber) {
            highestNumber = parsedNumber;
        }
    });

    return (highestNumber + 1).toString();
}
