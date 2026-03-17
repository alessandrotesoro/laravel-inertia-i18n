import { interpolate } from "./interpolator";
import { pluralize } from "./pluralizer";
import type { TranslationOptions } from "./types";

/**
 * Combines key lookup, pluralization (via count option), and interpolation.
 */
export function translate(
	translations: Record<string, string>,
	key: string,
	options?: TranslationOptions,
): string {
	let raw = translations[key] ?? key;

	if (options?.count !== undefined && raw.includes("|")) {
		raw = pluralize(raw, options.count);
	}

	// All options (including `count`) are passed as :key replacements
	// because `:count` is a standard Laravel placeholder.
	if (!options) {
		return raw;
	}

	const replacements: Record<string, string | number> = {};
	for (const [k, v] of Object.entries(options)) {
		if (v !== undefined) {
			replacements[k] = v;
		}
	}

	return interpolate(raw, replacements);
}
