import { useEffect, useState } from "react";
import { ValueBinding } from "cs2/api";

export function useBindingValue<T>(binding: ValueBinding<T>, fallbackValue: T): T {
    const [value, setValue] = useState<T>(() => {
        try {
            return binding.value ?? fallbackValue;
        } catch {
            return fallbackValue;
        }
    });

    useEffect(() => {
        try {
            const subscription = binding.subscribe(setValue);
            setValue(subscription.value ?? fallbackValue);
            return () => subscription.dispose();
        } catch {
            setValue(fallbackValue);
            return undefined;
        }
    }, [binding, fallbackValue]);

    return value;
}
