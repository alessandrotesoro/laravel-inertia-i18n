import { router } from "@inertiajs/react";
import { useCallback } from "react";
import { translate } from "./translator";
import type { TranslationOptions, UseTranslationReturn } from "./types";
import { useI18nContext } from "./useI18nContext";

/**
 * Primary hook for consuming translations in React components.
 *
 * Returns a unified `t()` function that handles both simple translations
 * and pluralization (auto-detected when `count` option is present).
 *
 * @example
 * ```tsx
 * const { t, locale, setLocale } = useTranslation();
 *
 * t('Welcome!');
 * t('Hello, :name!', { name: 'Alessandro' });
 * t('One apple|:count apples', { count: 5 });
 * t('{0} No items|{1} One item|[2,*] :count items', { count: 3 });
 *
 * setLocale('es');
 * ```
 */
export function useTranslation(): UseTranslationReturn {
	const ctx = useI18nContext("useTranslation");

	const t = useCallback(
		(key: string, options?: TranslationOptions): string => {
			return translate(ctx.translations, key, options);
		},
		[ctx.translations],
	);

	const setLocale = useCallback((locale: string) => {
		router.reload({
			data: { _locale: locale },
		});
	}, []);

	return { t, locale: ctx.locale, setLocale };
}
