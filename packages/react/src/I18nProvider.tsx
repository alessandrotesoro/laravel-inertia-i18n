import { usePage } from "@inertiajs/react";
import { createContext, useEffect, useMemo } from "react";
import type { I18nContextValue, I18nProps, I18nProviderProps } from "./types";

export const I18nContext = createContext<I18nContextValue | null>(null);

function isI18nProps(value: unknown): value is I18nProps {
	return (
		typeof value === "object" &&
		value !== null &&
		"locale" in value &&
		"fallbackLocale" in value &&
		"translations" in value
	);
}

/**
 * Provides i18n context to the component tree.
 *
 * Reads translation data from Inertia page props (shared by the Laravel ServiceProvider)
 * and makes it available to useTranslation() and <Trans />.
 *
 * @example
 * ```tsx
 * // In your app layout or createInertiaApp setup:
 * <I18nProvider>
 *   <App />
 * </I18nProvider>
 * ```
 */
export function I18nProvider({
	children,
	propName = "i18n",
}: I18nProviderProps) {
	const pageProps = usePage().props as Record<string, unknown>;
	const i18nProps = isI18nProps(pageProps[propName])
		? pageProps[propName]
		: undefined;

	useEffect(() => {
		if (process.env.NODE_ENV !== "production" && !i18nProps) {
			console.warn(
				`[I18nProvider] No "${propName}" prop found in Inertia page props. ` +
					"Make sure InertiaI18nServiceProvider is registered and auto_share is enabled.",
			);
		}
	}, [i18nProps, propName]);

	const value = useMemo<I18nContextValue>(
		() => ({
			locale: i18nProps?.locale ?? "",
			fallbackLocale: i18nProps?.fallbackLocale ?? "",
			translations: i18nProps?.translations ?? {},
		}),
		[i18nProps?.locale, i18nProps?.fallbackLocale, i18nProps?.translations],
	);

	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
