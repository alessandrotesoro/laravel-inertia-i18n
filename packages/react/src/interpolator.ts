/**
 * Interpolates Laravel-style :attribute placeholders in a translation string.
 *
 * Supports three case variants:
 * - :name  → replacement as-is
 * - :Name  → first letter uppercased (ucfirst)
 * - :NAME  → entire replacement uppercased
 */
export function interpolate(
	str: string,
	replacements?: Record<string, string | number>,
): string {
	if (!replacements || Object.keys(replacements).length === 0) {
		return str;
	}

	return str.replace(/:([A-Za-z_]\w*)/g, (match, placeholder) => {
		const lower = placeholder.toLowerCase();

		// Direct match (exact case in replacements)
		if (Object.prototype.hasOwnProperty.call(replacements, placeholder)) {
			return String(replacements[placeholder]);
		}

		// Case-insensitive lookup
		if (Object.prototype.hasOwnProperty.call(replacements, lower)) {
			const value = String(replacements[lower]);

			// :NAME → UPPERCASE
			// Length > 1 guard: a single char like :A is ambiguous (could be
			// ucfirst or uppercase). We treat it as ucfirst to match Laravel.
			if (placeholder === placeholder.toUpperCase() && placeholder.length > 1) {
				return value.toUpperCase();
			}

			// :Name → Ucfirst
			if (
				placeholder[0] === placeholder[0].toUpperCase() &&
				placeholder.slice(1) === placeholder.slice(1).toLowerCase()
			) {
				return value.charAt(0).toUpperCase() + value.slice(1);
			}

			return value;
		}

		// No match found — return original placeholder
		return match;
	});
}
