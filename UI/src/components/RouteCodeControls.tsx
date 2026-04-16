import { ChangeEvent } from "react";
import { panelActions } from "bindings";
import { PRESET_PREFIXES } from "constants";
import { DelayedTooltip } from "components/DelayedTooltip";
import { useRoadSignsTools } from "context/RoadSignsToolsContext";
import { logUiEvent } from "diagnostics";
import { normalizeToken, parseRouteCode, useRouteCodeDraft } from "hooks/useRouteCodeDraft";
import { useRoadSignsLocalization } from "localization";
import { PrefixType, RouteToolMode } from "types";
import styles from "styles/panel.module.scss";

interface RouteCodeControlsProps {
    input: string;
    mode: RouteToolMode;
}

export function RouteCodeControls({ input, mode }: RouteCodeControlsProps) {
    const { state } = useRoadSignsTools();
    const { t } = useRoadSignsLocalization();
    const { draft, updateDraft, composed } = useRouteCodeDraft(input);
    const label = mode === "RemoveMajorRouteNumber" ? t("RoadSignsTools.UI[RouteCodeToRemoveAria]") : t("RoadSignsTools.UI[RouteCodeToAssignAria]");
    const resultPreview = composed
        ? state.routeNumberPlacement === "BeforeBaseName"
            ? `${composed} - ${t("RoadSignsTools.UI[BaseNamePlaceholder]")}`
            : `${t("RoadSignsTools.UI[BaseNamePlaceholder]")} - ${composed}`
        : t("RoadSignsTools.UI[EnterRouteNumber]");

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
                <span className={styles.sectionLabel}>{t("RoadSignsTools.UI[RoutePrefix]")}</span>
                <div className={styles.prefixChipRow} aria-label={t("RoadSignsTools.UI[RoutePrefix]")}>
                    {PRESET_PREFIXES.map((prefix) => (
                        <DelayedTooltip key={prefix} tooltip={prefixDescription(prefix, t)}>
                            <button
                                className={`${styles.prefixChip} ${draft.prefixType === prefix ? styles.isActive : ""}`}
                                type="button"
                                onClick={() => setPrefix(prefix)}
                            >
                                {prefix}
                            </button>
                        </DelayedTooltip>
                    ))}
                    <DelayedTooltip tooltip={t("RoadSignsTools.UI[CustomPrefixTooltip]")}>
                        <button
                            className={[
                                styles.prefixChip,
                                styles.prefixChipWide,
                                draft.prefixType === "Custom" ? styles.isActive : "",
                            ].join(" ")}
                            type="button"
                            onClick={() => setPrefix("Custom")}
                        >
                            {t("RoadSignsTools.UI[Custom]")}
                        </button>
                    </DelayedTooltip>
                </div>
            </div>

            <div className={styles.routeControlBlock}>
                <span className={styles.sectionLabel}>{t("RoadSignsTools.UI[RoutePosition]")}</span>
                <div className={styles.routeNumberRow} aria-label={t("RoadSignsTools.UI[RouteNumberPlacementAria]")}>
                    <DelayedTooltip tooltip={t("RoadSignsTools.UI[PositionBeforeTooltip]")}>
                        <button
                            className={`${styles.numberModeButton} ${state.routeNumberPlacement === "BeforeBaseName" ? styles.isActive : ""}`}
                            type="button"
                            onClick={() => {
                                logUiEvent("route number placement changed", { placement: "BeforeBaseName" });
                                panelActions.setRouteNumberPlacement("BeforeBaseName");
                            }}
                        >
                            {t("RoadSignsTools.UI[PositionBefore]")}
                        </button>
                    </DelayedTooltip>
                    <DelayedTooltip tooltip={t("RoadSignsTools.UI[PositionAfterTooltip]")}>
                        <button
                            className={`${styles.numberModeButton} ${state.routeNumberPlacement === "AfterBaseName" ? styles.isActive : ""}`}
                            type="button"
                            onClick={() => {
                                logUiEvent("route number placement changed", { placement: "AfterBaseName" });
                                panelActions.setRouteNumberPlacement("AfterBaseName");
                            }}
                            style={{ marginLeft: "8rem" }}
                        >
                            {t("RoadSignsTools.UI[PositionAfter]")}
                        </button>
                    </DelayedTooltip>
                </div>
            </div>

            <label
                className={`${styles.compactField} ${draft.prefixType === "Custom" ? styles.isVisible : ""}`}
                aria-hidden={draft.prefixType !== "Custom"}
            >
                <span className={styles.sectionLabel}>{t("RoadSignsTools.UI[CustomPrefix]")}</span>
                <input
                    className={styles.textInput}
                    type="text"
                    value={draft.customPrefix}
                    onChange={setCustomPrefix}
                    aria-label={t("RoadSignsTools.UI[CustomRoutePrefixAria]")}
                    disabled={draft.prefixType !== "Custom"}
                    tabIndex={draft.prefixType === "Custom" ? 0 : -1}
                />
            </label>

            <div className={styles.routeControlBlock}>
                <span className={styles.sectionLabel}>{t("RoadSignsTools.UI[RouteNumber]")}</span>
                <div className={styles.routeNumberRow}>
                    <DelayedTooltip tooltip={t("RoadSignsTools.UI[AutoRouteNumberTooltip]")}>
                        <button className={`${styles.numberModeButton} ${styles.isActive}`} type="button" aria-pressed="true" onClick={useAutoNumber}>
                            {t("RoadSignsTools.UI[Auto]")}
                        </button>
                    </DelayedTooltip>
                    <input
                        className={styles.routeNumberInput}
                        type="text"
                        value={draft.numberPart}
                        onChange={setNumber}
                        aria-label={t("RoadSignsTools.UI[CustomRouteNumberAria]")}
                        placeholder={t("RoadSignsTools.UI[Custom]")}
                    />
                </div>
            </div>

            <div className={styles.routeControlBlock}>
                <span className={styles.sectionLabel}>{t("RoadSignsTools.UI[Result]")}</span>
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

function prefixDescription(prefix: string, t: (key: string) => string): string {
    if (prefix === "M") {
        return t("RoadSignsTools.UI[PrefixDescriptionM]");
    }
    if (prefix === "A") {
        return t("RoadSignsTools.UI[PrefixDescriptionA]");
    }
    if (prefix === "B") {
        return t("RoadSignsTools.UI[PrefixDescriptionB]");
    }

    return t("RoadSignsTools.UI[PrefixDescriptionC]");
}
