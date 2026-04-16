import { useEffect, useState } from "react";
import { ValueBinding } from "cs2/api";

export function useBindingValue<T>(binding: ValueBinding<T>, fallbackValue: T): T {
    const [value, setValue] = useState<T>(() => {
        try {
            return binding.value ?? fallbackValue;
        } catch (error) {
            console.warn("[RoadSignsTools] Binding value unavailable; using fallback.", error);
            return fallbackValue;
        }
    });

    useEffect(() => {
        try {
            const subscription = binding.subscribe(setValue);
            setValue(subscription.value ?? fallbackValue);
            return () => subscription.dispose();
        } catch (error) {
            console.warn("[RoadSignsTools] Binding subscription unavailable; using fallback.", error);
            setValue(fallbackValue);
            return undefined;
        }
    }, [binding, fallbackValue]);

    return value;
}
