import { useContext } from "react";
import { I18nContext } from "./I18nProvider";
import type { I18nContextValue } from "./types";

/**
 * Internal hook that reads the I18nContext and throws a descriptive error
 * when used outside an <I18nProvider>.
 */
export function useI18nContext(caller: string): I18nContextValue {
	const ctx = useContext(I18nContext);
	if (!ctx) {
		throw new Error(
			`${caller} must be used within an <I18nProvider>. ` +
				"Wrap your app or layout with <I18nProvider> to provide translation context.",
		);
	}
	return ctx;
}
