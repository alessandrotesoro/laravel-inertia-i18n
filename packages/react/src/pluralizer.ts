/**
 * Resolves Laravel's pipe-delimited pluralization syntax.
 *
 * Supports three formats:
 * 1. Explicit values:  {0} None|{1} One|{2} Two
 * 2. Ranges:           [0,1] Few|[2,*] Many
 * 3. Simple two-form:  One item|:count items
 *
 * Resolution order:
 * 1. Explicit {N} matches (exact count)
 * 2. Range [min,max] matches (inclusive)
 * 3. Simple positional (index 0 for count=1, last for everything else)
 */
export function pluralize(str: string, count: number): string {
	const segments = str.split("|");

	if (segments.length === 1) {
		return segments[0].trim();
	}

	// Pass 1: Check explicit {N} values and [min,max] ranges
	for (const segment of segments) {
		const trimmed = segment.trim();

		// Explicit value: {N}
		const explicitMatch = trimmed.match(/^\{(\d+)\}\s*(.+?)$/);
		if (explicitMatch) {
			if (parseInt(explicitMatch[1], 10) === count) {
				return explicitMatch[2].trim();
			}
			continue;
		}

		// Range: [min,max] or [min,*]
		const rangeMatch = trimmed.match(/^\[(\d+),\s*(\d+|\*)\]\s*(.+?)$/);
		if (rangeMatch) {
			const min = parseInt(rangeMatch[1], 10);
			const max =
				rangeMatch[2] === "*" ? Infinity : parseInt(rangeMatch[2], 10);
			if (count >= min && count <= max) {
				return rangeMatch[3].trim();
			}
		}
	}

	// Pass 2: Simple positional fallback (no explicit/range markers found)
	// Strip any markers from segments for clean output
	const cleanSegments = segments.map((s) => {
		const trimmed = s.trim();
		// Remove leading {N} or [min,max] if present
		const cleaned = trimmed
			.replace(/^\{\d+\}\s*/, "")
			.replace(/^\[\d+,\s*(?:\d+|\*)\]\s*/, "");
		return cleaned.trim();
	});

	// For simple two-form: count === 1 → first, else → last
	if (count === 1) {
		return cleanSegments[0];
	}

	return cleanSegments[cleanSegments.length - 1];
}
