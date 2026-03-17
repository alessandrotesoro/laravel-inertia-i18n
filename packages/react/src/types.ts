import type { ElementType, ReactElement, ReactNode } from "react";

export interface I18nProps {
	locale: string;
	fallbackLocale: string;
	translations: Record<string, string>;
}

/**
 * Options passed to the `t()` function.
 *
 * All entries (including `count`) are forwarded as `:key` interpolation
 * replacements — Laravel's pluralisation syntax uses `:count` as a
 * standard placeholder (e.g. `":count items"`).
 */
export interface TranslationOptions {
	count?: number;
	[key: string]: string | number | undefined;
}

export type I18nContextValue = I18nProps;

export interface UseTranslationReturn {
	t: (key: string, options?: TranslationOptions) => string;
	locale: string;
	setLocale: (locale: string) => void;
}

export interface I18nProviderProps {
	children: ReactNode;
	propName?: string;
}

export interface TransProps {
	i18nKey: string;
	values?: Record<string, string | number>;
	count?: number;
	components?: Record<string, ReactElement>;
	as?: ElementType;
}
