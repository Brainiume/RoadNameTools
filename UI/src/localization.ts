import { useLocalization } from "cs2/l10n";
import fallbackLocale from "lang/en-US.json";

type LocaleDictionary = Record<string, string>;

export const UI_KEYS = fallbackLocale as LocaleDictionary;

export function useRoadSignsLocalization() {
    const { translate } = useLocalization();

    const t = (key: string): string => translate(key, UI_KEYS[key] ?? key) ?? UI_KEYS[key] ?? key;

    return { t };
}
